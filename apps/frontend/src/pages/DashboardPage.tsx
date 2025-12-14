import { useAuth } from '../hooks/useAuth';
import { useUsersList } from '../hooks/useUsersList';
import { useNavigate } from 'react-router-dom';
import { UsersListSection } from '../components/users/UsersListSection';
import { NonAdminMessage } from '../components/dashboard/NonAdminMessage';
import type { User } from '../types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const usersList = useUsersList({
    autoFetch: user?.role === 'admin',
  });

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'admin' ? (
          <UsersListSection
            usersList={usersList}
            onRowClick={handleRowClick}
          />
        ) : (
          <NonAdminMessage />
        )}
      </div>
    </div>
  );
};
