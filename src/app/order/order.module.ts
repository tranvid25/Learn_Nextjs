import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderUseCase } from './usecase/order.usecase';
import { DatabaseModule } from 'src/infra/database/database.module';
import { MailModule } from 'src/infra/mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { MAIL_QUEUE } from 'src/infra/mail/mail.constants';

@Module({
  imports: [
    DatabaseModule,
    MailModule,
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderUseCase],
})
export class OrderModule {}
