export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-4 w-1/2"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4 shadow-sm">
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-6 w-1/3 mb-3"></div>
        <div className="bg-gray-200 rounded-lg h-8 w-1/2 mb-2"></div>
        <div className="bg-gray-200 rounded-lg h-4 w-2/3"></div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4 shadow-sm">
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-5 w-1/3 mb-3"></div>
        <div className="bg-gray-200 rounded-lg h-10 w-1/4 mb-2"></div>
        <div className="bg-gray-200 rounded-lg h-4 w-1/2"></div>
      </div>
    </div>
  );
}
