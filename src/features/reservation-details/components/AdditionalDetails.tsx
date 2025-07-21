import {
  ChevronDown,
  FileText,
  Info,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReservationDetails } from '@/types/reservation-details';

interface AdditionalDetailsProps {
  reservation: ReservationDetails;
}

interface DetailSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  fields: Array<{
    label: string;
    value: string | number | Date | null | undefined;
    format?: 'currency' | 'date' | 'datetime' | 'number' | 'text';
  }>;
}

export function AdditionalDetails({ reservation }: AdditionalDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Informations de réservation',
  ]);

  // Organize additional fields into sections
  const sections: DetailSection[] = [];

  // Reservation information
  const reservationFields = [];

  if (reservation.reservation_id) {
    reservationFields.push({
      label: 'ID Réservation',
      value: reservation.reservation_id,
      format: 'text' as const,
    });
  }

  if (reservation.guest_id) {
    reservationFields.push({
      label: 'ID Client',
      value: reservation.guest_id,
      format: 'text' as const,
    });
  }

  if (reservation.listing_id) {
    reservationFields.push({
      label: 'ID Logement',
      value: reservation.listing_id,
      format: 'text' as const,
    });
  }

  if (reservation.reservation_status) {
    reservationFields.push({
      label: 'Statut interne',
      value: reservation.reservation_status,
      format: 'text' as const,
    });
  }

  if (reservation.statusReport) {
    reservationFields.push({
      label: 'Statut rapport',
      value: reservation.statusReport,
      format: 'text' as const,
    });
  }

  if (reservationFields.length > 0) {
    sections.push({
      title: 'Informations de réservation',
      icon: Calendar,
      fields: reservationFields,
    });
  }

  // Financial details
  const financialFields = [];

  if (reservation.money_balanceDue) {
    financialFields.push({
      label: 'Solde dû',
      value: reservation.money_balanceDue,
      format: 'currency' as const,
    });
  }

  if (reservation.money_fareAccommodation) {
    financialFields.push({
      label: 'Tarif hébergement',
      value: reservation.money_fareAccommodation,
      format: 'currency' as const,
    });
  }

  if (reservation.money_fareAccommodationAdjusted) {
    financialFields.push({
      label: 'Tarif hébergement ajusté',
      value: reservation.money_fareAccommodationAdjusted,
      format: 'currency' as const,
    });
  }

  if (reservation.money_fareCleaning) {
    financialFields.push({
      label: 'Tarif nettoyage',
      value: reservation.money_fareCleaning,
      format: 'currency' as const,
    });
  }

  if (reservation.money_hostPayout) {
    financialFields.push({
      label: 'Paiement hôte',
      value: reservation.money_hostPayout,
      format: 'currency' as const,
    });
  }

  if (reservation.money_hostServiceFee) {
    financialFields.push({
      label: 'Frais de service hôte',
      value: reservation.money_hostServiceFee,
      format: 'currency' as const,
    });
  }

  if (reservation.money_totalTaxes) {
    financialFields.push({
      label: 'Total taxes',
      value: reservation.money_totalTaxes,
      format: 'currency' as const,
    });
  }

  if (reservation.money_totalPaid) {
    financialFields.push({
      label: 'Total payé',
      value: reservation.money_totalPaid,
      format: 'currency' as const,
    });
  }

  if (financialFields.length > 0) {
    sections.push({
      title: 'Détails financiers complémentaires',
      icon: DollarSign,
      fields: financialFields,
    });
  }

  // Technical metadata
  const metadataFields = [];

  if (reservation.reportGenerationTimestamp) {
    metadataFields.push({
      label: 'Généré le',
      value: reservation.reportGenerationTimestamp,
      format: 'datetime' as const,
    });
  }

  if (reservation.reportId) {
    metadataFields.push({
      label: 'ID Rapport',
      value: reservation.reportId,
      format: 'text' as const,
    });
  }

  if (reservation.constantsProfileUsed) {
    metadataFields.push({
      label: 'Profil de constantes',
      value: reservation.constantsProfileUsed,
      format: 'text' as const,
    });
  }

  if (reservation.dataSourceOrigin) {
    metadataFields.push({
      label: 'Source des données',
      value: reservation.dataSourceOrigin,
      format: 'text' as const,
    });
  }

  if (reservation.generatingUser) {
    metadataFields.push({
      label: 'Utilisateur générateur',
      value: reservation.generatingUser,
      format: 'text' as const,
    });
  }

  if (reservation.auditNote) {
    metadataFields.push({
      label: "Note d'audit",
      value: reservation.auditNote,
      format: 'text' as const,
    });
  }

  if (metadataFields.length > 0) {
    sections.push({
      title: 'Métadonnées techniques',
      icon: Info,
      fields: metadataFields,
    });
  }

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedSections.includes(title);

  const formatValue = (
    value: string | number | Date | null | undefined,
    format?: string
  ): string => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        const numValue =
          typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numValue)) return String(value);
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: reservation.currency ?? reservation.money_currency ?? 'EUR',
        }).format(numValue);

      case 'date':
        try {
          const dateValue = value instanceof Date ? value : new Date(value);
          return dateValue.toLocaleDateString('fr-FR');
        } catch {
          return String(value);
        }

      case 'datetime':
        try {
          const dateValue = value instanceof Date ? value : new Date(value);
          return dateValue.toLocaleString('fr-FR');
        } catch {
          return String(value);
        }

      case 'number':
        const numberValue =
          typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numberValue)) return String(value);
        return new Intl.NumberFormat('fr-FR').format(numberValue);

      default:
        return String(value);
    }
  };

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune information complémentaire disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informations détaillées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sections.map(section => {
            const IconComponent = section.icon ?? FileText;
            return (
              <div key={section.title} className="border rounded-lg">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{section.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ({section.fields.length})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded(section.title) && 'transform rotate-180'
                    )}
                  />
                </button>

                {isExpanded(section.title) && (
                  <div className="px-4 pb-4 space-y-3">
                    {section.fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start gap-4"
                      >
                        <span className="text-sm text-muted-foreground font-medium">
                          {field.label}
                        </span>
                        <span className="text-sm font-medium text-right max-w-[60%] break-words">
                          {formatValue(field.value, field.format)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
