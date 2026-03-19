import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserUseCase } from './usecase/user.usecase';

@Module({
  controllers: [UserController],
  providers: [UserService, UserUseCase],
  exports: [UserService, UserUseCase],
})
export class UserModule {}
