import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword123',
    birthdate: new Date('1990-01-01'),
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findByResetToken: jest.fn(),
            updatePasswordResetToken: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret-key-min-32-chars-long-for-security',
                JWT_REFRESH_SECRET: 'test-refresh-secret-key-min-32-chars-long',
                JWT_ACCESS_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION: '7d',
                PASSWORD_RESET_EXPIRY_HOURS: 3,
              };
              return config[key as keyof typeof config];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
      birthdate: '1990-01-01',
    };

    it('should successfully register a new user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should hash password before creating user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw UnauthorizedException with non-existent user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should use timing-safe password comparison', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      await service.login(loginDto).catch(() => {});

      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword'
      );

      expect(result).toBeNull();
    });

    it('should return null with non-existent user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedfake');
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password'
      );

      expect(result).toBeNull();
    });

    it('should hash dummy password to prevent timing attacks when user not found', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedfake');
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await service.validateUser('nonexistent@example.com', 'password');

      expect(bcrypt.hash).toHaveBeenCalledWith('dummy', 12);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens', async () => {
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshTokens(mockUser);

      expect(result).toHaveProperty('user', mockUser);
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid access token', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const result = await service.verifyToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should verify valid refresh token', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const result = await service.verifyToken('valid-refresh-token', true);

      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
        { secret: 'test-refresh-secret-key-min-32-chars-long' } as any
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = { email: 'test@example.com' };

    it('should be a no-op (return generic message) when user does not exist', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        forgotPasswordDto.email
      );
      // Should not attempt to update reset token when user is missing
      expect(usersService.updatePasswordResetToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    });

    it('should set reset token and expiry when user exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      const getSpy = jest.spyOn(
        (service as any)['configService'],
        'get'
      ) as jest.SpyInstance;

      await service.forgotPassword(forgotPasswordDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        forgotPasswordDto.email
      );

      // Verify expiry hours were read from config
      expect(getSpy).toHaveBeenCalledWith(
        'PASSWORD_RESET_EXPIRY_HOURS',
        expect.any(Number)
      );

      expect(usersService.updatePasswordResetToken).toHaveBeenCalledWith(
        mockUser.id,
        // In dev, token equals email
        mockUser.email,
        expect.any(Date)
      );

      const [, , expiry] = (usersService.updatePasswordResetToken as jest.Mock)
        .mock.calls[0];
      expect(expiry).toBeInstanceOf(Date);
      expect(Number.isNaN(expiry.getTime())).toBe(false);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'reset-token',
      newPassword: 'NewPassword123!',
    };

    it('should throw BadRequestException when token is invalid', async () => {
      jest.spyOn(usersService, 'findByResetToken').mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should throw BadRequestException when token is expired', async () => {
      const expiredUser: User = {
        ...mockUser,
        passwordResetToken: resetPasswordDto.token,
        passwordResetExpires: new Date(Date.now() - 1000), // in the past
      };
      jest
        .spyOn(usersService, 'findByResetToken')
        .mockResolvedValue(expiredUser);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Reset token has expired'
      );

      // Expired token should be cleared
      expect(usersService.updatePasswordResetToken).toHaveBeenCalledWith(
        expiredUser.id,
        null,
        null
      );
    });

    it('should update password and clear reset token when token is valid', async () => {
      const validUser: User = {
        ...mockUser,
        passwordResetToken: resetPasswordDto.token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      };
      jest.spyOn(usersService, 'findByResetToken').mockResolvedValue(validUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.resetPassword(resetPasswordDto);

      expect(usersService.updatePasswordResetToken).toHaveBeenCalledWith(
        validUser.id,
        null,
        null
      );
      expect(usersService.update).toHaveBeenCalledWith(validUser.id, {
        password: 'new-hashed-password',
      } as any);
      expect(result).toEqual({
        message: 'Password has been successfully reset',
      });
    });
  });

  describe('Security', () => {
    it('should use at least 12 rounds for bcrypt', () => {
      expect(service['SALT_ROUNDS']).toBeGreaterThanOrEqual(12);
    });

    it('should generate tokens with proper payload structure', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('token');

      await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(signAsyncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
        }),
        expect.any(Object)
      );
    });
  });
});
