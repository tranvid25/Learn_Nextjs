import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PostUseCase } from './usecase/post.usecase';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postUseCase: PostUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({
    type: CreatePostDto,
    description: 'Create a new post',
  })
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() currentUser: any,
  ) {
    if (currentUser?.id && !createPostDto.authorId) {
      createPostDto.authorId = currentUser.id;
    }

    const data = await this.postUseCase.createPost(createPostDto, file);

    return ApiResponse.ok(data, 'Post created successfully');
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  async findAll() {
    const data = await this.postUseCase.getAllPosts();
    return ApiResponse.ok(data, 'Posts retrieved successfully');
  }
  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search posts' })
  async search(@Query() query: any) {
    const data = await this.postUseCase.search(query);
    return ApiResponse.ok(data, 'Posts retrieved successfully');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single post' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.postUseCase.getPostById(id);
    return ApiResponse.ok(data, 'Post retrieved successfully');
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a post' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.postUseCase.updatePost(id, updatePostDto, file);
    return ApiResponse.ok(data, 'Post updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.postUseCase.deletePost(id);
    return ApiResponse.ok(null, 'Post deleted successfully');
  }
}
