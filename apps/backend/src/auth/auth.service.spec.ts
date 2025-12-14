import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

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
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
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
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException with non-existent user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
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
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('should return null with non-existent user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedfake');
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
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
        { secret: 'test-refresh-secret-key-min-32-chars-long' } as any,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        'Invalid or expired token',
      );
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
        expect.any(Object),
      );
    });
  });
});
