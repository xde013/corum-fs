import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render footer with text', () => {
    render(<Footer />);
    expect(screen.getByText(/Made with ❤️ by/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ryan' })).toBeInTheDocument();
  });

  it('should have footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should have link to GitHub profile', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'Ryan' });
    expect(link).toHaveAttribute('href', 'https://github.com/xde013');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
