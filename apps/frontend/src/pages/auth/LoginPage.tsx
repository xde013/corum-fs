import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
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
