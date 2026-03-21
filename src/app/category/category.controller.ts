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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryUseCase } from './usecase/category.usecase';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryUseCase: CategoryUseCase) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoryUseCase.createCategory(createCategoryDto);
    return ApiResponse.ok(data, 'Category created successfully');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all categories' })
  async findAll() {
    const data = await this.categoryUseCase.getAllCategories();
    return ApiResponse.ok(data, 'Categories retrieved successfully');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find one category by ID, including its products' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoryUseCase.getCategoryById(id);
    return ApiResponse.ok(data, 'Category retrieved successfully');
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update category information (Admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoryUseCase.updateCategory(
      id,
      updateCategoryDto,
    );
    return ApiResponse.ok(data, 'Category updated successfully');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryUseCase.deleteCategory(id);
    return ApiResponse.ok(null, 'Category deleted successfully');
  }
}
