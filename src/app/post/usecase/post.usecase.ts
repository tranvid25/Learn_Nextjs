import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PostService } from '../post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class PostUseCase {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async createPost(createPostDto: CreatePostDto, file?: Express.Multer.File) {
    const { categoryIds, image, ...data } = createPostDto;
    const existingSlug = await this.prisma.post.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    let imageUrl: string | undefined = undefined;
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'post',
        );
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException(
          'Failed to upload image: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        );
      }
    }

    return this.postService.create({ ...data, image: imageUrl }, categoryIds);
  }

  async getAllPosts() {
    return this.postService.findAll();
  }
  
  async search(query: any) {
    return this.postService.search(query);
  }

  async getPostById(id: number) {
    return this.postService.findById(id);
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    const { categoryIds, image, ...data } = updatePostDto; // exclude image to prevent TS error
    if (data.slug) {
      const existingSlug = await this.prisma.post.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    let imageUrl: string | undefined = undefined;
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'post',
        );
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException(
          'Failed to upload image: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        );
      }
    }

    await this.postService.findById(id); // verify existence
    return this.postService.update(
      id,
      { ...data, ...(imageUrl && { image: imageUrl }) },
      categoryIds,
    );
  }

  async deletePost(id: number) {
    await this.postService.findById(id); // verify existence
    return this.postService.remove(id);
  }
}
