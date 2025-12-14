import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../../utils/validation';
import { Input } from '../forms/Input';
import { Button } from '../ui/Button';
import { authService } from '../../services/api/authService';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.forgotPassword(data);
      toast.success(
        'If an account with that email exists, a password reset link has been sent.',
        { duration: 6000 }
      );
      navigate('/auth/login');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Enter your email address and we'll send you a link to reset your
        password.
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex gap-3">
        <Link to="/auth/login" className="flex-1">
          <Button type="button" variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Send Reset Link
        </Button>
      </div>
    </form>
  );
};
