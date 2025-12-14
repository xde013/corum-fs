import { apiClient } from './apiClient';
import type {
  AuthResponse,
  LoginCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const client = apiClient.getClient();
    const response = await client.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    // Store tokens
    apiClient.setAuthTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    apiClient.clearAuthTokens();
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const client = apiClient.getClient();
    const response = await client.post<{ message: string }>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const client = apiClient.getClient();
    const response = await client.post<{ message: string }>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Refresh endpoint uses JwtRefreshAuthGuard which expects token in body
    const client = apiClient.getClient();
    const response = await client.post<AuthResponse>(
      '/auth/refresh',
      { refreshToken }
    );
    apiClient.setAuthTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const client = apiClient.getClient();
    const response = await client.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },
};
