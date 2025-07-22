import { Receipt, AlertTriangle } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  const renderTableSection = (lines: FinancialLine[], showHeaders = true) => {
    if (lines.length === 0) return null;

    return (
      <>
        {showHeaders && (
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="text-right">HT</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">TTC</TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {lines.map((line, index) => (
            <TableRow
              key={index}
              className={`
                ${line.isTotal ? 'font-bold text-lg' : ''}
                ${line.isSubtotal ? 'font-medium bg-muted/50' : ''}
                ${line.isDiscount ? 'text-green-600 dark:text-green-400' : ''}
              `}
            >
              <TableCell>{line.label}</TableCell>
              <TableCell className="text-right">
                {line.isDiscount && line.ht ? '-' : ''}
                {formatCurrency(line.ht)}
              </TableCell>
              <TableCell className="text-right">
                {line.isDiscount && line.vat ? '-' : ''}
                {formatCurrency(line.vat)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {line.isDiscount && line.ttc ? '-' : ''}
                {formatCurrency(line.ttc)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    );
  };

  // Price per night calculation
  const nights = reservation.NUMBER_OF_NIGHTS ?? reservation.nights ?? 0;
  const totalTTC = reservation.TOTAL_TTC ?? reservation.total_ttc ?? 0;
  const pricePerNight = nights > 0 ? totalTTC / nights : 0;

  return (
    <div className="space-y-6">
      {/* Audit note alert */}
      {reservation.auditNote && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Note d&apos;audit:</span>{' '}
            {reservation.auditNote}
          </AlertDescription>
        </Alert>
      )}

      {/* Main financial breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Décomposition tarifaire complète
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            collapsible
            defaultValue="main"
            className="w-full"
          >
            <AccordionItem value="main">
              <AccordionTrigger>Détail des prestations</AccordionTrigger>
              <AccordionContent>
                <Table>
                  {/* Accommodation */}
                  {financialLines.accommodation.length > 0 && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead colSpan={4} className="font-semibold">
                            Hébergement
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      {renderTableSection(financialLines.accommodation, false)}
                    </>
                  )}

                  {/* Cleaning */}
                  {financialLines.cleaning.length > 0 && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead colSpan={4} className="font-semibold">
                            Nettoyage
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      {renderTableSection(financialLines.cleaning, false)}
                    </>
                  )}

                  {/* Services */}
                  {financialLines.services.length > 0 && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead colSpan={4} className="font-semibold">
                            Services additionnels
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      {renderTableSection(financialLines.services, false)}
                    </>
                  )}

                  {/* Other charges */}
                  {financialLines.otherCharges.length > 0 && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead colSpan={4} className="font-semibold">
                            Autres frais
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      {renderTableSection(financialLines.otherCharges, false)}
                    </>
                  )}
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Totals table */}
          <div className="mt-6">
            <Table>{renderTableSection(financialLines.totals, true)}</Table>
          </div>

          {/* Price per night */}
          {nights > 0 && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="text-sm">
                {formatCurrency(pricePerNight)} / nuit ({nights} nuit
                {nights > 1 ? 's' : ''})
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
