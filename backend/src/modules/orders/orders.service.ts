import { Prisma, OrderStatus, PaymentMethod } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import {
  createNotFoundError,
  createForbiddenError,
  createBusinessError,
  createValidationError,
} from '../../types/error';
import { generateOrderNumber, paginate, getSkip } from '../../utils/helpers';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CartItemInput[];
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  notes?: string;
}

export interface CreateVnpayPaymentResult {
  order: Awaited<ReturnType<OrdersService['createOrder']>>;
  paymentUrl: string;
}

export interface VerifyVnpayReturnResult {
  orderId?: string;
  success: boolean;
  message: string;
}

export interface ListOrdersQuery {
  page: number;
  limit: number;
  status?: OrderStatus;
  userId?: string;
}

// ─── State machine ────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ─── Selects ──────────────────────────────────────────────────────────────────

const ORDER_LIST_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  totalPrice: true,
  paymentMethod: true,
  recipientName: true,
  recipientPhone: true,
  recipientAddress: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  confirmedAt: true,
  shippingAt: true,
  completedAt: true,
  cancelledAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      productPrice: true,
      productImage: true,
      quantity: true,
      subtotal: true,
    },
  },
} as const;

const ORDER_DETAIL_SELECT = {
  ...ORDER_LIST_SELECT,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
} as const;

// ─── Service ──────────────────────────────────────────────────────────────────

