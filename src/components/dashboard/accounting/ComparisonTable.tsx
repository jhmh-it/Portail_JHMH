import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatValue,
  getPerformanceColorClass,
  calculateChangePercentage,
  getSafeValue,
} from '@/lib/dashboard-utils';
import type { ComparisonRowData } from '@/types/dashboard';

interface ComparisonTableProps {
  title: string;
  subtitle?: string;
  data: ComparisonRowData[];
  headers: {
    label: string;
    current: string;
    previous: string;
    change: string;
  };
}

export function ComparisonTable({
  title,
  subtitle,
  data,
  headers,
}: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy text-base">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{headers.label}</TableHead>
              <TableHead className="text-center">{headers.current}</TableHead>
              <TableHead className="text-center">{headers.previous}</TableHead>
              <TableHead className="text-center">{headers.change}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const current = getSafeValue(row.current);
              const previous = getSafeValue(row.previous);
              const changePercentage = calculateChangePercentage(
                current,
                previous
              );
              const isPositiveChange = changePercentage >= 0;

              return (
                <TableRow key={`comparison-row-${index}`}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-center font-bold">
                    {formatValue(current, row.format)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatValue(previous, row.format)}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.changeType === 'neutral' ? (
                      <Badge variant="outline">N/A</Badge>
                    ) : (
                      <span
                        className={`font-medium ${getPerformanceColorClass(
                          current,
                          previous,
                          row.changeType
                        )}`}
                        aria-label={`Évolution: ${changePercentage.toFixed(1)}%`}
                      >
                        {isPositiveChange ? '+' : ''}
                        {changePercentage.toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
