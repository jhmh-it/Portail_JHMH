import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatValue,
  getPerformanceColorClass,
  getTrendIcon,
} from '@/lib/dashboard-utils';
import type { MetricCardProps } from '@/types/dashboard';

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

export function MetricCard({
  title,
  value,
  format = 'number',
  subtitle,
  size = 'md',
  trend,
  icon: Icon,
}: MetricCardProps) {
  const formattedValue =
    typeof value === 'number' ? formatValue(value, format) : value;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const TrendComponent = trend
    ? TrendIcon[
        getTrendIcon(typeof trend.value === 'number' ? trend.value : 0, 0)
      ]
    : null;

  return (
    <Card
      className="transition-shadow hover:shadow-md"
      role="article"
      aria-labelledby={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <CardHeader className="pb-2">
        <CardTitle
          id={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-sm font-medium text-muted-foreground flex items-center gap-2"
        >
          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div
            className={`font-bold text-navy ${sizeClasses[size]}`}
            aria-live="polite"
          >
            {formattedValue}
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground" role="note">
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className="flex items-center gap-2"
              role="status"
              aria-label={`Tendance: ${trend.label}`}
            >
              {TrendComponent && (
                <TrendComponent
                  className={`h-3 w-3 ${getPerformanceColorClass(
                    typeof trend.value === 'number' ? trend.value : 0,
                    0,
                    trend.type === 'positive' ? 'higher_better' : 'lower_better'
                  )}`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`text-sm font-medium ${getPerformanceColorClass(
                  typeof trend.value === 'number' ? trend.value : 0,
                  0,
                  trend.type === 'positive' ? 'higher_better' : 'lower_better'
                )}`}
              >
                {typeof trend.value === 'number'
                  ? `${trend.value > 0 ? '+' : ''}${trend.value.toFixed(1)}%`
                  : trend.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
