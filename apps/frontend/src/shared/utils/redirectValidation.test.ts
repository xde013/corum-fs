import { validateRedirectPath } from './redirectValidation';
import { describe, it, expect } from 'vitest';

describe('redirectValidation', () => {
  describe('validateRedirectPath', () => {
    it('should return default path when path is undefined', () => {
      expect(validateRedirectPath(undefined)).toBe('/dashboard');
    });

    it('should return default path when path is null', () => {
      expect(validateRedirectPath(null)).toBe('/dashboard');
    });

    it('should return default path when path is empty string', () => {
      expect(validateRedirectPath('')).toBe('/dashboard');
    });

    it('should allow valid internal paths', () => {
      expect(validateRedirectPath('/dashboard')).toBe('/dashboard');
      expect(validateRedirectPath('/profile')).toBe('/profile');
      expect(validateRedirectPath('/users/new')).toBe('/users/new');
    });

    it('should allow paths that start with allowed paths', () => {
      expect(validateRedirectPath('/users/123/edit')).toBe('/users/123/edit');
      expect(validateRedirectPath('/users/abc')).toBe('/users/abc');
    });

    it('should reject absolute URLs', () => {
      expect(validateRedirectPath('https://evil.com')).toBe('/dashboard');
      expect(validateRedirectPath('http://evil.com')).toBe('/dashboard');
    });

    it('should reject protocol-relative URLs', () => {
      expect(validateRedirectPath('//evil.com')).toBe('/dashboard');
    });

    it('should reject javascript: schemes', () => {
      expect(validateRedirectPath('javascript:alert(1)')).toBe('/dashboard');
    });

    it('should reject paths with colons that look like protocols', () => {
      expect(validateRedirectPath('http://evil.com')).toBe('/dashboard');
      expect(validateRedirectPath('https://evil.com')).toBe('/dashboard');
      expect(validateRedirectPath('javascript:alert(1)')).toBe('/dashboard');
    });

    it('should allow auth routes', () => {
      expect(validateRedirectPath('/auth/login')).toBe('/auth/login');
      expect(validateRedirectPath('/auth/forgot-password')).toBe('/auth/forgot-password');
      expect(validateRedirectPath('/auth/reset-password')).toBe('/auth/reset-password');
    });

    it('should allow valid internal route patterns', () => {
      expect(validateRedirectPath('/valid-route')).toBe('/valid-route');
      expect(validateRedirectPath('/valid_route')).toBe('/valid_route');
      expect(validateRedirectPath('/valid/route/path')).toBe('/valid/route/path');
      expect(validateRedirectPath('/route:with:params')).toBe('/route:with:params');
    });

    it('should reject invalid paths', () => {
      expect(validateRedirectPath('/invalid@path')).toBe('/dashboard');
      expect(validateRedirectPath('/invalid#path')).toBe('/dashboard');
      expect(validateRedirectPath('/invalid?path')).toBe('/dashboard');
    });
  });
});
