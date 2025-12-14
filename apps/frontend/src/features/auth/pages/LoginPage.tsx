import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/shared/components/layout/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { validateRedirectPath } from '@/shared/utils/redirectValidation';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const fromPath = (location.state as any)?.from?.pathname;
      const safePath = validateRedirectPath(fromPath);
      navigate(safePath, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const message = (location.state as any)?.message;
    if (message) {
      toast.success(message);
    }
  }, [location]);

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials to access the admin panel"
    >
      <LoginForm />
    </AuthLayout>
  );
};
