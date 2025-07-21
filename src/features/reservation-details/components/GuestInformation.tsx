import { Users, Mail, Phone, FileText, UserCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { extractGuestBreakdown } from '@/features/reservation-details/utils/data-processors';
import type { ReservationDetails } from '@/types/reservation-details';

interface GuestInformationProps {
  reservation: ReservationDetails;
}

export function GuestInformation({ reservation }: GuestInformationProps) {
  const guests = extractGuestBreakdown(reservation);

  // Extract all possible guest details
  const guestName =
    reservation.GUEST_NAME ??
    reservation.guest_fullName ??
    reservation.guest_name ??
    null;
  const guestEmail = reservation.GUEST_EMAIL ?? reservation.guest_email ?? null;
  const guestPhone = reservation.guest_phone ?? null;
  const guestNotes =
    reservation.guest_notes ?? reservation.reservation_notes ?? null;
  const guestId = reservation.guest_id ?? null;

  const hasContactInfo = guestEmail ?? guestPhone;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Informations client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guest identity */}
        <div className="space-y-3">
          {guestName && (
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{guestName}</h3>
                {guestId && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ID Client: {guestId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {hasContactInfo && (
            <div className="space-y-2 pl-8">
              {guestEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${guestEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {guestEmail}
                  </a>
                </div>
              )}

              {guestPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${guestPhone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {guestPhone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Guest breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3">Composition des invités</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{guests.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{guests.adults}</div>
              <div className="text-xs text-muted-foreground">
                Adulte{guests.adults > 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{guests.children}</div>
              <div className="text-xs text-muted-foreground">
                Enfant{guests.children > 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{guests.infants}</div>
              <div className="text-xs text-muted-foreground">
                Bébé{guests.infants > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {guestNotes && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Notes et commentaires</h4>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{guestNotes}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
