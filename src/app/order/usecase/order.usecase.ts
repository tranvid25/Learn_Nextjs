import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PrismaService } from 'src/infra/database/prisma.service';
import { randomBytes } from 'node:crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_QUEUE, MAIL_JOBS } from 'src/infra/mail/mail.constants';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrderUseCase {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  private generateOrderCode(): string {
    return 'ORD-' + randomBytes(4).toString('hex').toUpperCase();
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch products to validate and get prices
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'One or more products in the order do not exist',
      );
    }

    let totalPrice = 0;
    const orderItemsRecord = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = product.price;
      const quantity = item.quantity;
      totalPrice += price * quantity;

      return {
        productId: item.productId,
        quantity: quantity,
        price: price, // store historical price
      };
    });

    const paymentMethod =
      totalPrice > 150 ? PaymentMethod.STRIPE : PaymentMethod.COD;
    const orderCode = this.generateOrderCode();

    const newOrder = await this.orderService.create({
      ...orderData,
      orderCode,
      totalPrice,
      // Connect user if userId is provided
      ...(orderData.userId && { user: { connect: { id: orderData.userId } } }),
      items: {
        create: orderItemsRecord,
      },
      payments: {
        create: [
          {
            method: paymentMethod,
            amount: totalPrice,
            status: PaymentStatus.PENDING,
          },
        ],
      },
    });

    try {
      await this.mailQueue.add(MAIL_JOBS.SEND_ORDER, {
        name: orderData.name,
        email: orderData.email,
        orderCode,
        totalPrice,
        paymentMethod:
          paymentMethod === PaymentMethod.STRIPE
            ? 'Online (Stripe)'
            : 'Thanh toán khi nhận hàng (COD)',
      });
    } catch (e) {
      console.error('Failed to queue order email', e);
    }

    return newOrder;
  }

  async getAllOrders() {
    return this.orderService.findAll();
  }

  async getOrderById(id: number) {
    return this.orderService.findById(id);
  }

  async updateOrderStatus(id: number, updateOrderDto: UpdateOrderDto) {
    await this.orderService.findById(id); // verify exists
    return this.orderService.update(id, { status: updateOrderDto.status });
  }

  async deleteOrder(id: number) {
    await this.orderService.findById(id); // verify exists
    // Delete associated OrderItems first
    await this.prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    return this.orderService.remove(id);
  }
}
