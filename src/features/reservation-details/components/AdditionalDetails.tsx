import React from 'react';

import type { ReservationDetails } from '@/types/reservation-details';

interface AdditionalDetailsProps {
  reservation: ReservationDetails;
}

export function AdditionalDetails({ reservation }: AdditionalDetailsProps) {
  return (
    <div className="space-y-6">
      {/* System identifiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Identifiants système</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 text-sm">
            {reservation.confirmationCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code confirmation</span>
                <span className="font-mono">
                  {reservation.confirmationCode}
                </span>
              </div>
            )}

            {reservation.reservation_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Réservation</span>
                <span className="font-mono text-xs">
                  {reservation.reservation_id}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            {reservation.guest_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Client</span>
                <span className="font-mono text-xs">
                  {reservation.guest_id}
                </span>
              </div>
            )}

            {reservation.listing_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Logement</span>
                <span className="font-mono text-xs">
                  {reservation.listing_id}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw data section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Données brutes</h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <details className="space-y-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Voir toutes les données JSON
            </summary>
            <div className="mt-4 max-h-96 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                {JSON.stringify(reservation, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
