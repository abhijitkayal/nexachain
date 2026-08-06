export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-zinc-800 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-xl p-6 transition-colors">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-xl overflow-hidden transition-colors">
    <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:shadow-lg dark:shadow-black/20 rounded-xl p-6 transition-colors">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
);
