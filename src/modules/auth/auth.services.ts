import { Injectable } from '@nestjs/common';
import { AuthRequest } from './auth.request.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService:PrismaService
  ){

  }
  async authenticate(request: AuthRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.validateUser(request.email, request.password);
  }
  async validateUser(email:string,password:string):Promise<unknown>{
    const user=await this.prismaService.user.findUnique({
      where:{email}
    })
    if(!user){
      return null
    }
    const isPasswordValid=bcrypt.compare(password, user.password as string )
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if(!isPasswordValid){
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password:_,...result}=user;
    return result;

  }
}

// accessToken thời gian lưu ngắn đỡ bị leak:ko gây hậu quả quá nghiêm trọng
// -->phát hiện được revoke và tồn tại từ 5->15p
// login thành công vừa trả ra accesstoken cho client vừa trả ra refreshToken