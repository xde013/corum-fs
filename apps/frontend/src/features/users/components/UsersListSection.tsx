import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { UsersTable } from './UsersTable';
import { UserFilters } from './UserFilters';
import { UserPagination } from './UserPagination';
import { DeleteUserModal } from './DeleteUserModal';
import { userService } from '@/features/users/services/userService';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import type { User } from '@/shared/types';
import type { UseUsersListReturn } from '@/features/users/hooks/useUsersList';

interface UsersListSectionProps {
  usersList: UseUsersListReturn;
  onRowClick?: (user: User) => void;
  onEdit?: (user: User) => void;
  showCreateButton?: boolean;
}

export const UsersListSection = ({
  usersList,
  onRowClick,
  onEdit,
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
    refresh,
  } = usersList;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      refresh();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to delete user. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
            Add
          </Button>
        )}
      </div>

      <UserFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        </div>

        <UsersTable
          data={users}
          onRowClick={onRowClick}
          onEdit={onEdit}
          onDelete={handleDelete}
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

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        userName={
          userToDelete
            ? `${userToDelete.firstName} ${userToDelete.lastName}`
            : ''
        }
        isLoading={isDeleting}
      />
    </>
  );
};
