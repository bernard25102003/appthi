import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { mailer, senderInfo } from "../../config/mailer";
import { AppError } from "../../middlewares/error.middleware";
import type { PaymentMethod } from "@prisma/client";

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${dateStr}-${suffix}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export async function createOrder(
  userId: string,
  data: {
    addressId: string;
    items: { productId: string; quantity: number }[];
    promotionCode?: string;
    paymentMethod: PaymentMethod;
    note?: string;
  }
) {
  // Validate address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId },
  });
  if (!address) throw new AppError(404, "Address not found");

  // Fetch & validate all products
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    throw new AppError(400, "One or more products not found or unavailable");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Build order items and calculate subtotal
  const orderItems = data.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      productName: product.name,
      productImage: product.imageUrl ?? null,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = 20000;
  let discountAmount = 0;
  let promotionId: string | undefined;

  // Apply promotion if provided
  if (data.promotionCode) {
    const promo = await prisma.promotion.findUnique({
      where: { code: data.promotionCode },
    });

    if (!promo || !promo.isActive) throw new AppError(400, "Invalid or expired promotion code");
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new AppError(400, "Promotion code has expired");
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit)
      throw new AppError(400, "Promotion code usage limit reached");
    if (subtotal < promo.minOrderValue)
      throw new AppError(400, `Minimum order value for this promotion is ${formatCurrency(promo.minOrderValue)}`);

    if (promo.discountType === "PERCENT") {
      discountAmount = Math.floor((subtotal * promo.discountValue) / 100);
      if (promo.maxDiscount !== null) discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      discountAmount = promo.discountValue;
    }

    promotionId = promo.id;
  }

  const total = subtotal + shippingFee - discountAmount;
  const deliveryAddress = `${address.street}${address.ward ? ", " + address.ward : ""}, ${address.district}, ${address.city}`;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: data.addressId,
        promotionId: promotionId ?? null,
        subtotal,
        shippingFee,
        discountAmount,
        total,
        paymentMethod: data.paymentMethod,
        deliveryName: address.fullName,
        deliveryPhone: address.phone,
        deliveryAddress,
        note: data.note ?? null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Increment promotion usage count
    if (promotionId) {
      await tx.promotion.update({
        where: { id: promotionId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  // Send confirmation email
  if (user) {
    const itemsHtml = orderItems
      .map((i) => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td></tr>`)
      .join("");

    await mailer
      .sendMail({
        from: `"${senderInfo.name}" <${senderInfo.email}>`,
        to: user.email,
        subject: `Xác nhận đơn hàng #${order.orderNumber}`,
        html: `
        <h2>Xác nhận đơn hàng</h2>
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Đơn hàng <strong>#${order.orderNumber}</strong> của bạn đã được tiếp nhận.</p>
        <table border="1" cellpadding="8" style="border-collapse:collapse;">
          <thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p>Tạm tính: ${formatCurrency(subtotal)}</p>
        <p>Phí giao hàng: ${formatCurrency(shippingFee)}</p>
        ${discountAmount > 0 ? `<p>Giảm giá: -${formatCurrency(discountAmount)}</p>` : ""}
        <p><strong>Tổng cộng: ${formatCurrency(total)}</strong></p>
        <p>Địa chỉ giao hàng: ${deliveryAddress}</p>
        <p>Cảm ơn bạn đã đặt hàng!</p>
      `,
      })
      .catch((e) => console.error("Order email failed:", e));
  }

  return order;
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      promotion: { select: { code: true, discountType: true, discountValue: true } },
    },
  });
}

export async function getOrderById(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: true,
      address: true,
      promotion: { select: { code: true, discountType: true, discountValue: true } },
    },
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
}

export async function cancelOrder(id: string, userId: string) {
  const order = await prisma.order.findFirst({ where: { id, userId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.status !== "PENDING") throw new AppError(400, "Only PENDING orders can be cancelled");

  return prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
}
