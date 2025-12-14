import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/api/userService';
import { ProfileForm } from '../components/profile/ProfileForm';
import toast from 'react-hot-toast';
import type { ProfileFormData } from '../utils/validation';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoadingProfile(true);
    try {
      await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiUser className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>
            <ProfileForm
              user={user}
              onSubmit={handleProfileSubmit}
              isLoading={isLoadingProfile}
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
              onClick={() => navigate('/auth/forgot-password')}
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
        </div>
      </div>
    </div>
  );
};
