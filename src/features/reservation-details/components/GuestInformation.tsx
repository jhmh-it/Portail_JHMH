import { Baby, Mail, Phone, User, UserCheck, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractGuestBreakdown } from '@/features/reservation-details/utils/data-processors';
import type { ReservationDetails } from '@/types/reservation-details';

interface GuestInformationProps {
  reservation: ReservationDetails;
}

export function GuestInformation({ reservation }: GuestInformationProps) {
  const guests = extractGuestBreakdown(reservation);

  // Extract guest details from multiple possible fields
  const guestName =
    reservation.GUEST_NAME ??
    reservation.guest_fullName ??
    reservation.guest_name ??
    null;
  const guestEmail = reservation.GUEST_EMAIL ?? reservation.guest_email ?? null;
  const guestPhone = reservation.guest_phone ?? null;
  const guestNotes =
    reservation.guest_notes ?? reservation.reservation_notes ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Informations des invités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guest identity */}
        <div className="space-y-4">
          {guestName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nom du client</p>
                <p className="font-medium text-lg">{guestName}</p>
              </div>
            </div>
          )}

          {guestEmail && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{guestEmail}</p>
              </div>
            </div>
          )}

          {guestPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{guestPhone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Guest breakdown */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-4">Composition du groupe</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {guests.adults > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{guests.adults}</p>
                  <p className="text-sm text-muted-foreground">
                    {guests.adults > 1 ? 'Adultes' : 'Adulte'}
                  </p>
                </div>
              </div>
            )}

            {guests.children > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{guests.children}</p>
                  <p className="text-sm text-muted-foreground">
                    {guests.children > 1 ? 'Enfants' : 'Enfant'}
                  </p>
                </div>
              </div>
            )}

            {guests.infants > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Baby className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold">{guests.infants}</p>
                  <p className="text-sm text-muted-foreground">
                    {guests.infants > 1 ? 'Bébés' : 'Bébé'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Total guests summary */}
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total des invités</span>
              <span className="text-2xl font-bold text-primary">
                {guests.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {guests.total > 1 ? 'personnes' : 'personne'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Special requests or notes if available */}
        {(reservation.special_requests ?? guestNotes) && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-2">
              {reservation.special_requests ? 'Demandes spéciales' : 'Notes'}
            </h4>
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              {reservation.special_requests ?? guestNotes}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
