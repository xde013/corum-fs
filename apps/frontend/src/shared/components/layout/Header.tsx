import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FiUser, FiUsers } from 'react-icons/fi';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            >
              <FiUsers className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            >
              <FiUser className="h-4 w-4 mr-2" />
              Profile
            </button>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Avatar for small screens */}
            <button
              onClick={() => navigate('/profile')}
              className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              aria-label="Profile"
            >
              {user?.firstName && user?.lastName ? (
                <span className="text-sm">
                  {user.firstName.charAt(0).toUpperCase()}
                  {user.lastName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <FiUser className="h-5 w-5" />
              )}
            </button>

            {/* User Info for larger screens */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
