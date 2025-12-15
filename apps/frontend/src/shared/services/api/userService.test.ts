import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, CursorPaginatedResponse, UserListQuery } from '@/shared/types';

// Unmock userService if it was mocked in setupTests
vi.unmock('@/shared/services/api/userService');

// Use vi.hoisted to ensure mocks are properly hoisted and accessible in the mock factory
const mocks = vi.hoisted(() => {
  const get = vi.fn();
  const post = vi.fn();
  const patch = vi.fn();
  const deleteMethod = vi.fn();
  const client = {
    get,
    post,
    patch,
    delete: deleteMethod,
  };
  return {
    get,
    post,
    patch,
    deleteMethod,
    client,
  };
});

// Mock apiClient - use factory to ensure same instance is returned
vi.mock('@/shared/services/api/apiClient', () => {
  return {
    default: {
      getClient: () => mocks.client,
    },
  };
});

// Import after mocking
import { userService } from './userService';

describe('userService', () => {
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
  });

  describe('getUsers', () => {
    it('should call getUsers endpoint with empty query', async () => {
      const mockResponse: CursorPaginatedResponse<User> = {
        data: [mockUser],
        meta: {
          nextCursor: null,
          hasMore: false,
          count: 1,
          limit: 10,
        },
      };

      mocks.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.getUsers();

      expect(mocks.get).toHaveBeenCalledWith('/users?');
      expect(result).toEqual(mockResponse);
    });

    it('should call getUsers endpoint with all query parameters', async () => {
      const query: UserListQuery = {
        cursor: 'cursor-123',
        limit: 20,
        sortBy: 'email',
        sortOrder: 'ASC',
        search: 'john',
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
      };

      const mockResponse: CursorPaginatedResponse<User> = {
        data: [mockUser],
        meta: {
          nextCursor: 'cursor-456',
          hasMore: true,
          count: 1,
          limit: 20,
        },
      };

      mocks.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.getUsers(query);

      const expectedUrl = '/users?cursor=cursor-123&limit=20&sortBy=email&sortOrder=ASC&search=john&firstName=John&lastName=Doe&email=user%40example.com';
      expect(mocks.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('should call getUsers endpoint with partial query parameters', async () => {
      const query: UserListQuery = {
        limit: 5,
        sortBy: 'createdAt',
      };

      const mockResponse: CursorPaginatedResponse<User> = {
        data: [mockUser],
        meta: {
          nextCursor: null,
          hasMore: false,
          count: 1,
          limit: 5,
        },
      };

      mocks.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.getUsers(query);

      expect(mocks.get).toHaveBeenCalledWith('/users?limit=5&sortBy=createdAt');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors from getUsers', async () => {
      const error = new Error('Failed to fetch users');
      mocks.get.mockRejectedValue(error);

      await expect(userService.getUsers()).rejects.toThrow('Failed to fetch users');
      expect(mocks.get).toHaveBeenCalledWith('/users?');
    });
  });

  describe('getCurrentUser', () => {
    it('should call getCurrentUser endpoint', async () => {
      mocks.get.mockResolvedValue({
        data: mockUser,
      });

      const result = await userService.getCurrentUser();

      expect(mocks.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should handle errors from getCurrentUser', async () => {
      const error = new Error('Failed to fetch current user');
      mocks.get.mockRejectedValue(error);

      await expect(userService.getCurrentUser()).rejects.toThrow('Failed to fetch current user');
      expect(mocks.get).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('getUserById', () => {
    it('should call getUserById endpoint with correct id', async () => {
      mocks.get.mockResolvedValue({
        data: mockUser,
      });

      const result = await userService.getUserById('1');

      expect(mocks.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should handle errors from getUserById', async () => {
      const error = new Error('User not found');
      mocks.get.mockRejectedValue(error);

      await expect(userService.getUserById('999')).rejects.toThrow('User not found');
      expect(mocks.get).toHaveBeenCalledWith('/users/999');
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile endpoint with correct data', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        birthdate: '1991-02-02',
      };

      const updatedUser: User = {
        ...mockUser,
        ...updateData,
      };

      mocks.patch.mockResolvedValue({
        data: updatedUser,
      });

      const result = await userService.updateProfile(updateData);

      expect(mocks.patch).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should handle partial update data', async () => {
      const updateData = {
        firstName: 'Jane',
      };

      const updatedUser: User = {
        ...mockUser,
        firstName: 'Jane',
      };

      mocks.patch.mockResolvedValue({
        data: updatedUser,
      });

      const result = await userService.updateProfile(updateData);

      expect(mocks.patch).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should handle errors from updateProfile', async () => {
      const error = new Error('Failed to update profile');
      mocks.patch.mockRejectedValue(error);

      await expect(userService.updateProfile({ firstName: 'Jane' })).rejects.toThrow('Failed to update profile');
      expect(mocks.patch).toHaveBeenCalledWith('/users/me', { firstName: 'Jane' });
    });
  });

  describe('createUser', () => {
    it('should create user with default role (user)', async () => {
      const createData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'Password123!',
        birthdate: '1995-01-01',
      };

      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await userService.createUser(createData);

      expect(mocks.post).toHaveBeenCalledWith('/auth/register', createData);
      expect(result).toEqual(mockUser);
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should create user with admin role and update it', async () => {
      const createData = {
        firstName: 'New',
        lastName: 'Admin',
        email: 'newadmin@example.com',
        password: 'Password123!',
        birthdate: '1995-01-01',
        role: 'admin' as const,
      };

      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };

      const updatedAdminUser: User = {
        ...mockUser,
        role: 'admin',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      mocks.patch.mockResolvedValue({
        data: updatedAdminUser,
      });

      mocks.get.mockResolvedValue({
        data: updatedAdminUser,
      });

      const result = await userService.createUser(createData);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...registerData } = createData;
      expect(mocks.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(mocks.patch).toHaveBeenCalledWith('/users/1', { role: 'admin' });
      expect(mocks.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(updatedAdminUser);
    });

    it('should not update role if role is user (default)', async () => {
      const createData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'Password123!',
        birthdate: '1995-01-01',
        role: 'user' as const,
      };

      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await userService.createUser(createData);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...registerData } = createData;
      expect(mocks.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(mocks.patch).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should handle errors from createUser', async () => {
      const error = new Error('Failed to create user');
      mocks.post.mockRejectedValue(error);

      await expect(
        userService.createUser({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@example.com',
          password: 'Password123!',
          birthdate: '1995-01-01',
        })
      ).rejects.toThrow('Failed to create user');
    });

    it('should handle errors when updating role fails', async () => {
      const createData = {
        firstName: 'New',
        lastName: 'Admin',
        email: 'newadmin@example.com',
        password: 'Password123!',
        birthdate: '1995-01-01',
        role: 'admin' as const,
      };

      const mockAuthResponse = {
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-456',
      };

      mocks.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      const error = new Error('Failed to update role');
      mocks.patch.mockRejectedValue(error);

      await expect(userService.createUser(createData)).rejects.toThrow('Failed to update role');
    });
  });

  describe('updateUser', () => {
    it('should call updateUser endpoint with correct id and data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        birthdate: '1992-03-03',
        role: 'admin' as const,
      };

      const updatedUser: User = {
        ...mockUser,
        ...updateData,
      };

      mocks.patch.mockResolvedValue({
        data: updatedUser,
      });

      const result = await userService.updateUser('1', updateData);

      expect(mocks.patch).toHaveBeenCalledWith('/users/1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should handle partial update data', async () => {
      const updateData = {
        firstName: 'Updated',
      };

      const updatedUser: User = {
        ...mockUser,
        firstName: 'Updated',
      };

      mocks.patch.mockResolvedValue({
        data: updatedUser,
      });

      const result = await userService.updateUser('1', updateData);

      expect(mocks.patch).toHaveBeenCalledWith('/users/1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should handle password update', async () => {
      const updateData = {
        password: 'NewPassword123!',
      };

      const updatedUser: User = {
        ...mockUser,
      };

      mocks.patch.mockResolvedValue({
        data: updatedUser,
      });

      const result = await userService.updateUser('1', updateData);

      expect(mocks.patch).toHaveBeenCalledWith('/users/1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should handle errors from updateUser', async () => {
      const error = new Error('Failed to update user');
      mocks.patch.mockRejectedValue(error);

      await expect(userService.updateUser('1', { firstName: 'Updated' })).rejects.toThrow('Failed to update user');
      expect(mocks.patch).toHaveBeenCalledWith('/users/1', { firstName: 'Updated' });
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser endpoint with correct id', async () => {
      mocks.deleteMethod.mockResolvedValue(undefined);

      await userService.deleteUser('1');

      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users/1');
    });

    it('should handle errors from deleteUser', async () => {
      const error = new Error('Failed to delete user');
      mocks.deleteMethod.mockRejectedValue(error);

      await expect(userService.deleteUser('1')).rejects.toThrow('Failed to delete user');
      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users/1');
    });
  });

  describe('bulkDeleteUsers', () => {
    it('should call bulkDeleteUsers endpoint with correct ids', async () => {
      const mockResponse = {
        deleted: 2,
        failed: [],
        message: 'Users deleted successfully',
      };

      mocks.deleteMethod.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.bulkDeleteUsers(['1', '2']);

      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users', { data: { ids: ['1', '2'] } });
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial failures in bulkDeleteUsers', async () => {
      const mockResponse = {
        deleted: 1,
        failed: ['2'],
        message: 'Some users could not be deleted',
      };

      mocks.deleteMethod.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.bulkDeleteUsers(['1', '2']);

      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users', { data: { ids: ['1', '2'] } });
      expect(result).toEqual(mockResponse);
      expect(result.deleted).toBe(1);
      expect(result.failed).toEqual(['2']);
    });

    it('should handle errors from bulkDeleteUsers', async () => {
      const error = new Error('Failed to delete users');
      mocks.deleteMethod.mockRejectedValue(error);

      await expect(userService.bulkDeleteUsers(['1', '2'])).rejects.toThrow('Failed to delete users');
      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users', { data: { ids: ['1', '2'] } });
    });

    it('should handle empty ids array', async () => {
      const mockResponse = {
        deleted: 0,
        failed: [],
        message: 'No users to delete',
      };

      mocks.deleteMethod.mockResolvedValue({
        data: mockResponse,
      });

      const result = await userService.bulkDeleteUsers([]);

      expect(mocks.deleteMethod).toHaveBeenCalledWith('/users', { data: { ids: [] } });
      expect(result).toEqual(mockResponse);
    });
  });
});
