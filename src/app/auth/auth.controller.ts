import { Controller, Post, Body } from '@nestjs/common';
import { AuthUseCase } from './usecase/auth.usecase';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: CreateUserDto) {
    const data = await this.authUseCase.register(registerDto);
    return ApiResponse.ok(data, 'User registered successfully');
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get JWT token' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authUseCase.login(loginDto);
    return ApiResponse.ok(data, 'Login successful');
  }
}
