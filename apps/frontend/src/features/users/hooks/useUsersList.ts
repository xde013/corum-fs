import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/shared/services/api/userService';
import type { User, UserListQuery, SortField, SortOrder } from '@/shared/types';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';
import { handleApiError } from '@/shared/utils/errorHandler';

interface UseUsersListOptions {
  autoFetch?: boolean;
  defaultSortBy?: SortField;
  defaultSortOrder?: SortOrder;
  defaultLimit?: number;
}

export const useUsersList = (options: UseUsersListOptions = {}) => {
  const {
    autoFetch = true,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'DESC',
    defaultLimit = 10,
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Partial<UserListQuery>>({});
  const [sortBy, setSortBy] = useState<SortField>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [limit] = useState(defaultLimit);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const fetchUsersOperation = async (query: UserListQuery) => {
    return await userService.getUsers(query);
  };

  const { execute: executeFetchUsers, isLoading } = useAsyncOperation(fetchUsersOperation);

  const fetchUsers = useCallback(
    async (reset = false, currentCursor?: string) => {
      try {
        const query: UserListQuery = {
          ...filters,
          sortBy,
          sortOrder,
          limit,
          cursor: reset ? undefined : currentCursor,
        };

        const response = await executeFetchUsers(query);
        if (!response) return;

        if (reset) {
          setUsers(response.data);
        } else {
          setUsers((prev) => [...prev, ...response.data]);
        }

        setHasMore(response.meta.hasMore);
        setCursor(response.meta.nextCursor || undefined);
      } catch (error) {
        handleApiError(error, 'Failed to load users. Please try again.');
      }
    },
    [filters, sortBy, sortOrder, limit, executeFetchUsers]
  );

  useEffect(() => {
    if (autoFetch) {
      setCursor(undefined);
      fetchUsers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, sortOrder, autoFetch]);

  const handleFilterChange = useCallback((newFilters: Partial<UserListQuery>) => {
    setFilters(newFilters);
    setCursor(undefined);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: SortField, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setCursor(undefined);
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && cursor) {
      fetchUsers(false, cursor);
    }
  }, [hasMore, isLoading, cursor, fetchUsers]);

  const refresh = useCallback(() => {
    setCursor(undefined);
    fetchUsers(true);
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    filters,
    sortBy,
    sortOrder,
    hasMore,
    count: users.length,
    handleFilterChange,
    handleSortChange,
    handleLoadMore,
    refresh,
    fetchUsers,
  } as const;
};

export type UseUsersListReturn = ReturnType<typeof useUsersList>;
