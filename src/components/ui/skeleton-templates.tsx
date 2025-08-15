/**
 * Flexible Skeleton Templates
 * Reusable skeleton templates for different page types
 */

import { Card, CardContent, CardHeader } from './card';
import {
  EnhancedSkeleton,
  SkeletonCard,
  AvatarSkeleton,
  TextLinesSkeleton,
  BadgeSkeleton,
  PageSkeleton,
} from './enhanced-skeleton';
import { Separator } from './separator';

/**
 * Template for details pages (guest, reservation, etc.)
 */
interface DetailsPageSkeletonProps {
  title?: string;
  showAvatar?: boolean;
  showBadge?: boolean;
  contactFields?: number;
  infoSections?: number;
  hasNotes?: boolean;
  hasSystemInfo?: boolean;
}

export function DetailsPageSkeleton({
  showAvatar = true,
  showBadge = true,
  contactFields = 2,
  infoSections = 3,
  hasNotes = true,
  hasSystemInfo = true,
}: DetailsPageSkeletonProps) {
  return (
    <PageSkeleton>
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {showAvatar && <AvatarSkeleton size="md" />}
          <EnhancedSkeleton className="h-8 w-64" />
          {showBadge && <BadgeSkeleton />}
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap items-center gap-4">
          {Array.from({ length: contactFields }).map((_, index) => (
            <div key={index} className="flex items-center gap-1">
              <EnhancedSkeleton className="h-3.5 w-3.5 rounded" delay={100} />
              <EnhancedSkeleton className="h-4 w-36" delay={100} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Information Sections */}
        {Array.from({ length: infoSections }).map((_, sectionIndex) => (
          <SkeletonCard
            key={sectionIndex}
            delay={
              (200 + sectionIndex * 100) as
                | 200
                | 300
                | 400
                | 500
                | 600
                | 700
                | 800
            }
          >
            <Card className="border-0 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <EnhancedSkeleton className="h-5 w-5 rounded" />
                  <EnhancedSkeleton className="h-6 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <TextLinesSkeleton lines={2} spacing="tight" />
                  <TextLinesSkeleton lines={2} spacing="tight" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TextLinesSkeleton
                      key={index}
                      lines={2}
                      spacing="tight"
                      widths={['w-20', 'w-16']}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </SkeletonCard>
        ))}

        {/* Notes Section */}
        {hasNotes && (
          <SkeletonCard delay={500}>
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <EnhancedSkeleton className="h-5 w-5 rounded" />
                  <EnhancedSkeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <TextLinesSkeleton
                  lines={3}
                  widths={['w-full', 'w-3/4', 'w-1/2']}
                />
              </CardContent>
            </Card>
          </SkeletonCard>
        )}

        {/* System Info */}
        {hasSystemInfo && (
          <SkeletonCard delay={500}>
            <Card className="border-0 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <EnhancedSkeleton className="h-4 w-4 rounded" />
                  <EnhancedSkeleton className="h-5 w-36" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <EnhancedSkeleton className="h-4 w-16" />
                    <EnhancedSkeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <EnhancedSkeleton className="h-4 w-24" />
                    <EnhancedSkeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SkeletonCard>
        )}
      </div>
    </PageSkeleton>
  );
}

/**
 * Template for list/table pages
 */
interface ListPageSkeletonProps {
  hasFilters?: boolean;
  tableRows?: number;
  columns?: number;
  hasPagination?: boolean;
}

export function ListPageSkeleton({
  hasFilters = true,
  tableRows = 5,
  columns = 4,
  hasPagination = true,
}: ListPageSkeletonProps) {
  return (
    <PageSkeleton>
      {/* Header */}
      <div className="flex items-center gap-3">
        <AvatarSkeleton size="md" />
        <div className="space-y-2">
          <EnhancedSkeleton className="h-8 w-48" />
          <EnhancedSkeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Filters */}
      {hasFilters && (
        <SkeletonCard delay={100}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <EnhancedSkeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <EnhancedSkeleton className="h-10 w-32" />
                <EnhancedSkeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </SkeletonCard>
      )}

      {/* Table */}
      <SkeletonCard delay={200}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <EnhancedSkeleton className="h-6 w-32" />
            <EnhancedSkeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div
            className={`grid grid-cols-${columns} bg-muted/50 gap-4 border-b p-4`}
          >
            {Array.from({ length: columns }).map((_, index) => (
              <EnhancedSkeleton key={index} className="h-4 w-20" />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: tableRows }).map((_, rowIndex) => (
            <div key={rowIndex}>
              <div
                className={`grid grid-cols-${columns} items-center gap-4 p-4`}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex}>
                    {colIndex === 0 && (
                      <div className="flex items-center gap-3">
                        <AvatarSkeleton size="sm" delay={100} />
                        <TextLinesSkeleton
                          lines={2}
                          spacing="tight"
                          widths={['w-24', 'w-16']}
                        />
                      </div>
                    )}
                    {colIndex !== 0 && colIndex === columns - 1 && (
                      <BadgeSkeleton delay={200} />
                    )}
                    {colIndex !== 0 && colIndex !== columns - 1 && (
                      <TextLinesSkeleton
                        lines={2}
                        spacing="tight"
                        widths={['w-32', 'w-28']}
                      />
                    )}
                  </div>
                ))}
              </div>
              {rowIndex < tableRows - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </SkeletonCard>

      {/* Pagination */}
      {hasPagination && (
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-4 w-32" delay={300} />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <EnhancedSkeleton
                key={index}
                className="h-8 w-8 rounded"
                delay={300}
              />
            ))}
          </div>
        </div>
      )}
    </PageSkeleton>
  );
}

/**
 * Template for dashboard pages
 */
interface DashboardSkeletonProps {
  metricsCount?: number;
  chartsCount?: number;
  hasTable?: boolean;
}

export function DashboardSkeleton({
  metricsCount = 6,
  chartsCount = 2,
  hasTable = true,
}: DashboardSkeletonProps) {
  return (
    <PageSkeleton>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: metricsCount }).map((_, index) => (
          <SkeletonCard
            key={index}
            delay={(index * 50) as 0 | 100 | 200 | 300 | 400 | 500}
          >
            <CardContent className="p-6">
              <div className="space-y-3">
                <EnhancedSkeleton className="h-4 w-20" />
                <EnhancedSkeleton className="h-8 w-16" />
                <EnhancedSkeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </SkeletonCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: chartsCount }).map((_, index) => (
          <SkeletonCard
            key={index}
            delay={(300 + index * 100) as 300 | 400 | 500}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <EnhancedSkeleton className="h-6 w-40" />
                <EnhancedSkeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </SkeletonCard>
        ))}
      </div>

      {/* Optional Table */}
      {hasTable && (
        <ListPageSkeleton
          hasFilters={false}
          tableRows={3}
          hasPagination={false}
        />
      )}
    </PageSkeleton>
  );
}
