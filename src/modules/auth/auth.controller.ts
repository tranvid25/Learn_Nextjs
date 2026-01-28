import { Controller,Post,Body} from '@nestjs/common';
import { AuthService } from './auth.services';
import { ValidationPipe } from '@nestjs/common';
import { AuthRequest } from './auth.request.dto';
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body(new ValidationPipe()) request:AuthRequest,
): unknown {
    try {
       return this.authService.authenticate(request);
    } catch (error) {
      console.log("Errors: ",error);
    }
  }
}
