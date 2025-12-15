import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi } from 'vitest';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import React from 'react';

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

// Mock ForgotPasswordForm
vi.mock('@/features/auth/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">ForgotPasswordForm</div>,
}));

describe('ForgotPasswordPage', () => {
  it('should render AuthLayout with correct title and subtitle', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('auth-title')).toHaveTextContent('Reset your password');
    expect(screen.getByTestId('auth-subtitle')).toHaveTextContent(
      'Enter your email to receive a password reset link'
    );
  });

  it('should render ForgotPasswordForm', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
