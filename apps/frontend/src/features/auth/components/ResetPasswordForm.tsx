import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/shared/utils/validation';
import { PasswordInput } from '@/shared/components/forms/PasswordInput';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/features/auth/services/authService';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    } else {
      toast.error('Invalid reset token. Please check your email link.');
    }
  }, [token, setValue]);

  const resetPasswordOperation = async (token: string, newPassword: string) => {
    await authService.resetPassword({ token, newPassword });
  };

  const { submit: onSubmit, isLoading } = useFormSubmission(resetPasswordOperation, {
    successMessage: 'Password has been successfully reset!',
    errorMessage: 'Invalid or expired reset token. Please request a new one.',
    redirectTo: '/auth/login',
    redirectOptions: { replace: true },
  });

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token. Please check your email link.');
      return;
    }

    await onSubmit(data.token, data.newPassword);
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <Button
          variant="primary"
          onClick={() => navigate('/auth/forgot-password')}
          className="w-full"
        >
          Request New Reset Link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <PasswordInput
        label="New Password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        helperText="Must contain uppercase, lowercase, number, and special character"
        required
        {...register('newPassword')}
      />

      <input type="hidden" {...register('token')} />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset Password
      </Button>
    </form>
  );
};
