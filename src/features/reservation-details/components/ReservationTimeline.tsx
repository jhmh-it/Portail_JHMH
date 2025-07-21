import {
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  XCircle,
  Edit,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ReservationDetails } from '@/types/reservation-details';

interface ReservationTimelineProps {
  reservation: ReservationDetails;
}

interface TimelineEvent {
  date: string | null;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'destructive';
  isPast: boolean;
  isFuture: boolean;
}

export function ReservationTimeline({ reservation }: ReservationTimelineProps) {
  const buildTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // Helper to determine if date is past/future
    const getTimeStatus = (dateStr: string | null) => {
      if (!dateStr) return { isPast: false, isFuture: false };
      const date = new Date(dateStr);
      return {
        isPast: date < now,
        isFuture: date > now,
      };
    };

    // Booking creation
    if (reservation.DTE_CREATE) {
      const status = getTimeStatus(reservation.DTE_CREATE);
      events.push({
        date: reservation.DTE_CREATE,
        label: 'Réservation créée',
        description: 'Création initiale de la réservation dans le système',
        icon: <User className="h-4 w-4" />,
        variant: 'default',
        ...status,
      });
    }

    // Booking confirmation
    if (reservation.DTE_CONFIRM) {
      const status = getTimeStatus(reservation.DTE_CONFIRM);
      events.push({
        date: reservation.DTE_CONFIRM,
        label: 'Réservation confirmée',
        description: 'Confirmation officielle de la réservation',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'success',
        ...status,
      });
    }

    // Check-in
    const checkinDate =
      reservation.DTE_CI ??
      reservation.checkin_date ??
      reservation.reservation_checkIn;
    if (checkinDate) {
      const status = getTimeStatus(checkinDate);
      events.push({
        date: checkinDate,
        label: 'Arrivée (Check-in)',
        description: 'Début du séjour au logement',
        icon: <MapPin className="h-4 w-4" />,
        variant: status.isPast ? 'success' : 'default',
        ...status,
      });
    }

    // Check-out
    const checkoutDate =
      reservation.DTE_CO ??
      reservation.checkout_date ??
      reservation.reservation_checkOut;
    if (checkoutDate) {
      const status = getTimeStatus(checkoutDate);
      events.push({
        date: checkoutDate,
        label: 'Départ (Check-out)',
        description: 'Fin du séjour et libération du logement',
        icon: <MapPin className="h-4 w-4" />,
        variant: status.isPast ? 'success' : 'default',
        ...status,
      });
    }

    // Last modification
    if (reservation.DTE_MOD && reservation.DTE_MOD !== reservation.DTE_CREATE) {
      const status = getTimeStatus(reservation.DTE_MOD);
      events.push({
        date: reservation.DTE_MOD,
        label: 'Dernière modification',
        description: 'Dernière mise à jour des informations de réservation',
        icon: <Edit className="h-4 w-4" />,
        variant: 'default',
        ...status,
      });
    }

    // Cancellation (if applicable)
    if (reservation.DTE_CANCELED) {
      const status = getTimeStatus(reservation.DTE_CANCELED);
      events.push({
        date: reservation.DTE_CANCELED,
        label: 'Réservation annulée',
        description: 'Annulation de la réservation',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive',
        ...status,
      });
    }

    // Sort events by date
    return events
      .filter(event => event.date)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { date: dateStr, time: null };
    }
  };

  const timeline = buildTimeline();

  // Calculate stay duration
  const checkinDate = reservation.DTE_CI ?? reservation.checkin_date;
  const checkoutDate = reservation.DTE_CO ?? reservation.checkout_date;
  const nights = reservation.NUMBER_OF_NIGHTS ?? reservation.nights ?? 0;

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'destructive':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getBadgeVariant = (event: TimelineEvent) => {
    if (event.isPast) return 'secondary';
    if (event.isFuture) return 'outline';
    return 'default';
  };

  const getBadgeText = (event: TimelineEvent) => {
    if (event.isPast) return 'Passé';
    if (event.isFuture) return 'À venir';
    return 'En cours';
  };

  return (
    <div className="space-y-6">
      {/* Stay overview */}
      {checkinDate && checkoutDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période de séjour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Arrivée</span>
                <span className="font-medium">
                  {formatDateTime(checkinDate).date}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(checkinDate).time}
                </span>
              </div>

              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm text-muted-foreground">Durée</span>
                <Badge variant="outline" className="text-sm">
                  {nights} nuit{nights > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="flex flex-col gap-1 md:items-end">
                <span className="text-sm text-muted-foreground">Départ</span>
                <span className="font-medium">
                  {formatDateTime(checkoutDate).date}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(checkoutDate).time}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun événement d&apos;historique disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.map((event, index) => {
                if (!event.date) return null;
                const { date, time } = formatDateTime(event.date);

                return (
                  <div key={index} className="relative">
                    {/* Timeline connector */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-border" />
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getVariantClasses(event.variant)} bg-background`}
                      >
                        {event.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{event.label}</h4>
                          <Badge
                            variant={getBadgeVariant(event)}
                            className="text-xs"
                          >
                            {getBadgeText(event)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{date}</span>
                          {time && (
                            <>
                              <Separator
                                orientation="vertical"
                                className="h-4"
                              />
                              <span className="text-muted-foreground">
                                {time}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      {reservation.reportGenerationTimestamp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Métadonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Rapport généré le
              </span>
              <span className="text-sm font-medium">
                {formatDateTime(reservation.reportGenerationTimestamp).date}
              </span>
            </div>

            {reservation.reportGenerationTimestamp && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Heure de génération
                </span>
                <span className="text-sm font-medium">
                  {formatDateTime(reservation.reportGenerationTimestamp).time}
                </span>
              </div>
            )}

            {reservation.generatingUser && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Généré par
                </span>
                <span className="text-sm font-medium">
                  {reservation.generatingUser}
                </span>
              </div>
            )}

            {reservation.dataSourceOrigin && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Source des données
                </span>
                <span className="text-sm font-medium">
                  {reservation.dataSourceOrigin}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
