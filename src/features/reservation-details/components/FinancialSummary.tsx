import { Banknote, TrendingUp, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ReservationDetails } from '@/types/reservation-details';

interface FinancialSummaryProps {
  reservation: ReservationDetails;
}

export function FinancialSummary({ reservation }: FinancialSummaryProps) {
  const currency = reservation.currency ?? 'EUR';

  // Extract key financial data
  const totalTTC = reservation.TOTAL_TTC ?? reservation.total_ttc ?? 0;
  const accommodationTTC = reservation.ACCOMODATION_TTC ?? 0;
  const cleaningTTC =
    (reservation.MANDATORY_CLEANING_TTC ?? 0) +
    (reservation.EXTRA_CLEANING_TTC ?? 0);
  const discountTTC = reservation.DISCOUNT_TTC ?? 0;
  const otaFee = reservation.OTA_FEE ?? 0;
  const cityTax = reservation.CITY_TAX ?? 0;

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    // Assurer que currency n'est jamais null
    const currencyCode = currency || 'EUR';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const nights = reservation.NUMBER_OF_NIGHTS ?? reservation.nights ?? 0;
  const avgPerNight = nights > 0 ? totalTTC / nights : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Résumé financier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total with average per night */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(totalTTC)}
            </span>
            <Badge variant="secondary">
              {formatCurrency(avgPerNight)}/nuit
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Total TTC • {nights} nuit{nights > 1 ? 's' : ''}
          </div>
        </div>

        <Separator />

        {/* Key components */}
        <div className="space-y-3">
          {accommodationTTC > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Hébergement</span>
              <span className="font-medium">
                {formatCurrency(accommodationTTC)}
              </span>
            </div>
          )}

          {cleaningTTC > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Nettoyage</span>
              <span className="font-medium">{formatCurrency(cleaningTTC)}</span>
            </div>
          )}

          {discountTTC > 0 && (
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span className="text-sm flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Remise
              </span>
              <span className="font-medium">
                -{formatCurrency(discountTTC)}
              </span>
            </div>
          )}

          {otaFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Frais OTA</span>
              <span className="font-medium">{formatCurrency(otaFee)}</span>
            </div>
          )}

          {cityTax > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxe de séjour</span>
              <span className="font-medium">{formatCurrency(cityTax)}</span>
            </div>
          )}
        </div>

        {/* Additional charges indicator */}
        {(reservation.EARLY_CI_TTC ?? 0) > 0 ||
        (reservation.LATE_CO_TTC ?? 0) > 0 ||
        (reservation.LAUNDRY_TTC ?? 0) > 0 ||
        (reservation.FOOD_TTC ?? 0) > 0 ? (
          <div className="pt-2 border-t border-dashed">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Charges additionnelles incluses
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
