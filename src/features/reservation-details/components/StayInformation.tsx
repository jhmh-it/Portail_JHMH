import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Clock,
  Moon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractDateInformation } from '@/features/reservation-details/utils/data-processors';
import type { ReservationDetails } from '@/types/reservation-details';

interface StayInformationProps {
  reservation: ReservationDetails;
}

export function StayInformation({ reservation }: StayInformationProps) {
  const dates = extractDateInformation(reservation);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const calculateStayDuration = () => {
    if (!dates.checkin || !dates.checkout) return null;
    try {
      const checkin = new Date(dates.checkin);
      const checkout = new Date(dates.checkout);
      const nights = differenceInDays(checkout, checkin);
      return nights;
    } catch {
      return dates.nights;
    }
  };

  const nightsCount = calculateStayDuration() ?? dates.nights;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Dates du séjour */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates du séjour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                <span>Arrivée</span>
              </div>
              <p className="font-medium">{formatDate(dates.checkin)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Départ</span>
              </div>
              <p className="font-medium">{formatDate(dates.checkout)}</p>
            </div>
          </div>

          {nightsCount > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Moon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{nightsCount}</p>
                <p className="text-sm text-muted-foreground">
                  {nightsCount > 1 ? 'nuits' : 'nuit'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dates.booking && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Réservation créée</p>
              <p className="text-sm font-medium">
                {formatDateTime(dates.booking)}
              </p>
            </div>
          )}

          {dates.confirmation && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Confirmée le</p>
              <p className="text-sm font-medium">
                {formatDateTime(dates.confirmation)}
              </p>
            </div>
          )}

          {dates.cancellation && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <CalendarX className="h-4 w-4" />
                <span>Annulée le</span>
              </div>
              <p className="text-sm font-medium text-destructive">
                {formatDateTime(dates.cancellation)}
              </p>
            </div>
          )}

          {dates.lastModified && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                Dernière modification
              </p>
              <p className="text-sm font-medium">
                {formatDateTime(dates.lastModified)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
