import { Calendar, Clock, Home, MapPin, Hash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  extractDateInformation,
  getDisplayPlatform,
  getDisplayStatus,
} from '@/features/reservation-details/utils/data-processors';
import type { ReservationDetails } from '@/types/reservation-details';

interface StayInformationProps {
  reservation: ReservationDetails;
}

export function StayInformation({ reservation }: StayInformationProps) {
  const dates = extractDateInformation(reservation);
  const platform = getDisplayPlatform(reservation);
  const status = getDisplayStatus(reservation);

  // Extract listing information
  const listingName =
    reservation.LISTING_NAME ??
    reservation.reservation_listing_nickname ??
    reservation.listing_name ??
    null;

  const listingAddress = reservation.reservation_listing_full_address ?? null;
  const listingId = reservation.listing_id ?? null;
  const internalRef = reservation.REF ?? null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString('fr-FR', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Property information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Logement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property name and ID */}
          <div className="space-y-2">
            {listingName && (
              <h3 className="font-semibold text-lg">{listingName}</h3>
            )}

            {/* IDs */}
            <div className="flex flex-wrap gap-3 text-xs">
              {listingId && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>ID: {listingId}</span>
                </div>
              )}
              {internalRef && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>REF: {internalRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {listingAddress && (
            <div className="pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{listingAddress}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(listingAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    Voir sur Google Maps
                    <MapPin className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Platform and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {platform.label}
              </Badge>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stay dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates du séjour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Check-in/out dates grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Arrivée</p>
              {dates.checkin ? (
                (() => {
                  const formatted = formatDateTime(dates.checkin);
                  return formatted === '-' ? (
                    <p className="text-muted-foreground">-</p>
                  ) : (
                    <>
                      <p className="font-medium">{formatted.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatted.time}
                      </p>
                    </>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Départ</p>
              {dates.checkout ? (
                (() => {
                  const formatted = formatDateTime(dates.checkout);
                  return formatted === '-' ? (
                    <p className="text-muted-foreground">-</p>
                  ) : (
                    <>
                      <p className="font-medium">{formatted.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatted.time}
                      </p>
                    </>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-bold">{dates.nights}</span>
              <span className="text-lg font-medium">
                nuit{dates.nights > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <Separator />

          {/* Other important dates */}
          <div className="space-y-2 text-sm">
            {dates.booking && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Date de réservation
                </span>
                <span>{formatDate(dates.booking)}</span>
              </div>
            )}

            {dates.confirmation && dates.confirmation !== dates.booking && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Date de confirmation
                </span>
                <span>{formatDate(dates.confirmation)}</span>
              </div>
            )}

            {dates.cancellation && (
              <div className="flex justify-between text-destructive">
                <span>Date d&apos;annulation</span>
                <span>{formatDate(dates.cancellation)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
