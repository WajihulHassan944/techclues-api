import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('cloudinary.cloudName'),
      api_key: config.get<string>('cloudinary.apiKey'),
      api_secret: config.get<string>('cloudinary.apiSecret'),
    });
  }

  /** Lets the frontend upload directly to Cloudinary without routing file bytes through the API. */
  createSignature(folder = 'techclues/blog') {
    const timestamp = Math.round(Date.now() / 1000);
    const apiSecret = this.config.get<string>('cloudinary.apiSecret')!;
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return {
      timestamp,
      signature,
      apiKey: this.config.get<string>('cloudinary.apiKey'),
      cloudName: this.config.get<string>('cloudinary.cloudName'),
      folder,
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    folder = 'techclues/blog',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
      stream.end(buffer);
    });
  }

  /** Same upload, but returns the extra metadata the media library needs to keep. */
  async uploadBufferWithMeta(
    buffer: Buffer,
    folder = 'techclues/media',
  ): Promise<{ url: string; publicId: string; width?: number; height?: number; bytes?: number; format?: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        });
      });
      stream.end(buffer);
    });
  }

  async destroy(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }
}
