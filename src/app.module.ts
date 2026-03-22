import { Module } from '@nestjs/common';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { DatabaseModule } from './infra/database/database.module';
import { ProductModule } from './app/product/product.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './app/category/category.module';
import { SearchModule } from './infra/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    SearchModule,
  ],
})
export class AppModule {}
