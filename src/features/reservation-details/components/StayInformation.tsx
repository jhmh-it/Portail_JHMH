import { Calendar, Home, MapPin, Hash, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Property information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Logement
            </CardTitle>
            <Badge variant={status.variant} className="text-sm">
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property name and main info */}
          <div className="space-y-3">
            {/* Name with OTA badge */}
            {listingName && (
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg leading-tight">
                  {listingName}
                </h3>
                <Badge variant="outline" className="font-normal">
                  {platform.label}
                </Badge>
              </div>
            )}

            {/* Address with enhanced styling */}
            {listingAddress && (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-foreground">
                      {listingAddress}
                    </p>
                  </div>
                </div>
                <div className="ml-7">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(listingAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Voir sur Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Metadata at bottom */}
          {(listingId ?? internalRef) && (
            <div className="mt-auto pt-4 border-t border-muted/50">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {listingId && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>ID: {listingId}</span>
                  </div>
                )}
                {internalRef && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>REF: {internalRef}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stay dates */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates du séjour ({dates.nights} nuit{dates.nights > 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Check-in/out dates with improved layout */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Arrivée
              </p>
              {dates.checkin ? (
                (() => {
                  const formatted = formatDateTime(dates.checkin);
                  return formatted === '-' ? (
                    <p className="text-muted-foreground">-</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold">{formatted.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatted.time}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Départ
              </p>
              {dates.checkout ? (
                (() => {
                  const formatted = formatDateTime(dates.checkout);
                  return formatted === '-' ? (
                    <p className="text-muted-foreground">-</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold">{formatted.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatted.time}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
            </div>
          </div>

          {/* Other important dates */}
          <div className="space-y-3">
            {dates.booking && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Réservé le
                </span>
                <span className="text-sm font-medium">
                  {formatDate(dates.booking)}
                </span>
              </div>
            )}

            {dates.confirmation && dates.confirmation !== dates.booking && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Confirmé le
                </span>
                <span className="text-sm font-medium">
                  {formatDate(dates.confirmation)}
                </span>
              </div>
            )}

            {dates.cancellation && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-sm">Annulé le</span>
                <span className="text-sm font-medium">
                  {formatDate(dates.cancellation)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
