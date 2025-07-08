'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataGridItem {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

interface DataGridProps {
  title: string;
  subtitle?: string;
  items: DataGridItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DataGrid({
  title,
  subtitle,
  items,
  columns = 2,
  className,
}: DataGridProps) {
  const formatValue = (
    value: string | number,
    format?: DataGridItem['format']
  ): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value);
      default:
        return value.toString();
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div>
          <CardTitle className="text-navy">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-4', gridCols[columns])}>
          {items.map((item, index) => (
            <div key={item.label || `item-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge
                    variant={item.badge.variant}
                    className={cn('text-xs', item.badge.className)}
                  >
                    {item.badge.text}
                  </Badge>
                )}
              </div>

              <div className="text-lg font-semibold text-navy">
                {formatValue(item.value, item.format)}
              </div>

              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
