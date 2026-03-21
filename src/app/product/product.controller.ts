import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductUseCase } from './usecase/product.usecase';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productUseCase: ProductUseCase) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 5)) // Up to 5 images
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with images (Admin only)' })
  @ApiBody({ type: CreateProductDto }) // For swagger to show the body
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const data = await this.productUseCase.createProduct(
      createProductDto,
      files,
    );
    return ApiResponse.ok(data, 'Product created successfully');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all products' })
  async findAll() {
    const data = await this.productUseCase.getAllProducts();
    return ApiResponse.ok(data, 'Products retrieved successfully');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find one product by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productUseCase.getProductById(id);
    return ApiResponse.ok(data, 'Product retrieved successfully');
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update product information and/or add images' })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const data = await this.productUseCase.updateProduct(
      id,
      updateProductDto,
      files,
    );
    return ApiResponse.ok(data, 'Product updated successfully');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productUseCase.deleteProduct(id);
    return ApiResponse.ok(null, 'Product deleted successfully');
  }

  @Delete('image/:imageId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a single image from product (Moves to backup)',
  })
  async removeImage(@Param('imageId', ParseIntPipe) imageId: number) {
    await this.productUseCase.deleteProductImage(imageId);
    return ApiResponse.ok(null, 'Image removed and backed up successfully');
  }
}
