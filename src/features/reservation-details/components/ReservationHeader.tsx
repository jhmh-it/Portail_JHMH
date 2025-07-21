import { ArrowLeft, Calendar, Hash, MapPin, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  getDisplayPlatform,
  getDisplayStatus,
  extractGuestBreakdown,
} from '@/features/reservation-details/utils/data-processors';
import type { ReservationDetails } from '@/types/reservation-details';

interface ReservationHeaderProps {
  reservation: ReservationDetails;
}

export function ReservationHeader({ reservation }: ReservationHeaderProps) {
  const router = useRouter();
  const status = getDisplayStatus(reservation);
  const platform = getDisplayPlatform(reservation);
  const guests = extractGuestBreakdown(reservation);

  // Extract guest name from multiple possible fields
  const guestName =
    reservation.GUEST_NAME ??
    reservation.guest_fullName ??
    reservation.guest_name ??
    null;

  // Extract listing name and address from multiple possible fields
  const listingName =
    reservation.LISTING_NAME ??
    reservation.reservation_listing_nickname ??
    reservation.listing_name ??
    null;
  const fullAddress = reservation.reservation_listing_full_address ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/home/exploitation/reservations')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux réservations
        </Button>
      </div>

      {/* Main header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex flex-col gap-4">
          {/* Confirmation code with status */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Hash className="h-8 w-8 text-primary" />
              {reservation.confirmationCode ?? reservation.REF ?? 'N/A'}
            </h1>
            <Badge variant={status.variant} className="text-sm">
              {status.label}
            </Badge>
          </div>

          {/* Key information */}
          <div className="flex flex-col gap-2">
            {/* Guest name */}
            {guestName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium text-foreground">{guestName}</span>
                {guests.total > 0 && (
                  <span className="text-sm">
                    ({guests.total}{' '}
                    {guests.total > 1 ? 'personnes' : 'personne'})
                  </span>
                )}
              </div>
            )}

            {/* Property */}
            {(listingName ?? fullAddress) && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  {listingName && (
                    <span className="font-medium text-foreground">
                      {listingName}
                    </span>
                  )}
                  {fullAddress && (
                    <span className="text-sm">{fullAddress}</span>
                  )}
                </div>
              </div>
            )}

            {/* Platform */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Réservé via</span>
              <span className={`font-medium ${platform.color}`}>
                {platform.label}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            Exporter PDF
          </Button>
          <Button variant="outline" size="sm">
            Envoyer par email
          </Button>
        </div>
      </div>

      <Separator />
    </div>
  );
}
