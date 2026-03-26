import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ReservationMailData {
  name: string;
  email: string;
  phone: string;
  datetime: string;
  party: number;
  message?: string;
}

export interface OrderMailData {
  name: string;
  email: string;
  orderCode: string;
  totalPrice: number;
  paymentMethod: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: false, // STARTTLS (port 587)
      auth: {
        user: this.config.getOrThrow<string>('MAIL_USERNAME'),
        pass: this.config.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  private renderTemplate(
    templateName: string,
    data: Record<string, string | number>,
  ): string {
    const templatePath = join(
      process.cwd(),
      'src',
      'infra',
      'mail',
      'templates',
      `${templateName}.html`,
    );

    let html = readFileSync(templatePath, 'utf8');

    // Replace all {{key}} placeholders
    for (const [key, value] of Object.entries(data)) {
      html = html.split(`{{${key}}}`).join(String(value ?? ''));
    }

    return html;
  }

  async sendReservationMail(data: ReservationMailData): Promise<void> {
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'Restaurant');
    const fromAddress = this.config.getOrThrow<string>('MAIL_FROM_ADDRESS');

    const html = this.renderTemplate('reservation', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      datetime: data.datetime,
      party: data.party,
      message: data.message ?? 'Không có',
      fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${data.name}" <${data.email}>`,
        subject: '✅ Xác nhận đặt bàn thành công',
        html,
      });
      this.logger.log(`Reservation confirmation email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send reservation email to ${data.email}`,
        error,
      );
      throw error;
    }
  }

  async sendOrderMail(data: OrderMailData): Promise<void> {
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'Restaurant');
    const fromAddress = this.config.getOrThrow<string>('MAIL_FROM_ADDRESS');

    const html = this.renderTemplate('order', {
      name: data.name,
      email: data.email,
      orderCode: data.orderCode,
      totalPrice: data.totalPrice,
      paymentMethod: data.paymentMethod,
      fromName,
    });

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${data.name}" <${data.email}>`,
        subject: `✅ Xác nhận đặt hàng thành công - ${data.orderCode}`,
        html,
      });
      this.logger.log(`Order confirmation email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send order email to ${data.email}`, error);
      throw error;
    }
  }
}
