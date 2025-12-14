import { AuthLayout } from '@/shared/components/layout/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const ResetPasswordPage = () => {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your new password below"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};
