import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  MailService,
  ReservationMailData,
  OrderMailData,
} from './mail.service';
import { MAIL_QUEUE, MAIL_JOBS } from './mail.constants';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing job "${job.name}" for ${job.data.email}`);

    switch (job.name) {
      case MAIL_JOBS.SEND_RESERVATION:
        await this.mailService.sendReservationMail(
          job.data as ReservationMailData,
        );
        break;
      case MAIL_JOBS.SEND_ORDER:
        await this.mailService.sendOrderMail(job.data as OrderMailData);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
