import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('Cloud_Name'),
      api_key: this.configService.get<string>('Cloud_Api_Key'),
      api_secret: this.configService.get<string>('Cloud_Api_Secret'),
    });
  }

  getClient() {
    return cloudinary;
  }
}