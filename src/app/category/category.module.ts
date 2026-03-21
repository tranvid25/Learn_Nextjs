import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryUseCase } from './usecase/category.usecase';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryUseCase],
  exports: [CategoryService, CategoryUseCase],
})
export class CategoryModule {}
