import { Receipt, Home, Brush, Settings, CreditCard } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ReservationDetails } from '@/types/reservation-details';

interface FinancialDetailsViewProps {
  reservation: ReservationDetails;
}

interface FinancialLine {
  label: string;
  ht?: number;
  vat?: number;
  ttc?: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isDiscount?: boolean;
}

export function FinancialDetailsView({
  reservation,
}: FinancialDetailsViewProps) {
  const currency = reservation.currency ?? reservation.money_currency ?? 'EUR';

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '-';
    // Assurer que currency n'est jamais null
    const currencyCode = currency ?? 'EUR';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  // Build complete financial breakdown
  const buildFinancialLines = (): {
    accommodation: FinancialLine[];
    cleaning: FinancialLine[];
    services: FinancialLine[];
    otherCharges: FinancialLine[];
    totals: FinancialLine[];
  } => {
    const lines = {
      accommodation: [] as FinancialLine[],
      cleaning: [] as FinancialLine[],
      services: [] as FinancialLine[],
      otherCharges: [] as FinancialLine[],
      totals: [] as FinancialLine[],
    };

    // Accommodation
    if (reservation.ACCOMODATION_HT || reservation.ACCOMODATION_TTC) {
      lines.accommodation.push({
        label: 'Hébergement de base',
        ht: reservation.ACCOMODATION_HT,
        vat: reservation.ACCOMODATION_VAT,
        ttc: reservation.ACCOMODATION_TTC,
      });
    }

    if (
      reservation.GROWTH_ACCOMODATION_HT ||
      reservation.GROWTH_ACCOMODATION_TTC
    ) {
      lines.accommodation.push({
        label: 'Majoration hébergement',
        ht: reservation.GROWTH_ACCOMODATION_HT,
        vat: reservation.GROWTH_ACCOMODATION_VAT,
        ttc: reservation.GROWTH_ACCOMODATION_TTC,
      });
    }

    // Cleaning
    if (
      reservation.MANDATORY_CLEANING_HT ||
      reservation.MANDATORY_CLEANING_TTC
    ) {
      lines.cleaning.push({
        label: 'Nettoyage obligatoire',
        ht: reservation.MANDATORY_CLEANING_HT,
        vat: reservation.MANDATORY_CLEANING_VAT,
        ttc: reservation.MANDATORY_CLEANING_TTC,
      });
    }

    if (reservation.EXTRA_CLEANING_HT || reservation.EXTRA_CLEANING_TTC) {
      lines.cleaning.push({
        label: 'Nettoyage supplémentaire',
        ht: reservation.EXTRA_CLEANING_HT,
        vat: reservation.EXTRA_CLEANING_VAT,
        ttc: reservation.EXTRA_CLEANING_TTC,
      });
    }

    // Services
    if (reservation.EARLY_CI_HT || reservation.EARLY_CI_TTC) {
      lines.services.push({
        label: 'Check-in anticipé',
        ht: reservation.EARLY_CI_HT,
        vat: reservation.EARLY_CI_VAT,
        ttc: reservation.EARLY_CI_TTC,
      });
    }

    if (reservation.LATE_CO_HT || reservation.LATE_CO_TTC) {
      lines.services.push({
        label: 'Check-out tardif',
        ht: reservation.LATE_CO_HT,
        vat: reservation.LATE_CO_VAT,
        ttc: reservation.LATE_CO_TTC,
      });
    }

    if (
      reservation.ADD_CHARGE_ROOM_UPDATE_HT ||
      reservation.ADD_CHARGE_ROOM_UPDATE_TTC
    ) {
      lines.services.push({
        label: 'Changement de chambre',
        ht: reservation.ADD_CHARGE_ROOM_UPDATE_HT,
        vat: reservation.ADD_CHARGE_ROOM_UPDATE_VAT,
        ttc: reservation.ADD_CHARGE_ROOM_UPDATE_TTC,
      });
    }

    if (reservation.LAUNDRY_HT || reservation.LAUNDRY_TTC) {
      lines.services.push({
        label: 'Blanchisserie',
        ht: reservation.LAUNDRY_HT,
        vat: reservation.LAUNDRY_VAT,
        ttc: reservation.LAUNDRY_TTC,
      });
    }

    if (reservation.FOOD_HT || reservation.FOOD_TTC) {
      lines.services.push({
        label: 'Services alimentaires',
        ht: reservation.FOOD_HT,
        vat: reservation.FOOD_VAT,
        ttc: reservation.FOOD_TTC,
      });
    }

    if (reservation.DISCOUNT_HT || reservation.DISCOUNT_TTC) {
      lines.services.push({
        label: 'Remise accordée',
        ht: reservation.DISCOUNT_HT,
        vat: reservation.DISCOUNT_VAT,
        ttc: reservation.DISCOUNT_TTC,
        isDiscount: true,
      });
    }

    // Other charges
    if (reservation.OTA_FEE) {
      lines.otherCharges.push({
        label: 'Frais de plateforme (OTA)',
        ttc: reservation.OTA_FEE,
      });
    }

    if (reservation.CITY_TAX) {
      lines.otherCharges.push({
        label: 'Taxe de séjour',
        ttc: reservation.CITY_TAX,
      });
    }

    if (reservation.DEPOSIT_WITHDRAW) {
      lines.otherCharges.push({
        label:
          reservation.DEPOSIT_WITHDRAW > 0
            ? 'Dépôt de garantie prélevé'
            : 'Dépôt de garantie remboursé',
        ttc: Math.abs(reservation.DEPOSIT_WITHDRAW),
        isDiscount: reservation.DEPOSIT_WITHDRAW < 0,
      });
    }

    // Totals
    if (
      reservation.ACCOMODATION_AND_CLEANING_HT ||
      reservation.ACCOMODATION_AND_CLEANING_TTC
    ) {
      lines.totals.push({
        label: 'Sous-total hébergement + nettoyage',
        ht: reservation.ACCOMODATION_AND_CLEANING_HT,
        vat: reservation.ACCOMODATION_AND_CLEANING_VAT,
        ttc: reservation.ACCOMODATION_AND_CLEANING_TTC,
        isSubtotal: true,
      });
    }

    if (
      reservation.GROWTH_ACCOMODATION_AND_CLEANING_HT ||
      reservation.GROWTH_ACCOMODATION_AND_CLEANING_TTC
    ) {
      lines.totals.push({
        label: 'Sous-total avec majorations',
        ht: reservation.GROWTH_ACCOMODATION_AND_CLEANING_HT,
        vat: reservation.GROWTH_ACCOMODATION_AND_CLEANING_VAT,
        ttc: reservation.GROWTH_ACCOMODATION_AND_CLEANING_TTC,
        isSubtotal: true,
      });
    }

    lines.totals.push({
      label: 'TOTAL GÉNÉRAL',
      ht: reservation.TOTAL_HT,
      vat: reservation.TOTAL_VAT,
      ttc: reservation.TOTAL_TTC ?? reservation.total_ttc,
      isTotal: true,
    });

    return lines;
  };

  const financialLines = buildFinancialLines();

  // Price per night calculation
  const nights = reservation.NUMBER_OF_NIGHTS ?? reservation.nights ?? 0;
  const totalTTC = reservation.TOTAL_TTC ?? reservation.total_ttc ?? 0;
  const pricePerNight = nights > 0 ? totalTTC / nights : 0;

  return (
    <div className="space-y-6">
      {/* Main financial breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Décomposition tarifaire complète
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main pricing table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="w-[40%] font-semibold">
                      Prestation
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Prix HT
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      TVA
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Prix TTC
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Accommodation section */}
                  {financialLines.accommodation.length > 0 && (
                    <>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} className="font-bold py-3">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            HÉBERGEMENT
                          </div>
                        </TableCell>
                      </TableRow>
                      {financialLines.accommodation.map((line, index) => (
                        <TableRow
                          key={index}
                          className={
                            line.isDiscount
                              ? 'text-green-600 dark:text-green-400'
                              : ''
                          }
                        >
                          <TableCell className="pl-6">{line.label}</TableCell>
                          <TableCell className="text-center">
                            {line.ht ? formatCurrency(line.ht) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {line.vat ? formatCurrency(line.vat) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(line.ttc)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Cleaning section */}
                  {financialLines.cleaning.length > 0 && (
                    <>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} className="font-bold py-3">
                          <div className="flex items-center gap-2">
                            <Brush className="h-4 w-4" />
                            NETTOYAGE
                          </div>
                        </TableCell>
                      </TableRow>
                      {financialLines.cleaning.map((line, index) => (
                        <TableRow
                          key={index}
                          className={
                            line.isDiscount
                              ? 'text-green-600 dark:text-green-400'
                              : ''
                          }
                        >
                          <TableCell className="pl-6">{line.label}</TableCell>
                          <TableCell className="text-center">
                            {line.ht ? formatCurrency(line.ht) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {line.vat ? formatCurrency(line.vat) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(line.ttc)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Services section */}
                  {financialLines.services.length > 0 && (
                    <>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} className="font-bold py-3">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            SERVICES ADDITIONNELS
                          </div>
                        </TableCell>
                      </TableRow>
                      {financialLines.services.map((line, index) => (
                        <TableRow
                          key={index}
                          className={
                            line.isDiscount
                              ? 'text-green-600 dark:text-green-400'
                              : ''
                          }
                        >
                          <TableCell className="pl-6">{line.label}</TableCell>
                          <TableCell className="text-center">
                            {line.ht ? formatCurrency(line.ht) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {line.vat ? formatCurrency(line.vat) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(line.ttc)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Other charges section */}
                  {financialLines.otherCharges.length > 0 && (
                    <>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} className="font-bold py-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            AUTRES FRAIS
                          </div>
                        </TableCell>
                      </TableRow>
                      {financialLines.otherCharges.map((line, index) => (
                        <TableRow
                          key={index}
                          className={
                            line.isDiscount
                              ? 'text-green-600 dark:text-green-400'
                              : ''
                          }
                        >
                          <TableCell className="pl-6">{line.label}</TableCell>
                          <TableCell className="text-center">-</TableCell>
                          <TableCell className="text-center">-</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(line.ttc)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Totals section */}
                  <TableRow className="border-t-2 border-muted">
                    <TableCell colSpan={4} className="py-2" />
                  </TableRow>
                  {financialLines.totals.map((line, index) => (
                    <TableRow
                      key={index}
                      className={`
                        ${line.isTotal ? 'bg-muted/50 border-t border-b' : 'bg-muted/20'}
                        ${line.isTotal ? 'font-bold' : 'font-semibold'}
                      `}
                    >
                      <TableCell
                        className={line.isTotal ? 'font-bold' : 'font-semibold'}
                      >
                        {line.label}
                      </TableCell>
                      <TableCell className="text-center">
                        {line.ht ? formatCurrency(line.ht) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {line.vat ? formatCurrency(line.vat) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(line.ttc)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Price per night information */}
            {nights > 0 && (
              <div className="flex justify-center pt-4 border-t">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg px-4 py-2">
                  <div className="text-center">
                    <span className="text-lg font-semibold">
                      {formatCurrency(pricePerNight)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      par nuit ({nights} nuit{nights > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
