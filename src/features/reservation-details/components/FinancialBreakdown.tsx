import { ChevronDown, Euro } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
  calculateTotalAmount,
  extractFinancialBreakdown,
  getDepositInfo,
} from '@/features/reservation-details/utils/data-processors';
import { cn } from '@/lib/utils';
import type { ReservationDetails } from '@/types/reservation-details';

interface FinancialBreakdownProps {
  reservation: ReservationDetails;
}

export function FinancialBreakdown({ reservation }: FinancialBreakdownProps) {
  const financialBreakdown = extractFinancialBreakdown(reservation);
  const totalAmount = calculateTotalAmount(reservation);
  const depositInfo = getDepositInfo(reservation);

  // Auto-expand categories that have content
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    return financialBreakdown
      .filter(breakdown => breakdown.items.length > 0)
      .map(breakdown => breakdown.category);
  });

  const formatCurrency = (
    amount: number | undefined,
    currency = totalAmount.currency
  ) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isExpanded = (category: string) =>
    expandedCategories.includes(category);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Détail financier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick summary at top */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total HT</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalAmount.ht)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">TVA</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalAmount.vat)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total TTC</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(totalAmount.ttc)}
              </p>
            </div>
          </div>

          {/* Categories breakdown */}
          {financialBreakdown.length > 0 ? (
            <div className="space-y-4">
              {financialBreakdown.map(breakdown => (
                <div key={breakdown.category} className="border rounded-lg">
                  <button
                    onClick={() => toggleCategory(breakdown.category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{breakdown.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ({breakdown.items.length}{' '}
                        {breakdown.items.length > 1 ? 'lignes' : 'ligne'})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {formatCurrency(breakdown.totalTTC)}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded(breakdown.category) &&
                            'transform rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded(breakdown.category) && (
                    <div className="px-4 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">HT</TableHead>
                            <TableHead className="text-right">TVA</TableHead>
                            <TableHead className="text-right">TTC</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell
                                className={
                                  item.isDiscount ? 'text-destructive' : ''
                                }
                              >
                                {item.isDiscount && '- '}
                                {item.label}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.amountHT)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.amountVAT)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(item.amountTTC)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun détail financier disponible</p>
            </div>
          )}

          {/* Deposit information */}
          {depositInfo.hasDeposit && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Caution
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Montant retenu ou à prélever
                  </p>
                </div>
                <span className="text-lg font-medium text-orange-600">
                  {formatCurrency(depositInfo.amount)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm" className="flex-1">
              Télécharger la facture
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Voir les paiements
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
