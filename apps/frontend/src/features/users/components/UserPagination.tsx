import { Button } from '@/shared/components/ui/Button';
import { FiChevronRight } from 'react-icons/fi';

interface UserPaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  count: number;
}

export const UserPagination = ({
  hasMore,
  isLoading,
  onLoadMore,
  count,
}: UserPaginationProps) => {
  if (!hasMore && count === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{count}</span> user{count !== 1 ? 's' : ''}
      </div>
      {hasMore && (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          isLoading={isLoading}
          disabled={isLoading}
        >
          <FiChevronRight className="h-4 w-4 mr-1" />
          Load More
        </Button>
      )}
      {!hasMore && count > 0 && (
        <div className="text-sm text-gray-500">No more users to load</div>
      )}
    </div>
  );
};
