import { AuthLayout } from '../../layouts/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

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
