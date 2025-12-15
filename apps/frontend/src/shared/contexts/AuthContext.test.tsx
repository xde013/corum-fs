import { renderHook, waitFor, act } from '@/shared/utils/testUtils';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import type { User } from '@/shared/types';

// Use vi.hoisted to ensure mocks are properly hoisted
const mocks = vi.hoisted(() => {
  const getCurrentUser = vi.fn();
  const login = vi.fn();
  const logout = vi.fn();
  const isAuthenticated = vi.fn();
  const clearTokens = vi.fn();
  return {
    getCurrentUser,
    login,
    logout,
    isAuthenticated,
    clearTokens,
  };
});

// Mock authService
vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    getCurrentUser: mocks.getCurrentUser,
    login: mocks.login,
    logout: mocks.logout,
  },
}));

// Mock auth utils
vi.mock('@/shared/utils/auth', () => ({
  isAuthenticated: () => mocks.isAuthenticated(),
  clearTokens: () => mocks.clearTokens(),
}));

describe('AuthContext', () => {
  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    birthdate: '1990-01-01',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.isAuthenticated.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AuthProvider', () => {
    it('should provide initial loading state', async () => {
      mocks.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Initially loading should be true, but useEffect runs asynchronously
      // So we check that it starts as true or wait for it to become false
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      
      // Wait for the initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should load user when authenticated on mount', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mocks.getCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should not load user when not authenticated on mount', async () => {
      mocks.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mocks.getCurrentUser).not.toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear tokens and user on getCurrentUser error', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mocks.getCurrentUser).toHaveBeenCalled();
      expect(mocks.clearTokens).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide login function', async () => {
      mocks.isAuthenticated.mockReturnValue(false);
      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };
      mocks.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(mocks.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should provide logout function', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockResolvedValue(mockUser);
      mocks.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mocks.logout).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide refreshUser function', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const updatedUser: User = {
        ...mockUser,
        firstName: 'Jane',
      };
      mocks.getCurrentUser.mockResolvedValue(updatedUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mocks.getCurrentUser).toHaveBeenCalledTimes(2);
      expect(result.current.user).toEqual(updatedUser);
    });

    it('should handle refreshUser when not authenticated', async () => {
      mocks.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mocks.getCurrentUser).not.toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });

    it('should handle refreshUser error', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      mocks.getCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mocks.clearTokens).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });

    it('should update isAuthenticated based on user state', async () => {
      mocks.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };
      mocks.login.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should return context when used inside AuthProvider', () => {
      mocks.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isAuthenticated).toBeDefined();
      expect(result.current.login).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.refreshUser).toBeDefined();
    });
  });

  describe('AuthProvider integration', () => {
    it('should render children correctly', () => {
      const TestComponent = () => <div>Test Content</div>;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should provide context to nested components', async () => {
      mocks.isAuthenticated.mockReturnValue(true);
      mocks.getCurrentUser.mockResolvedValue(mockUser);

      const TestComponent = () => {
        const { user, isLoading } = useAuth();
        if (isLoading) return <div>Loading...</div>;
        return <div>User: {user?.email}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('User: user@example.com')).toBeInTheDocument();
      });
    });
  });
});
