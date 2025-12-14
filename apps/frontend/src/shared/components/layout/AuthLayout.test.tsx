import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect } from 'vitest';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('should render title', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <AuthLayout title="Test Title">
        <div data-testid="child">Child Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render brand name', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Corum FS')).toBeInTheDocument();
  });

  it('should have link to home', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Content</div>
      </AuthLayout>
    );

    const link = screen.getByText('Corum FS').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });
});
