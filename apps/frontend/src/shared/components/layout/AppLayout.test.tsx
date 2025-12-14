import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from './AppLayout';

// Mock Header and Footer
vi.mock('./Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('./Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('AppLayout', () => {
  it('should render header, main content, and footer', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render children in main element', () => {
    render(
      <AppLayout>
        <div data-testid="child">Child Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
