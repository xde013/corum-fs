import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUsersList } from '@/features/users/hooks/useUsersList';
import { useNavigate } from 'react-router-dom';
import { UsersListSection } from '@/features/users/components/UsersListSection';
import { NonAdminMessage } from '@/features/dashboard/components/NonAdminMessage';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import type { User } from '@/shared/types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const usersList = useUsersList({
    autoFetch: user?.role === 'admin',
  });

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  return (
    <PageLayout maxWidth="7xl">
      {user?.role === 'admin' ? (
        <UsersListSection
          usersList={usersList}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
        />
      ) : (
        <NonAdminMessage />
      )}
    </PageLayout>
  );
};
