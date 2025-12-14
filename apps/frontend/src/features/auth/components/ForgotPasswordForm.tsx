import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/shared/utils/validation';
import { Input } from '@/shared/components/forms/Input';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/features/auth/services/authService';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';

export const ForgotPasswordForm = () => {
  const [resetLink, setResetLink] = useState<string | null>(null);
  const location = useLocation();
  const prefilledEmail = (location.state as any)?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: prefilledEmail || '',
    },
  });

  // Update form value if email is provided via location state
  useEffect(() => {
    if (prefilledEmail) {
      setValue('email', prefilledEmail);
    }
  }, [prefilledEmail, setValue]);

  // Example values - in production, these would come from the API response

  const forgotPasswordOperation = async (email: string) => {
    await authService.forgotPassword({ email });
  };

  const { submit: onSubmit, isLoading } = useFormSubmission(forgotPasswordOperation, {
    successMessage: 'Password reset link generated',
    errorMessage: 'An error occurred. Please try again.',
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    const trimmedEmail = data.email.trim();
    try {
      await onSubmit(trimmedEmail);
      // Set reset link after successful submission
      setResetLink(`${window.location.origin}/auth/reset-password?token=${trimmedEmail}`);
      reset();
    } catch {
      // Error is handled by useFormSubmission
    }
  };


  if (resetLink) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Development Only:</strong> This reset link display is for development purposes only. 
            In production, the reset link would be sent via email and not displayed in the UI.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">

              <p className="text-sm text-green-700 mb-4">
                If an account with that email exists, use the link below to reset your password.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Reset Link:</div>
                <div className="flex items-center gap-2">
                  <a
                    href={resetLink}
                    className="flex-1 text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                      {resetLink}
                  </a>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
        <Link to="/auth/login" className="block">
          <Button variant="primary" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Enter your email address and we'll send you a link to reset your
        password.
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="john.doe@example.com"
        autoComplete="email"
        error={errors.email?.message}
        required
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
