import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/shared/utils/validation';
import { Input } from '@/shared/components/forms/Input';
import { PasswordInput } from '@/shared/components/forms/PasswordInput';
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';

export const LoginForm = () => {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginOperation = async (email: string, password: string) => {
    await login(email, password);
  };

  const { submit: onSubmit, isLoading } = useFormSubmission(loginOperation, {
    successMessage: 'Welcome back!',
    errorMessage: 'Invalid email or password. Please try again.',
    redirectTo: '/dashboard',
    redirectOptions: { replace: true },
    errorOptions: { duration: 10_000 },
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    // Trim email input
    await onSubmit(data.email.trim(), data.password);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <PasswordInput
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <a
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign in
      </Button>
    </form>
  );
};
