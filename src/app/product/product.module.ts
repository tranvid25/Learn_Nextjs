import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductUseCase } from './usecase/product.usecase';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule], // Inject Cloudinary for file upload
  controllers: [ProductController],
  providers: [ProductService, ProductUseCase],
  exports: [ProductService, ProductUseCase],
})
export class ProductModule {}
