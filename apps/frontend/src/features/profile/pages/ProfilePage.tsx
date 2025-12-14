import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { userService } from '@/features/users/services/userService';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import type { ProfileFormData } from '@/shared/utils/validation';
import { FiUser, FiLock, FiMail, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { Button } from '@/shared/components/ui/Button';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';
import { handleApiSuccess } from '@/shared/utils/errorHandler';

export const ProfilePage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const updateProfileOperation = async (data: ProfileFormData) => {
    await userService.updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      birthdate: data.birthdate,
    });
    await refreshUser();
  };

  const { submit: handleProfileSubmit, isLoading: isLoadingProfile } = useFormSubmission(
    updateProfileOperation,
    {
      successMessage: 'Profile updated successfully',
      errorMessage: 'Failed to update profile. Please try again.',
      onSuccess: () => {
        setIsEditMode(false);
      },
    }
  );

  const handleLogout = async () => {
    await logout();
    handleApiSuccess('You have been logged out');
    navigate('/auth/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your account information"
      showBackButton
    >
      <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white shadow rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FiUser className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
              </div>
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
            <ProfileForm
              user={user}
              onSubmit={handleProfileSubmit}
              isLoading={isLoadingProfile}
              onCancel={() => setIsEditMode(false)}
              isReadOnly={!isEditMode}
            />
          </div>

          {/* Change Password */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiLock className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              To change your password, please use the password reset feature. You will receive an email with instructions.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/auth/forgot-password', { 
                state: { email: user.email } 
              })}
              className="cursor-pointer"
            >
              <FiMail className="h-4 w-4 mr-2" />
              Request Password Reset
            </Button>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Logout Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiLogOut className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Logout</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sign out of your account. You will need to log in again to access the system.
            </p>
            <Button variant="danger" onClick={handleLogout} className="cursor-pointer">
              <FiLogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
    </PageLayout>
  );
};
