import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MulterModule.register({
      storage: require('multer').memoryStorage(),
    }),
    CloudinaryModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}