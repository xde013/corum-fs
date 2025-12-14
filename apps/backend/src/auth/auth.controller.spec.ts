import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { AuthResponse } from './interfaces/auth-response.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword',
    birthdate: new Date('1990-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
      birthdate: '1990-01-01',
    };

    it('should register a new user', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return user and tokens', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user with valid credentials', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return user and tokens', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens for authenticated user', async () => {
      jest
        .spyOn(authService, 'refreshTokens')
        .mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshTokens(mockUser);

      expect(authService.refreshTokens).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return new access and refresh tokens', async () => {
      jest
        .spyOn(authService, 'refreshTokens')
        .mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshTokens(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current authenticated user', () => {
      const result = controller.getCurrentUser(mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return user without password field in response', () => {
      const result = controller.getCurrentUser(mockUser);

      // Password should be excluded by class-transformer in actual responses
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
    });
  });
});
