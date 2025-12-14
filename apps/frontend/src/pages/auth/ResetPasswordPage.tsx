import { AuthLayout } from '../../layouts/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

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
