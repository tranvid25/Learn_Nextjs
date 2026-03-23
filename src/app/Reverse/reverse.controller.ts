import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Controller,
} from '@nestjs/common';
import { CreateReverseDto } from './dto/create-reverse.dto';
import { ReverseUseCase } from './usecase/reverse.usecase';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateReverseDto } from './dto/update-reverse.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Reverse')
@Controller('reverse')
export class ReverseController {
  constructor(private readonly reverseUseCase: ReverseUseCase) {}
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createReverse(@Body() createReverseDto: CreateReverseDto) {
    return this.reverseUseCase.createReverse(createReverseDto);
  }
  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAllReverse() {
    return this.reverseUseCase.findAllReverse();
  }
  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findByIdReverse(@Param('id', ParseIntPipe) id: number) {
    return this.reverseUseCase.findByIdReverse(id);
  }
  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateReverse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReverseDto: UpdateReverseDto,
  ) {
    return this.reverseUseCase.updateReverse(id, updateReverseDto);
  }
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeReverse(@Param('id', ParseIntPipe) id: number) {
    return this.reverseUseCase.removeReverse(id);
  }
}
