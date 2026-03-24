import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostUseCase } from './usecase/post.usecase';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [PostController],
  providers: [PostService, PostUseCase],
  exports: [PostService],
})
export class PostModule {}
