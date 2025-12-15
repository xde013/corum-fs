import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { UsersTable } from './UsersTable';
import { UserFilters } from './UserFilters';
import { UserPagination } from './UserPagination';
import { DeleteUserModal } from './DeleteUserModal';
import { userService } from '@/features/users/services/userService';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const handleDelete = (user: User) => {
    setIsBulkDelete(false);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedUserIds.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (isBulkDelete) {
        const result = await userService.bulkDeleteUsers(selectedUserIds);
        if (result.deleted > 0) {
          toast.success(result.message || `Deleted ${result.deleted} users`);
        }
        if (result.failed.length > 0) {
          toast.error(
            `Failed to delete ${result.failed.length} user(s): ${result.failed.join(
              ', '
            )}`
          );
        }
      } else {
        if (!userToDelete) return;
        await userService.deleteUser(userToDelete.id);
        toast.success('User deleted successfully');
      }
      refresh();
      setShowDeleteModal(false);
      setUserToDelete(null);
      setSelectedUserIds([]);
      setIsBulkDelete(false);
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
        <div className="flex items-center gap-3">
          {selectedUserIds.length > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDeleteClick}
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete selected ({selectedUserIds.length})
            </Button>
          )}
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
        selectedUserIds={selectedUserIds}
        onToggleUserSelection={(userId) => {
          setSelectedUserIds((prev) =>
            prev.includes(userId)
              ? prev.filter((id) => id !== userId)
              : [...prev, userId]
          );
        }}
        onToggleAllSelection={(userIds) => {
          setSelectedUserIds((prev) =>
            prev.length === userIds.length ? [] : userIds
          );
        }}
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
          setIsBulkDelete(false);
        }}
        onConfirm={handleDeleteConfirm}
        userName={
          isBulkDelete
            ? `${selectedUserIds.length} selected user(s)`
            : userToDelete
            ? `${userToDelete.firstName} ${userToDelete.lastName}`
            : ''
        }
        isLoading={isDeleting}
      />
    </>
  );
};
