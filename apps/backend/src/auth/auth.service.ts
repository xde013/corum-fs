import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
// import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import {
  ENV_KEYS,
  PASSWORD_RESET_DEFAULT_EXPIRY_HOURS,
} from '../config/config.constants';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12; // Higher can be slower.

  constructor(
    private usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (protects against rainbow table attacks)
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      birthdate: new Date(registerDto.birthdate),
      role: Role.USER, // Explicitly set to USER to prevent privilege escalation
    });
    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Use timing-safe comparison to prevent timing attacks
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      // Generic error message to prevent user enumeration attacks
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(user: User): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Still hash a dummy password to prevent timing attacks
      await bcrypt.hash('dummy', this.SALT_ROUNDS);
      return null;
    }

    // Use bcrypt.compare for timing-safe password comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private async generateTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessTokenExpiration =
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    const refreshTokenExpiration =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const accessTokenOptions: JwtSignOptions = {
      secret: jwtSecret,
      expiresIn: accessTokenExpiration,
    } as JwtSignOptions;

    const refreshTokenOptions: JwtSignOptions = {
      secret: jwtRefreshSecret,
      expiresIn: refreshTokenExpiration,
    } as JwtSignOptions;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, accessTokenOptions),
      this.jwtService.signAsync(payload, refreshTokenOptions),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyToken(token: string, isRefresh = false): Promise<JwtPayload> {
    try {
      const secret = isRefresh
        ? this.configService.get<string>('JWT_REFRESH_SECRET')
        : this.configService.get<string>('JWT_SECRET');

      return await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
    message: string;
  }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Don't reveal if user exists to prevent user enumeration
    if (!user) {
      // Return success message even if user doesn't exist (security best practice)
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate secure reset token
    const resetToken = this.generateResetToken(user.email); // Use user email as the token for development purposes
    const resetTokenExpiry = new Date();
    const expiryHours = this.configService.get<number>(
      ENV_KEYS.PASSWORD_RESET_EXPIRY_HOURS,
      PASSWORD_RESET_DEFAULT_EXPIRY_HOURS
    );
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + expiryHours);

    // Save reset token to user
    await this.usersService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetTokenExpiry
    );

    // const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    // await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    // For now, log the token
    console.log(
      `Password reset token for ${user.email}: ${resetToken} (expires: ${resetTokenExpiry.toISOString()})`
    );

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
  }> {
    // Find user by reset token
    const user = await this.usersService.findByResetToken(
      resetPasswordDto.token
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      // Clear expired token
      await this.usersService.updatePasswordResetToken(user.id, null, null);
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(
      resetPasswordDto.newPassword
    );

    // Update password and clear reset token
    await this.usersService.updatePasswordResetToken(user.id, null, null);
    await this.usersService.update(user.id, {
      password: hashedPassword,
    } as UpdateUserDto);

    return {
      message: 'Password has been successfully reset',
    };
  }

  private generateResetToken(email: string): string {
    // Generate a secure random token
    // return randomBytes(32).toString('hex');
    return `${email}`; // For development, use a fixed token for testing
  }
}
