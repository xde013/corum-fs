import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  AuthResponse,
  LoginCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/shared/types';

// Unmock authService if it was mocked in setupTests
vi.unmock('@/features/auth/services/authService');

// Use vi.hoisted to ensure mocks are properly hoisted and accessible in the mock factory
const mocks = vi.hoisted(() => {
  const post = vi.fn();
  const get = vi.fn();
  const setAuthTokens = vi.fn();
  const clearAuthTokens = vi.fn();
  const client = {
    post,
    get,
  };
  return {
    post,
    get,
    setAuthTokens,
    clearAuthTokens,
    client,
  };
});

// Mock apiClient - use factory to ensure same instance is returned
vi.mock('@/shared/services/api/apiClient', () => {
  return {
    default: {
      getClient: () => mocks.client,
      setAuthTokens: mocks.setAuthTokens,
      clearAuthTokens: mocks.clearAuthTokens,
    },
  };
});

// Import after mocking
import { authService } from './authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call login endpoint and store tokens', async () => {
      const credentials: LoginCredentials = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockAuthResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          birthdate: '1990-01-01',
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
        },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await authService.login(credentials);

      expect(mocks.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mocks.setAuthTokens).toHaveBeenCalledWith(
        'access-token-123',
        'refresh-token-456'
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle login errors', async () => {
      const credentials: LoginCredentials = {
        email: 'user@example.com',
        password: 'wrong-password',
      };

      const error = new Error('Invalid credentials');
      mocks.post.mockRejectedValue(error);

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
      expect(mocks.setAuthTokens).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear auth tokens', async () => {
      await authService.logout();

      expect(mocks.clearAuthTokens).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should call forgot password endpoint', async () => {
      const data: ForgotPasswordRequest = {
        email: 'user@example.com',
      };

      const mockResponse = {
        message: 'Password reset link sent',
      };

      mocks.post.mockResolvedValue({
        data: mockResponse,
      });

      const result = await authService.forgotPassword(data);

      expect(mocks.post).toHaveBeenCalledWith('/auth/forgot-password', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle forgot password errors', async () => {
      const data: ForgotPasswordRequest = {
        email: 'nonexistent@example.com',
      };

      const error = new Error('User not found');
      mocks.post.mockRejectedValue(error);

      await expect(authService.forgotPassword(data)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should call reset password endpoint', async () => {
      const data: ResetPasswordRequest = {
        token: 'reset-token-123',
        newPassword: 'NewPassword123!',
      };

      const mockResponse = {
        message: 'Password reset successfully',
      };

      mocks.post.mockResolvedValue({
        data: mockResponse,
      });

      const result = await authService.resetPassword(data);

      expect(mocks.post).toHaveBeenCalledWith('/auth/reset-password', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle reset password errors', async () => {
      const data: ResetPasswordRequest = {
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      };

      const error = new Error('Invalid or expired token');
      mocks.post.mockRejectedValue(error);

      await expect(authService.resetPassword(data)).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('refreshToken', () => {
    it('should call refresh endpoint and store new tokens', async () => {
      const refreshToken = 'refresh-token-456';

      const mockAuthResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          birthdate: '1990-01-01',
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
        },
        accessToken: 'new-access-token-789',
        refreshToken: 'new-refresh-token-012',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await authService.refreshToken(refreshToken);

      expect(mocks.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken });
      expect(mocks.setAuthTokens).toHaveBeenCalledWith(
        'new-access-token-789',
        'new-refresh-token-012'
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle refresh token errors', async () => {
      const refreshToken = 'expired-token';

      const error = new Error('Token expired');
      mocks.post.mockRejectedValue(error);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Token expired');
      expect(mocks.setAuthTokens).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should call get current user endpoint', async () => {
      const mockUser: AuthResponse['user'] = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        birthdate: '1990-01-01',
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2020-01-01T00:00:00Z',
      };

      mocks.get.mockResolvedValue({
        data: mockUser,
      });

      const result = await authService.getCurrentUser();

      expect(mocks.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should handle get current user errors', async () => {
      const error = new Error('Unauthorized');
      mocks.get.mockRejectedValue(error);

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });
});
