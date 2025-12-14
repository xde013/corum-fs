import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { UsersTable } from './UsersTable';
import { UserFilters } from './UserFilters';
import { UserPagination } from './UserPagination';
import { FiPlus } from 'react-icons/fi';
import type { User } from '../../types';
import type { UseUsersListReturn } from '../../hooks/useUsersList';

interface UsersListSectionProps {
  usersList: UseUsersListReturn;
  onRowClick?: (user: User) => void;
  showCreateButton?: boolean;
}

export const UsersListSection = ({
  usersList,
  onRowClick,
  showCreateButton = true,
}: UsersListSectionProps) => {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    filters,
    sortBy,
    sortOrder,
    hasMore,
    count,
    handleFilterChange,
    handleSortChange,
    handleLoadMore,
  } = usersList;

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        {showCreateButton && (
          <Button
            variant="primary"
            onClick={() => navigate('/users/new')}
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        )}
      </div>

      <UserFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User List</h3>
        </div>

        <UsersTable
          data={users}
          onRowClick={onRowClick}
          isLoading={isLoading && users.length === 0}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        <UserPagination
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          count={count}
        />
      </div>
    </>
  );
};
