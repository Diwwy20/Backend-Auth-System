import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (!req.user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found in request',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      return await this.authService.updateProfile(req.user, updateProfileDto, file);
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      if (!req.user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found in request',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      return await this.authService.changePassword(req.user, changePasswordDto);
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}