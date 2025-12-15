import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi } from 'vitest';
import { ResetPasswordPage } from './ResetPasswordPage';

// Mock AuthLayout
vi.mock('@/shared/components/layout/AuthLayout', () => ({
  AuthLayout: ({ children, title, subtitle }: any) => (
    <div data-testid="auth-layout">
      <h1 data-testid="auth-title">{title}</h1>
      {subtitle && <p data-testid="auth-subtitle">{subtitle}</p>}
      {children}
    </div>
  ),
}));

// Mock ResetPasswordForm
vi.mock('@/features/auth/components/ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form">ResetPasswordForm</div>,
}));

describe('ResetPasswordPage', () => {
  it('should render AuthLayout with correct title and subtitle', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('auth-title')).toHaveTextContent('Set new password');
    expect(screen.getByTestId('auth-subtitle')).toHaveTextContent(
      'Enter your new password below'
    );
  });

  it('should render ResetPasswordForm', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });
});
