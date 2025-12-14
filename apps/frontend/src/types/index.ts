export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// User list types
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
    limit: number;
  };
}

export type SortField =
  | 'createdAt'
  | 'updatedAt'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'birthdate';

export type SortOrder = 'ASC' | 'DESC';

export interface UserListQuery {
  cursor?: string;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  search?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}
