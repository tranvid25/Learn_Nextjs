import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

    async validateUser(email:string,password:string){
        const user=await this.userService.findByEmail(email);
        if(user && await bcrypt.compare(password,user.password)){
            const{password, ...result}=user;
            return result;
        }   
        return null;   
    }

    async login(user:any){
        const payload={sub:user.id,email:user.email,role:user.role};
        return {
            access_token:await this.jwtService.sign(payload),
            user:payload
        }
    }
}
