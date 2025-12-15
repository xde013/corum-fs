import apiClient from '@/shared/services/api/apiClient';
import type { User, CursorPaginatedResponse, UserListQuery } from '@/shared/types';

export const userService = {
  async getUsers(query: UserListQuery = {}): Promise<CursorPaginatedResponse<User>> {
    const client = apiClient.getClient();
    const params = new URLSearchParams();

    if (query.cursor) params.append('cursor', query.cursor);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.search) params.append('search', query.search);
    if (query.firstName) params.append('firstName', query.firstName);
    if (query.lastName) params.append('lastName', query.lastName);
    if (query.email) params.append('email', query.email);

    const response = await client.get<CursorPaginatedResponse<User>>(
      `/users?${params.toString()}`
    );
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const client = apiClient.getClient();
    const response = await client.get<User>('/auth/me');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const client = apiClient.getClient();
    const response = await client.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    birthdate?: string;
  }): Promise<User> {
    const client = apiClient.getClient();
    const response = await client.patch<User>('/users/me', data);
    return response.data;
  },

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthdate: string;
    role?: 'user' | 'admin';
  }): Promise<User> {
    const client = apiClient.getClient();
    // Register endpoint doesn't accept role, so we register first then update role if needed
    const { role, ...registerData } = data;
    const response = await client.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', registerData);
    const createdUser = response.data.user;
    
    // If role is provided and different from default 'user', update it
    if (role && role !== 'user' && createdUser.id) {
      await this.updateUser(createdUser.id, { role });
      // Fetch updated user to return
      return await this.getUserById(createdUser.id);
    }
    
    return createdUser;
  },

  async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      birthdate?: string;
      role?: 'user' | 'admin';
    }
  ): Promise<User> {
    const client = apiClient.getClient();
    const response = await client.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    const client = apiClient.getClient();
    await client.delete(`/users/${id}`);
  },

  async bulkDeleteUsers(ids: string[]): Promise<{
    deleted: number;
    failed: string[];
    message: string;
  }> {
    const client = apiClient.getClient();
    const response = await client.delete<{
      deleted: number;
      failed: string[];
      message: string;
    }>('/users', { data: { ids } });
    return response.data;
  },
};
