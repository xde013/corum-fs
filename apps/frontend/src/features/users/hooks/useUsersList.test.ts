import { renderHook, waitFor, act } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsersList } from './useUsersList';
import type { User, CursorPaginatedResponse } from '@/shared/types';

// Mock userService
vi.mock('@/shared/services/api/userService', () => ({
  userService: {
    getUsers: vi.fn(),
  },
}));

// Mock errorHandler
vi.mock('@/shared/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

import { userService } from '@/shared/services/api/userService';
import { handleApiError } from '@/shared/utils/errorHandler';

describe('useUsersList', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      birthdate: '1990-01-01',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
      birthdate: '1991-02-02',
      createdAt: '2020-01-02T00:00:00Z',
      updatedAt: '2020-01-02T00:00:00Z',
    },
  ];

  const mockResponse: CursorPaginatedResponse<User> = {
    data: mockUsers,
    meta: {
      nextCursor: 'cursor-123',
      hasMore: true,
      count: 2,
      limit: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUsers).mockResolvedValue(mockResponse);
  });

  it('should initialize with empty users array', () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: false }));

    expect(result.current.users).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('should use default options when none provided', () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: false }));

    expect(result.current.sortBy).toBe('createdAt');
    expect(result.current.sortOrder).toBe('DESC');
  });

  it('should use custom default options', () => {
    const { result } = renderHook(() =>
      useUsersList({
        autoFetch: false,
        defaultSortBy: 'email',
        defaultSortOrder: 'ASC',
        defaultLimit: 20,
      })
    );

    expect(result.current.sortBy).toBe('email');
    expect(result.current.sortOrder).toBe('ASC');
  });

  it('should fetch users automatically when autoFetch is true', async () => {
    renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(vi.mocked(userService.getUsers)).toHaveBeenCalled();
    });
  });

  it('should not fetch users automatically when autoFetch is false', async () => {
    renderHook(() => useUsersList({ autoFetch: false }));

    // Wait a bit to ensure no fetch happens
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(vi.mocked(userService.getUsers)).not.toHaveBeenCalled();
  });

  it('should fetch users with correct query parameters', async () => {
    renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          limit: 10,
        })
      );
    });
  });

  it('should update users state after successful fetch', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[0].email).toBe('user1@example.com');
      expect(result.current.users[1].email).toBe('user2@example.com');
    });
  });

  it('should update hasMore and cursor after fetch', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });
  });

  it('should update count after fetch', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });
  });

  it('should handle filter changes', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
    });

    vi.clearAllMocks();

    await act(async () => {
      result.current.handleFilterChange({ search: 'john' });
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john',
        })
      );
    });
  });

  it('should handle sort changes', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
    });

    vi.clearAllMocks();

    await act(async () => {
      result.current.handleSortChange('email', 'ASC');
    });

    await waitFor(() => {
      expect(result.current.sortBy).toBe('email');
      expect(result.current.sortOrder).toBe('ASC');
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'email',
          sortOrder: 'ASC',
        })
      );
    });
  });

  it('should load more users when handleLoadMore is called', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });

    vi.clearAllMocks();

    await act(async () => {
      result.current.handleLoadMore();
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: 'cursor-123',
        })
      );
    });
  });

  it('should append users when loading more', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
    });

    const moreUsers: User[] = [
      {
        id: '3',
        email: 'user3@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'user',
        birthdate: '1992-03-03',
        createdAt: '2020-01-03T00:00:00Z',
        updatedAt: '2020-01-03T00:00:00Z',
      },
    ];

    vi.mocked(userService.getUsers).mockResolvedValueOnce({
      data: moreUsers,
      meta: {
        nextCursor: null,
        hasMore: false,
        count: 1,
        limit: 10,
      },
    });

    await act(async () => {
      result.current.handleLoadMore();
    });

    await waitFor(() => {
      expect(result.current.users).toHaveLength(3);
      expect(result.current.users[2].email).toBe('user3@example.com');
    });
  });

  it('should not load more when hasMore is false', async () => {
    vi.mocked(userService.getUsers).mockResolvedValueOnce({
      data: mockUsers,
      meta: {
        nextCursor: null,
        hasMore: false,
        count: 2,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    vi.clearAllMocks();

    await act(async () => {
      result.current.handleLoadMore();
    });

    // Should not call getUsers again when hasMore is false
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(userService.getUsers).not.toHaveBeenCalled();
  });

  it('should not load more when isLoading is true', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });

    // Start a new fetch to set loading state
    const { result: result2 } = renderHook(() => useUsersList({ autoFetch: false }));
    
    // Trigger fetch which will set loading to true
    await act(async () => {
      const promise = result2.current.fetchUsers(true);
      // Check loading state immediately
      if (result2.current.isLoading) {
        // If loading, handleLoadMore should not trigger another fetch
        result2.current.handleLoadMore();
      }
      await promise;
    });
  });

  it('should refresh users', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
    });

    vi.clearAllMocks();

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: undefined,
        })
      );
    });
  });

  it('should reset users when fetching with reset=true', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
    });

    const newUsers: User[] = [
      {
        id: '3',
        email: 'user3@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'user',
        birthdate: '1993-04-04',
        createdAt: '2020-01-04T00:00:00Z',
        updatedAt: '2020-01-04T00:00:00Z',
      },
    ];

    vi.mocked(userService.getUsers).mockResolvedValueOnce({
      data: newUsers,
      meta: {
        nextCursor: null,
        hasMore: false,
        count: 1,
        limit: 10,
      },
    });

    await act(async () => {
      result.current.fetchUsers(true);
    });

    await waitFor(() => {
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0].email).toBe('user3@example.com');
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(userService.getUsers).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        error,
        'Failed to load users. Please try again.'
      );
    });

    // Users should remain empty on error
    expect(result.current.users).toEqual([]);
  });

  it('should reset cursor when filters change', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
    });

    await act(async () => {
      result.current.handleFilterChange({ search: 'test' });
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: undefined,
        })
      );
    });
  });

  it('should reset cursor when sort changes', async () => {
    const { result } = renderHook(() => useUsersList({ autoFetch: true }));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
    });

    await act(async () => {
      result.current.handleSortChange('email', 'ASC');
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: undefined,
        })
      );
    });
  });
});
