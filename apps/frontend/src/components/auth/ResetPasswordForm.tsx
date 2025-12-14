import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../../utils/validation';
import { PasswordInput } from '../forms/PasswordInput';
import { Button } from '../ui/Button';
import { authService } from '../../services/api/authService';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token. Please check your email link.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      toast.success('Password has been successfully reset!');
      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'Invalid or expired reset token. Please request a new one.'
      );
    } finally {
      setIsLoading(false);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PasswordInput
        label="New Password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        helperText="Must contain uppercase, lowercase, number, and special character"
        {...register('newPassword')}
      />

      <input type="hidden" {...register('token')} />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset Password
      </Button>
    </form>
  );
};
