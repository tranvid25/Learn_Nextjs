import { AuthController } from '../../app/auth/auth.controller';
import { UserController } from '../../app/user/user.controller';

export const apiRoutes = [
  {
    path: 'auth',
    module: AuthController,
  },
  {
    path: 'users',
    module: UserController,
  },
];
