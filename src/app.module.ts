import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    CloudinaryModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: () => ({
        cloud_name: process.env.Cloud_Name,
        api_key: process.env.Cloud_Api_Key,
        api_secret: process.env.Cloud_Api_Secret,
      }),
    },
  ],
})
export class AppModule {}