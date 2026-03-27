import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserUseCase } from '../../user/usecase/user.usecase';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LogoutDto } from '../dto/logout.dto';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: CreateUserDto) {
    return this.userUseCase.createUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  async logout(logoutDto: LogoutDto) {
    return this.userService.deleteRefreshToken(logoutDto.refreshToken);
  }
}
