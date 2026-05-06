import { Prisma, OrderStatus, PaymentMethod } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  createNotFoundError,
  createForbiddenError,
  createBusinessError,
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
