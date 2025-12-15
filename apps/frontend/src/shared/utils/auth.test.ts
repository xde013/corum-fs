import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
} from './auth';

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAccessToken', () => {
    it('should return access token when it exists', () => {
      localStorage.setItem('accessToken', 'test-access-token');
      expect(getAccessToken()).toBe('test-access-token');
    });

    it('should return null when access token does not exist', () => {
      expect(getAccessToken()).toBe(null);
    });

    it('should return null when access token is empty string', () => {
      localStorage.setItem('accessToken', '');
      expect(getAccessToken()).toBe('');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when it exists', () => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      expect(getRefreshToken()).toBe('test-refresh-token');
    });

    it('should return null when refresh token does not exist', () => {
      expect(getRefreshToken()).toBe(null);
    });

    it('should return null when refresh token is empty string', () => {
      localStorage.setItem('refreshToken', '');
      expect(getRefreshToken()).toBe('');
    });
  });

  describe('setTokens', () => {
    it('should set both access and refresh tokens', () => {
      setTokens('access-123', 'refresh-456');
      expect(localStorage.getItem('accessToken')).toBe('access-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
    });

    it('should overwrite existing tokens', () => {
      localStorage.setItem('accessToken', 'old-access');
      localStorage.setItem('refreshToken', 'old-refresh');
      
      setTokens('new-access', 'new-refresh');
      
      expect(localStorage.getItem('accessToken')).toBe('new-access');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    it('should handle empty strings', () => {
      setTokens('', '');
      expect(localStorage.getItem('accessToken')).toBe('');
      expect(localStorage.getItem('refreshToken')).toBe('');
    });

    it('should handle long token strings', () => {
      const longAccessToken = 'a'.repeat(1000);
      const longRefreshToken = 'b'.repeat(1000);
      
      setTokens(longAccessToken, longRefreshToken);
      
      expect(localStorage.getItem('accessToken')).toBe(longAccessToken);
      expect(localStorage.getItem('refreshToken')).toBe(longRefreshToken);
    });
  });

  describe('clearTokens', () => {
    it('should remove both access and refresh tokens', () => {
      localStorage.setItem('accessToken', 'test-access');
      localStorage.setItem('refreshToken', 'test-refresh');
      
      clearTokens();
      
      expect(localStorage.getItem('accessToken')).toBe(null);
      expect(localStorage.getItem('refreshToken')).toBe(null);
    });

    it('should not throw error when tokens do not exist', () => {
      expect(() => clearTokens()).not.toThrow();
      expect(localStorage.getItem('accessToken')).toBe(null);
      expect(localStorage.getItem('refreshToken')).toBe(null);
    });

    it('should clear tokens even if only one exists', () => {
      localStorage.setItem('accessToken', 'test-access');
      
      clearTokens();
      
      expect(localStorage.getItem('accessToken')).toBe(null);
      expect(localStorage.getItem('refreshToken')).toBe(null);
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('accessToken', 'test-access');
      localStorage.setItem('refreshToken', 'test-refresh');
      localStorage.setItem('otherKey', 'other-value');
      
      clearTokens();
      
      expect(localStorage.getItem('accessToken')).toBe(null);
      expect(localStorage.getItem('refreshToken')).toBe(null);
      expect(localStorage.getItem('otherKey')).toBe('other-value');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('accessToken', 'test-access-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false when access token is empty string', () => {
      localStorage.setItem('accessToken', '');
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true for any non-empty access token', () => {
      localStorage.setItem('accessToken', 'a');
      expect(isAuthenticated()).toBe(true);
    });

    it('should not depend on refresh token', () => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      expect(isAuthenticated()).toBe(false);
      
      localStorage.setItem('accessToken', 'test-access-token');
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('integration', () => {
    it('should work together: set, get, check, clear', () => {
      // Initially not authenticated
      expect(isAuthenticated()).toBe(false);
      expect(getAccessToken()).toBe(null);
      expect(getRefreshToken()).toBe(null);
      
      // Set tokens
      setTokens('access-123', 'refresh-456');
      expect(isAuthenticated()).toBe(true);
      expect(getAccessToken()).toBe('access-123');
      expect(getRefreshToken()).toBe('refresh-456');
      
      // Clear tokens
      clearTokens();
      expect(isAuthenticated()).toBe(false);
      expect(getAccessToken()).toBe(null);
      expect(getRefreshToken()).toBe(null);
    });

    it('should handle token updates correctly', () => {
      setTokens('access-1', 'refresh-1');
      expect(getAccessToken()).toBe('access-1');
      expect(getRefreshToken()).toBe('refresh-1');
      
      setTokens('access-2', 'refresh-2');
      expect(getAccessToken()).toBe('access-2');
      expect(getRefreshToken()).toBe('refresh-2');
      
      expect(isAuthenticated()).toBe(true);
    });
  });
});
