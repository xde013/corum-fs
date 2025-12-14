import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}!
              </h2>
              <p className="text-gray-600">Email: {user?.email}</p>
              <p className="text-gray-600">Role: {user?.role}</p>
            </div>

            <div className="mt-8">
              <p className="text-gray-500">
                User management features will be available here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
