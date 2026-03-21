import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { RatingUseCase } from './usecase/rating.usecase';

@Module({
  controllers: [RatingController],
  providers: [RatingService, RatingUseCase],
  exports: [RatingService, RatingUseCase],
})
export class RatingModule {}
