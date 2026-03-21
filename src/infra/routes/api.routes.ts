import { CategoryController } from 'src/app/category/category.controller';
import { AuthController } from '../../app/auth/auth.controller';
import { UserController } from '../../app/user/user.controller';
import { ProductController } from 'src/app/product/product.controller';

export const apiRoutes = [
  {
    path: 'auth',
    module: AuthController,
  },
  {
    path: 'users',
    module: UserController,
  },
  {
    path: 'categories',
    module: CategoryController,
  },
  {
    path: 'products',
    module: ProductController,
  },
];
