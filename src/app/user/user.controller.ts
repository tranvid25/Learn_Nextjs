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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserUseCase } from './usecase/user.usecase';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userUseCase.createUser(createUserDto);
    return ApiResponse.ok(data, 'User created successfully');
  }

  @Get()
  @Public()
  async findAll() {
    const data = await this.userUseCase.getAllUsers();
    return ApiResponse.ok(data, 'Users retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userUseCase.getUserById(id);
    return ApiResponse.ok(data, 'User retrieved successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (Self or Admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: any,
  ) {
    // Only the profile owner can update their own data
    if (currentUser.id !== id) {
      throw new ForbiddenException('Only you can update your own account');
    }

    const data = await this.userUseCase.updateUser(id, updateUserDto);
    return ApiResponse.ok(data, 'User updated successfully');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userUseCase.deleteUser(id);
    return ApiResponse.ok(null, 'User deleted successfully');
  }
}
