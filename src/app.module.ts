import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { DatabaseModule } from './infra/database/database.module';
import { ProductModule } from './app/product/product.module';
import { CategoryModule } from './app/category/category.module';
import { SearchModule } from './infra/search/search.module';
import { MailModule } from './infra/mail/mail.module';
import { ReverseModule } from './app/Reverse/reverse.module';
import { PostModule } from './app/post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    SearchModule,
    MailModule,
    ReverseModule,
    PostModule,
  ],
})
export class AppModule {}
