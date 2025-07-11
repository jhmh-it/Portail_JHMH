import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  formatValue,
  getPerformanceColorClass,
  calculateChangePercentage,
  getSafeValue,
} from '@/lib/dashboard-utils';

interface PerformanceData {
  label: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  badgeText?: string;
}

interface PerformanceCardProps {
  title: string;
  subtitle?: string;
  mainMetric: PerformanceData;
  comparisonMetric?: {
    value: number;
    label: string;
    type: 'higher_better' | 'lower_better';
  };
  additionalMetrics?: PerformanceData[];
  icon?: React.ComponentType<{ className?: string }>;
}

export function PerformanceCard({
  title,
  subtitle,
  mainMetric,
  comparisonMetric,
  additionalMetrics = [],
  icon: Icon,
}: PerformanceCardProps) {
  const mainValue = getSafeValue(mainMetric.value);
  const comparisonValue = getSafeValue(comparisonMetric?.value);

  const hasComparison = comparisonMetric && comparisonValue !== 0;
  const changePercentage = hasComparison
    ? calculateChangePercentage(mainValue, comparisonValue)
    : 0;

  const isPositive = changePercentage >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-navy flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Métrique principale */}
          <div className="text-center">
            <div
              className="text-2xl font-bold text-navy mb-2"
              aria-live="polite"
            >
              {formatValue(mainValue, mainMetric.format)}
            </div>
            <div className="text-sm text-muted-foreground">
              {mainMetric.label}
            </div>
            {mainMetric.badgeText && (
              <Badge className="mt-2">{mainMetric.badgeText}</Badge>
            )}
          </div>

          {/* Comparaison si disponible */}
          {hasComparison && (
            <>
              <Separator />
              <div className="flex flex-col items-center gap-2" role="status">
                <div className="flex items-center gap-2">
                  <TrendIcon
                    className={`h-4 w-4 ${getPerformanceColorClass(
                      mainValue,
                      comparisonValue,
                      comparisonMetric.type
                    )}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-medium ${getPerformanceColorClass(
                      mainValue,
                      comparisonValue,
                      comparisonMetric.type
                    )}`}
                  >
                    {isPositive ? '+' : ''}
                    {changePercentage.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {comparisonMetric.label}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Référence : {formatValue(comparisonValue, mainMetric.format)}
                </div>
              </div>
            </>
          )}

          {/* Métriques additionnelles */}
          {additionalMetrics.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {additionalMetrics.map((metric, index) => (
                  <div
                    key={`additional-metric-${index}`}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">
                        {formatValue(getSafeValue(metric.value), metric.format)}
                      </span>
                      {metric.badgeText && (
                        <Badge variant="outline" className="ml-2">
                          {metric.badgeText}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
