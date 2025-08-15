/**
 * Enhanced Skeleton System - Centralized Loading Animations
 * Professional and unified loading states for the entire application
 */

import { cn } from '@/lib/utils';

import { Skeleton } from './skeleton';

// Core animation styles (no scale, only elegant effects)
const ANIMATION_STYLES = {
  shimmer: 'animate-shimmer',
  fadeIn: 'animate-fade-in-up',
  pulse: 'animate-pulse', // Basic pulse without scale
} as const;

// Professional gradient backgrounds
const GRADIENT_VARIANTS = {
  default: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
  elegant: 'bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200',
  subtle: 'bg-gradient-to-r from-slate-100 via-white to-slate-100',
} as const;

// Delay classes for staggered animations
const DELAY_CLASSES = {
  0: '',
  100: 'delay-100',
  200: 'delay-200',
  300: 'delay-300',
  400: 'delay-400',
  500: 'delay-500',
  600: 'delay-600',
  700: 'delay-700',
  800: 'delay-800',
} as const;

interface EnhancedSkeletonProps {
  className?: string;
  delay?: keyof typeof DELAY_CLASSES;
  variant?: keyof typeof GRADIENT_VARIANTS;
  animation?: keyof typeof ANIMATION_STYLES;
  children?: React.ReactNode;
}

/**
 * Enhanced Skeleton with professional animations and gradients
 */
export function EnhancedSkeleton({
  className,
  delay = 0,
  variant = 'default',
  animation = 'pulse',
  children,
}: EnhancedSkeletonProps) {
  return (
    <Skeleton
      className={cn(
        GRADIENT_VARIANTS[variant],
        ANIMATION_STYLES[animation],
        DELAY_CLASSES[delay],
        className
      )}
    >
      {children}
    </Skeleton>
  );
}

/**
 * Skeleton Card Wrapper with professional styling
 */
interface SkeletonCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: keyof typeof DELAY_CLASSES;
}

export function SkeletonCard({
  children,
  className,
  delay = 0,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'animate-fade-in-up overflow-hidden rounded-lg border bg-white shadow-sm',
        DELAY_CLASSES[delay],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Professional Avatar Skeleton
 */
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  delay?: keyof typeof DELAY_CLASSES;
}

export function AvatarSkeleton({
  size = 'md',
  delay = 0,
}: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className="relative">
      <EnhancedSkeleton
        className={cn('rounded-full', sizeClasses[size])}
        delay={delay}
        variant="elegant"
      />
      {/* Shimmer overlay effect */}
      <div className="animate-shimmer absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
    </div>
  );
}

/**
 * Professional Text Lines Skeleton
 */
interface TextLinesSkeletonProps {
  lines: number;
  widths?: string[];
  delay?: keyof typeof DELAY_CLASSES;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

export function TextLinesSkeleton({
  lines,
  widths = [],
  delay = 0,
  spacing = 'normal',
}: TextLinesSkeletonProps) {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
  };

  return (
    <div className={spacingClasses[spacing]}>
      {Array.from({ length: lines }).map((_, index) => (
        <EnhancedSkeleton
          key={index}
          className={cn(
            'h-4',
            widths[index] || (index === lines - 1 ? 'w-3/4' : 'w-full')
          )}
          delay={delay}
          variant="subtle"
        />
      ))}
    </div>
  );
}

/**
 * Professional Badge Skeleton
 */
interface BadgeSkeletonProps {
  delay?: keyof typeof DELAY_CLASSES;
  size?: 'sm' | 'md';
}

export function BadgeSkeleton({ delay = 0, size = 'md' }: BadgeSkeletonProps) {
  const sizeClasses = {
    sm: 'h-5 w-16',
    md: 'h-6 w-20',
  };

  return (
    <EnhancedSkeleton
      className={cn('rounded-full', sizeClasses[size])}
      delay={delay}
      variant="elegant"
    />
  );
}

/**
 * Flexible Page Skeleton Container
 */
interface PageSkeletonProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSkeleton({ children, className }: PageSkeletonProps) {
  return (
    <div className={cn('animate-fade-in-up container mx-auto py-6', className)}>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
