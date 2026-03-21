import { Injectable, ConflictException } from '@nestjs/common';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserUseCase {
  constructor(private readonly userService: UserService) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async getAllUsers() {
    return this.userService.findAll();
  }

  async getUserById(id: number) {
    return this.userService.findById(id);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userService.update(id, updateUserDto);
  }

  async deleteUser(id: number) {
    return this.userService.remove(id);
  }
}
