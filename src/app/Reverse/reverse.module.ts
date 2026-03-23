import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReverseController } from './reverse.controller';
import { ReverseUseCase } from './usecase/reverse.usecase';
import { ReverseService } from './reverse.service';
import { MailModule } from 'src/infra/mail/mail.module';
import { MAIL_QUEUE } from 'src/infra/mail/mail.constants';

@Module({
  imports: [MailModule, BullModule.registerQueue({ name: MAIL_QUEUE })],
  controllers: [ReverseController],
  providers: [ReverseService, ReverseUseCase],
  exports: [ReverseService, ReverseUseCase],
})
export class ReverseModule {}
