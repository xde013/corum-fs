import { render, screen } from '@/shared/utils/testUtils';
import { PageLayout } from './PageLayout';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PageLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <PageLayout title="Test Page">
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <PageLayout title="Test Page" subtitle="Test Subtitle">
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render back button when showBackButton is true', () => {
    render(
      <PageLayout title="Test Page" showBackButton>
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it('should not render back button when showBackButton is false', () => {
    render(
      <PageLayout title="Test Page" showBackButton={false}>
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.queryByText(/back to dashboard/i)).not.toBeInTheDocument();
  });

  it('should use custom back button text', () => {
    render(
      <PageLayout title="Test Page" showBackButton backButtonText="Go Back">
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should navigate to custom path when back button is clicked', () => {
    render(
      <PageLayout
        title="Test Page"
        showBackButton
        backButtonTo="/custom-path"
      >
        <div>Content</div>
      </PageLayout>
    );

    const backButton = screen.getByText(/back to dashboard/i);
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/custom-path');
  });

  it('should use correct max width class', () => {
    const { container } = render(
      <PageLayout title="Test Page" maxWidth="7xl">
        <div>Content</div>
      </PageLayout>
    );

    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
  });

  it('should render subtitle as ReactNode', () => {
    render(
      <PageLayout
        title="Test Page"
        subtitle={<span data-testid="custom-subtitle">Custom Subtitle</span>}
      >
        <div>Content</div>
      </PageLayout>
    );

    expect(screen.getByTestId('custom-subtitle')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PageLayout title="Test Page" className="custom-class">
        <div>Content</div>
      </PageLayout>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