export class OrdersService {
  private ensureVnpayConfig() {
    if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
      throw createValidationError(
        'VNPAY is not configured. Please set VNPAY_TMN_CODE and VNPAY_HASH_SECRET.',
      );
    }
  }

  private sortAndSignVnpayParams(params: Record<string, string>) {
    const sortedKeys = Object.keys(params).sort();
    
    // Build payload the exact way VNPAY expects (key=value&key2=value2...)
    const payload = sortedKeys
      .map((key) => {
        const value = params[key];
        // For numeric parameters like amount, don't encode
        if (key === 'vnp_Amount') {
          return `${key}=${value}`;
        }
        // For URLs and other values, use standard encoding
        return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
      })
      .join('&');

    logger.debug(`[VNPAY] Payload to sign:`, payload);

    const secureHash = crypto
      .createHmac('sha512', env.VNPAY_HASH_SECRET!)
      .update(Buffer.from(payload, 'utf-8'))
      .digest('hex');

    logger.debug(`[VNPAY] Secure hash generated`, { 
      hashLength: secureHash.length,
      hashType: 'sha512'
    });

    return { payload, secureHash };
  }

  private formatVnpDate(date = new Date()) {
    // VNPAY requires Vietnam Standard Time (UTC+7) regardless of server timezone
    const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const yyyy = vnTime.getUTCFullYear();
    const MM = `${vnTime.getUTCMonth() + 1}`.padStart(2, '0');
    const dd = `${vnTime.getUTCDate()}`.padStart(2, '0');
    const hh = `${vnTime.getUTCHours()}`.padStart(2, '0');
    const mm = `${vnTime.getUTCMinutes()}`.padStart(2, '0');
    const ss = `${vnTime.getUTCSeconds()}`.padStart(2, '0');
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  }

  private buildVnpayPaymentUrl(order: { id: string; orderNumber: string; totalPrice: Prisma.Decimal }, ipAddress: string) {
    this.ensureVnpayConfig();

    // Fixed: Use Math.floor instead of toFixed to ensure integer string
    const amount = Math.floor(order.totalPrice.toNumber() * 100).toString();
    const nowDate = new Date();
    const createDate = this.formatVnpDate(nowDate);
    const expireDate = this.formatVnpDate(new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000));

    // Use orderNumber as TxnRef instead of order.id for better VNPAY compatibility
    const txnRef = order.orderNumber || order.id;

    // Detailed timestamp logging for debugging
    logger.info(`[VNPAY] Timestamp Debug for order ${order.id}`, {
      serverNow: new Date().toISOString(),
      serverTimestamp: Date.now(),
      createDateFormatted: createDate,
      expireDateFormatted: expireDate,
      expireDurationMinutes: env.VNPAY_EXPIRE_DURATION,
      expireDurationMs: env.VNPAY_EXPIRE_DURATION * 60 * 1000,
      calculatedExpireTime: new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000).toISOString(),
      timezone: process.env.TZ || 'not set',
    });

    logger.info(`[VNPAY] Building payment URL for order ${order.id}`, {
      orderNumber: order.orderNumber,
      amount,
      amountType: typeof amount,
      expireDuration: env.VNPAY_EXPIRE_DURATION,
      createDate,
      expireDate,
      txnRef,
      currentTime: new Date().toISOString(),
    });

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE!,
      vnp_Amount: amount,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: env.VNPAY_RETURN_URL,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    logger.debug(`[VNPAY] Payment parameters before hashing:`, params);
    const { payload, secureHash } = this.sortAndSignVnpayParams(params);
    logger.debug(`[VNPAY] Signed payload:`, { payload, secureHash });
    
    const paymentUrl = `${env.VNPAY_URL}?${payload}&vnp_SecureHash=${secureHash}`;
    logger.info(`[VNPAY] Payment URL created: ${paymentUrl}`);
    
    return paymentUrl;
  }

  // ─── Cart validation ──────────────────────────────────────────────────────

  private async validateAndPriceCart(items: CartItemInput[]) {
    const validatedItems: Array<{
      productId: string;
      productName: string;
      productPrice: Prisma.Decimal;
      productImage: string | null;
      quantity: number;
      subtotal: Prisma.Decimal;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' }, select: { thumbnailUrl: true, imageUrl: true } },
        },
      });

      if (!product) {
        throw createNotFoundError(`Product (${item.productId})`);
      }

      const subtotal = product.price.mul(item.quantity);

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images[0]?.thumbnailUrl ?? product.images[0]?.imageUrl ?? null,
        quantity: item.quantity,
        subtotal,
      });
    }

    const totalPrice = validatedItems.reduce(
      (acc, i) => acc.add(i.subtotal),
      new Prisma.Decimal(0),
    );

    return { validatedItems, totalPrice };
  }

  // ─── Create order ─────────────────────────────────────────────────────────

  async createOrder(userId: string, dto: CreateOrderDto) {
    const { validatedItems, totalPrice } = await this.validateAndPriceCart(dto.items);

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId,
          orderNumber,
          status: 'PENDING',
          totalPrice,
          paymentMethod: dto.paymentMethod as PaymentMethod,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          recipientAddress: dto.recipientAddress,
          notes: dto.notes,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              productImage: item.productImage,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
        select: ORDER_LIST_SELECT,
      });
    });

    return order;
  }

  async createOrderWithVnpay(userId: string, dto: CreateOrderDto, ipAddress: string): Promise<CreateVnpayPaymentResult> {
    const order = await this.createOrder(userId, {
      ...dto,
      paymentMethod: 'BANK_TRANSFER',
    });
    const paymentUrl = this.buildVnpayPaymentUrl(
      { id: order.id, orderNumber: order.orderNumber, totalPrice: new Prisma.Decimal(order.totalPrice) },
      ipAddress,
    );

    logger.info(`[VNPAY] Payment URL created successfully for order ${order.id}`);

    return { order, paymentUrl };
  }

  async verifyVnpayReturn(query: Record<string, string | undefined>): Promise<VerifyVnpayReturnResult> {
    this.ensureVnpayConfig();

    const secureHash = query.vnp_SecureHash;
    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;

    if (!secureHash || !orderId || !responseCode) {
      logger.error(`[VNPAY] Missing return parameters for order ${orderId}`, { query });
      throw createValidationError('Missing VNPAY return parameters');
    }

    logger.info(`[VNPAY] Verifying payment return for order ${orderId}`, {
      responseCode,
      currentTime: new Date().toISOString(),
    });

    const paramsToSign: Record<string, string> = {};
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (!value || key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') return;
      paramsToSign[key] = value;
    });

    const { secureHash: expectedHash } = this.sortAndSignVnpayParams(paramsToSign);
    if (expectedHash !== secureHash) {
      logger.warn(`[VNPAY] Invalid secure hash for order ${orderId}`);
      return {
        orderId,
        success: false,
        message: 'Chữ ký VNPAY không hợp lệ',
      };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      logger.error(`[VNPAY] Order not found: ${orderId}`);
      return {
        orderId,
        success: false,
        message: 'Không tìm thấy đơn hàng',
      };
    }

    if (responseCode === '00') {
      if (order.status === 'PENDING') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED', confirmedAt: new Date() },
        });
        logger.info(`[VNPAY] Order ${orderId} confirmed successfully`);
      }

      return {
        orderId: order.id,
        success: true,
        message: 'Thanh toán thành công',
      };
    }

    logger.warn(`[VNPAY] Payment failed for order ${orderId} with code ${responseCode}`);

    return {
      orderId: order.id,
      success: false,
      message: `Thanh toán thất bại (Mã lỗi: ${responseCode})`,
    };
  }

  // ─── Get order by ID ──────────────────────────────────────────────────────

  async getOrderById(orderId: string, requestUserId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: ORDER_DETAIL_SELECT,
    });

    if (!order) throw createNotFoundError('Order');

    // Non-admins can only see their own orders
    if (!isAdmin && order.user.id !== requestUserId) {
      throw createForbiddenError('You do not have access to this order');
    }

    return order;
  }

  // ─── List orders (user) ───────────────────────────────────────────────────

  async listMyOrders(userId: string, query: Omit<ListOrdersQuery, 'userId'>) {
    return this._listOrders({ ...query, userId });
  }

  // ─── List all orders (admin) ──────────────────────────────────────────────

  async listAllOrders(query: ListOrdersQuery) {
    return this._listOrders(query);
  }

  // ─── Update order status (admin) ──────────────────────────────────────────

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createNotFoundError('Order');

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw createBusinessError(
        `Cannot transition order from ${order.status} to ${newStatus}. Allowed: ${allowed.length ? allowed.join(', ') : 'none'}`,
      );
    }

    const timestampField: Record<string, keyof typeof order> = {
      CONFIRMED: 'confirmedAt',
      SHIPPING: 'shippingAt',
      COMPLETED: 'completedAt',
      CANCELLED: 'cancelledAt',
    };

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          ...(timestampField[newStatus] ? { [timestampField[newStatus]]: new Date() } : {}),
        },
        select: ORDER_DETAIL_SELECT,
      });

      // Side effect: increment soldCount on each product when order is COMPLETED
      if (newStatus === 'COMPLETED') {
        for (const item of result.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { soldCount: { increment: item.quantity } },
            });
          }
        }
      }

      return result;
    });

    return updated;
  }

  // ─── Cancel order (user) ──────────────────────────────────────────────────

  async cancelMyOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createNotFoundError('Order');

    if (order.userId !== userId) {
      throw createForbiddenError('You do not have access to this order');
    }

    if (!VALID_TRANSITIONS[order.status].includes('CANCELLED')) {
      throw createBusinessError(
        `Cannot cancel an order with status ${order.status}`,
      );
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      select: ORDER_LIST_SELECT,
    });
  }

  // ─── Internal list helper ─────────────────────────────────────────────────

  private async _listOrders(query: ListOrdersQuery) {
    const { page, limit, status, userId } = query;
    const skip = getSkip(page, limit);

    const where: Prisma.OrderWhereInput = {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: ORDER_LIST_SELECT,
      }),
      prisma.order.count({ where }),
    ]);

    return paginate(orders, total, page, limit);
  }
}
