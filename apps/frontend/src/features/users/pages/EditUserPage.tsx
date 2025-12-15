import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditUserForm } from '@/features/users/components/EditUserForm';
import { DeleteUserModal } from '@/features/users/components/DeleteUserModal';
import { userService } from '@/shared/services/api/userService';
import type { UpdateUserFormData } from '@/shared/utils/validation';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { FiEdit2 } from 'react-icons/fi';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';
import { handleApiError } from '@/shared/utils/errorHandler';
import type { User } from '@/shared/types';

export const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchUserOperation = useCallback(async (userId: string) => {
    return await userService.getUserById(userId);
  }, []);
  const updateUserOperation = useCallback(async (userId: string, updateData: any) => {
    await userService.updateUser(userId, updateData);
    return await userService.getUserById(userId);
  }, []);
  const deleteUserOperation = useCallback(async (userId: string) => {
    await userService.deleteUser(userId);
  }, []);

  const { execute: executeFetchUser, isLoading } = useAsyncOperation(fetchUserOperation);
  const { execute: executeUpdateUser } = useAsyncOperation(updateUserOperation);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const userData = await executeFetchUser(id);
        setUser(userData);
      } catch (error) {
        handleApiError(error, 'Failed to load user. Please try again.');
        navigate('/dashboard');
      }
    };

    fetchUser();
  }, [executeFetchUser, id, navigate]);

  const updateUserWithData = async (id: string, data: UpdateUserFormData) => {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthdate: data.birthdate,
      role: data.role,
    };

    // Only include password if it's provided
    if (data.password && data.password.trim() !== '') {
      updateData.password = data.password;
    }

    return await executeUpdateUser(id, updateData);
  };

  const { submit: handleSubmit, isLoading: isSaving } = useFormSubmission(
    (id: string, data: UpdateUserFormData) => updateUserWithData(id, data),
    {
      successMessage: 'User updated successfully',
      errorMessage: 'Failed to update user. Please try again.',
      onSuccess: async (updatedUser: User | undefined) => {
        setIsEditMode(false);
        if (updatedUser) {
          setUser(updatedUser);
        }
      },
    }
  );

  const { submit: handleDeleteSubmit, isLoading: isDeleting } = useFormSubmission(
    deleteUserOperation,
    {
      successMessage: 'User deleted successfully',
      errorMessage: 'Failed to delete user. Please try again.',
      redirectTo: '/dashboard',
      onError: () => {
        setShowDeleteModal(false);
      },
    }
  );

  const handleSubmitWrapper = async (data: UpdateUserFormData) => {
    if (!id) return;
    await handleSubmit(id, data);
  };

  const handleDelete = async () => {
    if (!id) return;
    await handleDeleteSubmit(id);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout
        title="Edit User"
        showBackButton
      >
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit User"
      subtitle={`Update user information for ${user.firstName} ${user.lastName}`}
      showBackButton
    >
      <div className="bg-white shadow rounded-lg p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="cursor-pointer"
            >
              <FiEdit2 className="h-4 w-4 mr-2" />
              {isEditMode ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          <EditUserForm
            user={user}
            onSubmit={handleSubmitWrapper}
            onDelete={() => setShowDeleteModal(true)}
            isLoading={isSaving}
            isDeleting={isDeleting}
            onCancel={() => setIsEditMode(false)}
            isReadOnly={!isEditMode}
          />
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </div>
          )}
      </div>

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        userName={`${user.firstName} ${user.lastName}`}
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};
