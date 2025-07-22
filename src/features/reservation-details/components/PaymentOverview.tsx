import { CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReservationDetails } from '@/types/reservation-details';

interface PaymentOverviewProps {
  reservation: ReservationDetails;
}

export function PaymentOverview({ reservation }: PaymentOverviewProps) {
  const currency = reservation.currency ?? reservation.money_currency ?? 'EUR';

  // Extract payment data - checking both old and new field names
  const totalDue =
    reservation.TOTAL_TTC ??
    reservation.total_ttc ??
    reservation.money_fareAccommodation ??
    0;
  const totalPaid = reservation.money_totalPaid ?? 0;
  const balanceDue = reservation.money_balanceDue ?? totalDue - totalPaid;
  const hostPayout = reservation.money_hostPayout ?? 0;
  const hostServiceFee = reservation.money_hostServiceFee ?? 0;
  const totalTaxes = reservation.money_totalTaxes ?? reservation.CITY_TAX ?? 0;

  // Calculate payment progress
  const paymentProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
  const isFullyPaid = balanceDue <= 0;

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    // Assurer que currency n'est jamais null
    const currencyCode = currency ?? 'EUR';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Payment Status Alert */}
      {balanceDue > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Solde impayé de {formatCurrency(balanceDue)}
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            État des paiements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression du paiement</span>
              <span className="font-medium">
                {Math.round(paymentProgress)}%
              </span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payé: {formatCurrency(totalPaid)}</span>
              <span>Total: {formatCurrency(totalDue)}</span>
            </div>
          </div>

          {/* Payment Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Détails client</h4>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total à payer
                </span>
                <span className="font-medium">{formatCurrency(totalDue)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Montant payé
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totalPaid)}
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Solde restant</span>
                <Badge variant={isFullyPaid ? 'secondary' : 'destructive'}>
                  {formatCurrency(balanceDue)}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Détails hôte</h4>

              {hostPayout > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Versement hôte
                  </span>
                  <span className="font-medium">
                    {formatCurrency(hostPayout)}
                  </span>
                </div>
              )}

              {hostServiceFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Frais de service
                  </span>
                  <span className="font-medium">
                    {formatCurrency(hostServiceFee)}
                  </span>
                </div>
              )}

              {totalTaxes > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total taxes
                  </span>
                  <span className="font-medium">
                    {formatCurrency(totalTaxes)}
                  </span>
                </div>
              )}

              {hostPayout > 0 && (
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm font-medium">Net hôte</span>
                  <span className="font-medium">
                    {formatCurrency(hostPayout - hostServiceFee)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Fare Details if Available */}
          {(reservation.money_fareAccommodation ??
            reservation.money_fareAccommodationAdjusted ??
            reservation.money_fareCleaning) && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Détail des tarifs</h4>
              <div className="space-y-2">
                {reservation.money_fareAccommodation && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Tarif hébergement initial
                    </span>
                    <span className="text-sm">
                      {formatCurrency(reservation.money_fareAccommodation)}
                    </span>
                  </div>
                )}

                {reservation.money_fareAccommodationAdjusted &&
                  reservation.money_fareAccommodationAdjusted !==
                    reservation.money_fareAccommodation && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Tarif hébergement ajusté
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(
                          reservation.money_fareAccommodationAdjusted
                        )}
                      </span>
                    </div>
                  )}

                {reservation.money_fareCleaning && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Tarif nettoyage
                    </span>
                    <span className="text-sm">
                      {formatCurrency(reservation.money_fareCleaning)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
