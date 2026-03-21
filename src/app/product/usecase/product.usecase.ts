import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductService } from '../product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
@Injectable()
export class ProductUseCase {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    files?: Array<Express.Multer.File>,
  ) {
    // 1. Upload images if present
    const images: { url: string; publicId: string }[] = [];
    if (files && files.length > 0) {
      const uploadResults = await this.cloudinary.uploadImages(
        files,
        'fastfood/products',
      );
      uploadResults.forEach((res) => {
        images.push({
          url: res.secure_url,
          publicId: res.public_id,
        });
      });
    }

    // 2. Create product in DB
    return this.productService.create({
      ...createProductDto,
      images: images.length > 0 ? images : undefined,
    });
  }

  async getAllProducts() {
    return this.productService.findAll();
  }

  async getProductById(id: number) {
    return this.productService.findById(id);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    files?: Array<Express.Multer.File>,
  ) {
    // Check if exists
    await this.productService.findById(id);

    // If new images provided
    if (files && files.length > 0) {
      const uploadResults = await this.cloudinary.uploadImages(
        files,
        'fastfood/products',
      );
      for (const res of uploadResults) {
        await this.productService.addImage(
          id,
          res.secure_url,
          res.public_id,
        );
      }
    }

    // Update product info
    return this.productService.update(id, updateProductDto);
  }

  async deleteProductImage(imageId: number) {
    const image = await this.productService.findImageById(imageId);
    if (!image) throw new NotFoundException('Image not found');

    // When delete image from product -> Backup
    if (image.publicId) {
      await this.cloudinary.moveToBackup(image.publicId);
    }

    return this.productService.deleteImageFromDb(imageId);
  }

  async deleteProduct(id: number) {
    const product = await this.productService.findById(id);

    // When delete product -> Delete permanently from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          try {
            await this.cloudinary.deleteImage(img.publicId);
          } catch (error) {
            console.error(
              `Failed to delete image ${img.publicId} from Cloudinary:`,
              error,
            );
          }
        }
      }
    }

    return this.productService.remove(id);
  }
}
