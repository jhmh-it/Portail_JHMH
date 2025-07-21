import { Skeleton } from '@/components/ui/skeleton';

export function ReservationDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-48" /> {/* Back button */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-64" /> {/* Title */}
              <Skeleton className="h-6 w-24" /> {/* Badge */}
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" /> {/* Guest name */}
              <Skeleton className="h-5 w-56" /> {/* Property */}
              <Skeleton className="h-5 w-40" /> {/* Platform */}
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" /> {/* Button */}
            <Skeleton className="h-9 w-36" /> {/* Button */}
          </div>
        </div>
        <Skeleton className="h-[1px] w-full" /> {/* Separator */}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stay information cards */}
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />

        {/* Guest and financial cards */}
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />

        {/* Additional details */}
        <Skeleton className="h-48 lg:col-span-2" />
      </div>
    </div>
  );
}
