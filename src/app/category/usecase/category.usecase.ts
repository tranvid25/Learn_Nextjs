import { Injectable } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryUseCase {
  constructor(private readonly categoryService: CategoryService) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  async getAllCategories() {
    return this.categoryService.findAll();
  }

  async getCategoryById(id: number) {
    return this.categoryService.findById(id);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  async deleteCategory(id: number) {
    return this.categoryService.remove(id);
  }
}
