import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let configService: ConfigService;
  let usersService: UsersService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword',
    role: Role.USER,
    birthdate: new Date('1990-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtPayload: JwtPayload = {
    sub: '1',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-refresh-secret-minimum-32-characters-long'),
    } as unknown as ConfigService;

    usersService = {
      findOne: jest.fn(),
    } as unknown as UsersService;

    strategy = new JwtRefreshStrategy(configService, usersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error if JWT_REFRESH_SECRET is not configured', () => {
    const configWithoutSecret = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => {
      new JwtRefreshStrategy(configWithoutSecret, usersService);
    }).toThrow('JWT_REFRESH_SECRET is not configured');
  });

  describe('validate', () => {
    it('should return user if found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should use payload.sub as user id', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      await strategy.validate(mockJwtPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockJwtPayload.sub);
    });
  });
});

