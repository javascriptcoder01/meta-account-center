import React from 'react';

export const ActivityPagination = ({
  pagination,
  onPageChange,
  disabled = false,
}) => {
  const { page = 1, pages = 1, total = 0 } = pagination || {};

  if (!pages || pages <= 1) return null;

  const isFirstPage = page <= 1;
  const isLastPage = page >= pages;

  return (
    <nav
      aria-label="Activity history pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs"
    >
      <p className="text-slate-500 font-medium">
        Showing page <span className="font-bold text-slate-900">{page}</span> of{' '}
        <span className="font-bold text-slate-900">{pages}</span> ({total} total{' '}
        {total === 1 ? 'event' : 'events'})
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={isFirstPage || disabled}
          onClick={() => onPageChange(page - 1)}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <button
          type="button"
          aria-label="Next page"
          disabled={isLastPage || disabled}
          onClick={() => onPageChange(page + 1)}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <span>Next</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default ActivityPagination;
