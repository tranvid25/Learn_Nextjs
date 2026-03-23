import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateReverseDto } from '../dto/create-reverse.dto';
import { UpdateReverseDto } from '../dto/update-reverse.dto';
import { ReverseService } from '../reverse.service';
import { MAIL_QUEUE, MAIL_JOBS } from 'src/infra/mail/mail.constants';
import { ReservationMailData } from 'src/infra/mail/mail.service';
import { minutes } from 'src/common/utils/time.util';

@Injectable()
export class ReverseUseCase {
  constructor(
    private readonly reverseService: ReverseService,
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  async createReverse(createReverseDto: CreateReverseDto) {
    const reservation =
      await this.reverseService.createReverse(createReverseDto);
    const jobData: ReservationMailData = {
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      datetime: reservation.datetime.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      party: reservation.party,
      message: reservation.message ?? undefined,
    };

    await this.mailQueue.add(MAIL_JOBS.SEND_RESERVATION, jobData, {
      delay: minutes(1),
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return reservation;
  }

  async findAllReverse() {
    return this.reverseService.findAllReverse();
  }

  async findByIdReverse(id: number) {
    return this.reverseService.findByIdReverse(id);
  }

  async updateReverse(id: number, updateReverseDto: UpdateReverseDto) {
    return this.reverseService.updateReverse(id, updateReverseDto);
  }

  async removeReverse(id: number) {
    return this.reverseService.removeReverse(id);
  }
}
