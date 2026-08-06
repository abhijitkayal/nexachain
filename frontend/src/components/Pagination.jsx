import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <span className="text-sm text-gray-600 dark:text-zinc-400">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const EmptyState = ({ message = 'No data found' }) => (
  <div className="text-center py-12">
    <p className="text-gray-500 dark:text-zinc-400">{message}</p>
  </div>
);
