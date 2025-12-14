import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UserPagination } from './UserPagination';

describe('UserPagination', () => {
  const mockOnLoadMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when hasMore is false and count is 0', () => {
    const { container } = render(
      <UserPagination
        hasMore={false}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={0}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render count when users are present', () => {
    render(
      <UserPagination
        hasMore={false}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={5}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should use singular form for count of 1', () => {
    render(
      <UserPagination
        hasMore={false}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={1}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/user$/)).toBeInTheDocument();
  });

  it('should use plural form for count greater than 1', () => {
    render(
      <UserPagination
        hasMore={false}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={5}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/users$/)).toBeInTheDocument();
  });

  it('should show load more button when hasMore is true', () => {
    render(
      <UserPagination
        hasMore={true}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={10}
      />
    );

    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('should call onLoadMore when load more button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UserPagination
        hasMore={true}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={10}
      />
    );

    const loadMoreButton = screen.getByText('Load More');
    await user.click(loadMoreButton);

    expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
  });

  it('should disable load more button when isLoading is true', () => {
    render(
      <UserPagination
        hasMore={true}
        isLoading={true}
        onLoadMore={mockOnLoadMore}
        count={10}
      />
    );

    // When isLoading is true, Button shows "Loading..." instead of children
    const loadMoreButton = screen.getByText('Loading...');
    expect(loadMoreButton).toBeDisabled();
  });

  it('should show "No more users" message when hasMore is false and count > 0', () => {
    render(
      <UserPagination
        hasMore={false}
        isLoading={false}
        onLoadMore={mockOnLoadMore}
        count={10}
      />
    );

    expect(screen.getByText('No more users to load')).toBeInTheDocument();
  });
});
