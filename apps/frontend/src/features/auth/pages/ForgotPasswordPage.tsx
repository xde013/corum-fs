import { AuthLayout } from '@/shared/components/layout/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
