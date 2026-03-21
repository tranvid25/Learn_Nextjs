import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  /**
   * Upload 1 file
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'uploads',
    format: string = 'webp',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder, format },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          resolve(result as UploadApiResponse);
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toStream(file.buffer).pipe(upload);
    });
  }

  /**
   * Upload nhiều file cùng lúc
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'uploads',
    format: string = 'webp',
  ): Promise<UploadApiResponse[]> {
    return Promise.all(
      files.map((file) => this.uploadImage(file, folder, format)),
    );
  }

  /**
   * Permanently delete an image
   */
  async deleteImage(publicId: string): Promise<unknown> {
    try {
      return await this.cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Move image to backup folder by renaming it
   */
  async moveToBackup(publicId: string): Promise<unknown> {
    const filename = publicId.split('/').pop();
    const newPublicId = `backup/${filename}`;
    try {
      return await this.cloudinary.uploader.rename(publicId, newPublicId);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
