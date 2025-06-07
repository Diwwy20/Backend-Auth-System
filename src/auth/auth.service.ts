import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { sql } from 'src/config/db';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // เพิ่ม import

import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

import { User } from './interfaces/auth.interface';
import { getBuffer } from 'src/utils/dataUri';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService, // เปลี่ยนจาก @Inject('CLOUDINARY')
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    if (!email || !name || !password) {
      throw new HttpException(
        {
          success: false,
          message: 'Email, name, and password are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      throw new HttpException(
        {
          success: false,
          message: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await sql`
      INSERT INTO users (email, name, password)
      VALUES (${email}, ${name}, ${hashedPassword})
      RETURNING id, email, name, created_at
    `;

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser[0].id },
      this.configService.get('JWT_SEC') as string,
      { expiresIn: '7d' },
    );

    return {
      success: true,
      message: 'User registered successfully',
      user: newUser[0],
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new HttpException(
        {
          success: false,
          message: 'Email and password are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if user exists
    const user = await sql`
      SELECT id, email, name, password FROM users WHERE email = ${email}
    `;

    if (user.length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'Invalid email or password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      throw new HttpException(
        {
          success: false,
          message: 'Invalid email or password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = jwt.sign(
      { id: user[0].id },
      this.configService.get('JWT_SEC') as string,
      { expiresIn: '7d' },
    );

    return {
      message: 'Logged in successfully',
      user: {
        success: true,
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
      token,
    };
  }

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto, file?: Express.Multer.File) {
    if (!user) {
      throw new HttpException(
        {
          success: false,
          message: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { name } = updateProfileDto;
    let avatarUrl: string | null = null;

    if (file) {
      const fileBuffer = getBuffer(file);
      if (!fileBuffer || !fileBuffer.content) {
        throw new HttpException(
          {
            success: false,
            message: 'Failed to generate file buffer',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // ใช้ cloudinaryService แทน cloudinary โดยตรง
      const cloudinary = this.cloudinaryService.getClient();
      const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: 'avatars',
      });

      avatarUrl = cloud.secure_url;
    }

    // ตรวจสอบว่ามีข้อมูลที่จะอัพเดทหรือไม่
    if (!name && !avatarUrl) {
      throw new HttpException(
        {
          success: false,
          message: 'No data to update',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // สร้าง dynamic query
    let updatedUsers;

    if (name && avatarUrl) {
      updatedUsers = await sql`
        UPDATE users
        SET name = ${name}, avatar = ${avatarUrl}, updated_at = NOW()
        WHERE id = ${user.id}
        RETURNING id, email, name, avatar, created_at, updated_at
      `;
    } else if (name && !avatarUrl) {
      updatedUsers = await sql`
        UPDATE users
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${user.id}
        RETURNING id, email, name, avatar, created_at, updated_at
      `;
    } else if (!name && avatarUrl) {
      updatedUsers = await sql`
        UPDATE users
        SET avatar = ${avatarUrl}, updated_at = NOW()
        WHERE id = ${user.id}
        RETURNING id, email, name, avatar, created_at, updated_at
      `;
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: updatedUsers[0],
    };
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    if (!user) {
      throw new HttpException(
        {
          success: false,
          message: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { currentPassword, newPassword } = changePasswordDto;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new HttpException(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new HttpException(
        {
          success: false,
          message: 'New password must be at least 6 characters long',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Get current user data with password
      const userWithPassword = await sql`
        SELECT id, email, name, password, avatar, created_at, updated_at 
        FROM users 
        WHERE id = ${user.id}
      `;

      if (!userWithPassword || userWithPassword.length === 0) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const currentUser = userWithPassword[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);

      if (!isCurrentPasswordValid) {
        throw new HttpException(
          {
            success: false,
            message: 'Current password is incorrect',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if new password is different from current password
      const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);

      if (isSamePassword) {
        throw new HttpException(
          {
            success: false,
            message: 'New password must be different from current password',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const updatedUser = await sql`
        UPDATE users 
        SET password = ${hashedNewPassword}, updated_at = NOW() 
        WHERE id = ${user.id}
        RETURNING id, email, name, avatar, created_at, updated_at
      `;

      if (!updatedUser || updatedUser.length === 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Failed to update password',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}