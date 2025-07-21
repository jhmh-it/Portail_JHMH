import type {
  ReservationDetails,
  FinancialBreakdown,
  FinancialItem,
  GuestBreakdown,
  DateInformation,
} from '@/types/reservation-details';

// Helper function to parse amounts that can be strings or numbers
function parseAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Extract and organize financial data from reservation details
 */
export function extractFinancialBreakdown(
  reservation: ReservationDetails
): FinancialBreakdown[] {
  const breakdowns: FinancialBreakdown[] = [];

  // Accommodation breakdown
  const accommodationItems: FinancialItem[] = [];

  const accommodationHT = parseAmount(reservation.ACCOMODATION_HT);
  if (accommodationHT !== 0) {
    accommodationItems.push({
      label: 'Hébergement de base',
      amountHT: accommodationHT,
      amountVAT: parseAmount(reservation.ACCOMODATION_VAT),
      amountTTC: parseAmount(reservation.ACCOMODATION_TTC),
    });
  }

  const growthAccommodationHT = parseAmount(reservation.GROWTH_ACCOMODATION_HT);
  if (growthAccommodationHT > 0) {
    accommodationItems.push({
      label: 'Majoration hébergement',
      amountHT: growthAccommodationHT,
      amountVAT: parseAmount(reservation.GROWTH_ACCOMODATION_VAT),
      amountTTC: parseAmount(reservation.GROWTH_ACCOMODATION_TTC),
    });
  }

  const discountHT = parseAmount(reservation.DISCOUNT_HT);
  if (discountHT > 0) {
    accommodationItems.push({
      label: 'Remise',
      amountHT: discountHT,
      amountVAT: parseAmount(reservation.DISCOUNT_VAT),
      amountTTC: parseAmount(reservation.DISCOUNT_TTC),
      isDiscount: true,
    });
  }

  if (accommodationItems.length > 0) {
    breakdowns.push({
      category: 'Hébergement',
      items: accommodationItems,
      totalHT: accommodationItems.reduce(
        (sum, item) => sum + (item.amountHT ?? 0) * (item.isDiscount ? -1 : 1),
        0
      ),
      totalVAT: accommodationItems.reduce(
        (sum, item) => sum + (item.amountVAT ?? 0) * (item.isDiscount ? -1 : 1),
        0
      ),
      totalTTC: accommodationItems.reduce(
        (sum, item) => sum + (item.amountTTC ?? 0) * (item.isDiscount ? -1 : 1),
        0
      ),
    });
  }

  // Cleaning breakdown
  const cleaningItems: FinancialItem[] = [];

  const mandatoryCleaningHT = parseAmount(reservation.MANDATORY_CLEANING_HT);
  if (mandatoryCleaningHT > 0) {
    cleaningItems.push({
      label: 'Nettoyage obligatoire',
      amountHT: mandatoryCleaningHT,
      amountVAT: parseAmount(reservation.MANDATORY_CLEANING_VAT),
      amountTTC: parseAmount(reservation.MANDATORY_CLEANING_TTC),
    });
  }

  const extraCleaningHT = parseAmount(reservation.EXTRA_CLEANING_HT);
  if (extraCleaningHT > 0) {
    cleaningItems.push({
      label: 'Nettoyage supplémentaire',
      amountHT: extraCleaningHT,
      amountVAT: parseAmount(reservation.EXTRA_CLEANING_VAT),
      amountTTC: parseAmount(reservation.EXTRA_CLEANING_TTC),
    });
  }

  if (cleaningItems.length > 0) {
    breakdowns.push({
      category: 'Nettoyage',
      items: cleaningItems,
      totalHT: cleaningItems.reduce(
        (sum, item) => sum + (item.amountHT ?? 0),
        0
      ),
      totalVAT: cleaningItems.reduce(
        (sum, item) => sum + (item.amountVAT ?? 0),
        0
      ),
      totalTTC: cleaningItems.reduce(
        (sum, item) => sum + (item.amountTTC ?? 0),
        0
      ),
    });
  }

  // Additional services breakdown
  const additionalItems: FinancialItem[] = [];

  const earlyCheckInHT = parseAmount(reservation.EARLY_CI_HT);
  if (earlyCheckInHT > 0) {
    additionalItems.push({
      label: 'Check-in anticipé',
      amountHT: earlyCheckInHT,
      amountVAT: parseAmount(reservation.EARLY_CI_VAT),
      amountTTC: parseAmount(reservation.EARLY_CI_TTC),
    });
  }

  const lateCheckOutHT = parseAmount(reservation.LATE_CO_HT);
  if (lateCheckOutHT > 0) {
    additionalItems.push({
      label: 'Check-out tardif',
      amountHT: lateCheckOutHT,
      amountVAT: parseAmount(reservation.LATE_CO_VAT),
      amountTTC: parseAmount(reservation.LATE_CO_TTC),
    });
  }

  const laundryHT = parseAmount(reservation.LAUNDRY_HT);
  if (laundryHT > 0) {
    additionalItems.push({
      label: 'Service de blanchisserie',
      amountHT: laundryHT,
      amountVAT: parseAmount(reservation.LAUNDRY_VAT),
      amountTTC: parseAmount(reservation.LAUNDRY_TTC),
    });
  }

  const foodHT = parseAmount(reservation.FOOD_HT);
  if (foodHT > 0) {
    additionalItems.push({
      label: 'Restauration',
      amountHT: foodHT,
      amountVAT: parseAmount(reservation.FOOD_VAT),
      amountTTC: parseAmount(reservation.FOOD_TTC),
    });
  }

  const roomUpdateHT = parseAmount(reservation.ADD_CHARGE_ROOM_UPDATE_HT);
  if (roomUpdateHT > 0) {
    additionalItems.push({
      label: 'Changement de chambre',
      amountHT: roomUpdateHT,
      amountVAT: parseAmount(reservation.ADD_CHARGE_ROOM_UPDATE_VAT),
      amountTTC: parseAmount(reservation.ADD_CHARGE_ROOM_UPDATE_TTC),
    });
  }

  if (additionalItems.length > 0) {
    breakdowns.push({
      category: 'Services additionnels',
      items: additionalItems,
      totalHT: additionalItems.reduce(
        (sum, item) => sum + (item.amountHT ?? 0),
        0
      ),
      totalVAT: additionalItems.reduce(
        (sum, item) => sum + (item.amountVAT ?? 0),
        0
      ),
      totalTTC: additionalItems.reduce(
        (sum, item) => sum + (item.amountTTC ?? 0),
        0
      ),
    });
  }

  // Taxes and fees
  const taxItems: FinancialItem[] = [];

  const cityTax = parseAmount(reservation.CITY_TAX);
  if (cityTax > 0) {
    taxItems.push({
      label: 'Taxe de séjour',
      amountTTC: cityTax,
    });
  }

  const otaFee = parseAmount(reservation.OTA_FEE);
  if (otaFee > 0) {
    taxItems.push({
      label: 'Frais de plateforme',
      amountTTC: otaFee,
    });
  }

  if (taxItems.length > 0) {
    breakdowns.push({
      category: 'Taxes et frais',
      items: taxItems,
      totalHT: 0,
      totalVAT: 0,
      totalTTC: taxItems.reduce((sum, item) => sum + (item.amountTTC ?? 0), 0),
    });
  }

  return breakdowns;
}

/**
 * Extract guest information
 */
export function extractGuestBreakdown(
  reservation: ReservationDetails
): GuestBreakdown {
  // Parse string values to numbers
  const parseGuests = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10) ?? 0;
    return 0;
  };

  const adults = parseGuests(
    reservation.NUMBER_GUEST_ADULT ?? reservation.reservation_numberOfAdults
  );
  const children = parseGuests(
    reservation.NUMBER_GUEST_CHILD ?? reservation.reservation_numberOfChildren
  );
  const infants = parseGuests(
    reservation.NUMBER_GUEST_INFANT ?? reservation.reservation_numberOfInfants
  );
  const total =
    parseGuests(
      reservation.NUMBER_OF_GUESTS ??
        reservation.number_of_guests ??
        reservation.reservation_guestsCount
    ) ??
    adults + children + infants ??
    0;

  return {
    adults,
    children,
    infants,
    total,
  };
}

/**
 * Extract and organize date information
 */
export function extractDateInformation(
  reservation: ReservationDetails
): DateInformation {
  return {
    booking: reservation.DTE_CREATE ?? null,
    confirmation: reservation.DTE_CONFIRM ?? null,
    checkin:
      reservation.DTE_CI ??
      reservation.checkin_date ??
      reservation.reservation_checkIn ??
      null,
    checkout:
      reservation.DTE_CO ??
      reservation.checkout_date ??
      reservation.reservation_checkOut ??
      null,
    cancellation:
      reservation.DTE_CANCELED ?? reservation.reservation_canceledAt ?? null,
    lastModified:
      reservation.DTE_MOD ?? reservation.reservation_lastUpdatedAt ?? null,
    nights:
      reservation.NUMBER_OF_NIGHTS ??
      reservation.nights ??
      reservation.nightsCount ??
      0,
  };
}

/**
 * Get the display status
 */
export function getDisplayStatus(reservation: ReservationDetails): {
  status: string;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const status = reservation.STATE ?? reservation.status ?? 'UNKNOWN';

  const statusMap: Record<
    string,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    CONFIRMED: { label: 'Confirmée', variant: 'default' },
    PENDING: { label: 'En attente', variant: 'secondary' },
    CANCELLED: { label: 'Annulée', variant: 'destructive' },
    'CHECKED-OUT': { label: 'Terminée', variant: 'outline' },
    'CHECKED-IN': { label: 'En cours', variant: 'default' },
    'NO-SHOW': { label: 'No show', variant: 'destructive' },
    FUTURE: { label: 'À venir', variant: 'secondary' },
    UNKNOWN: { label: 'Inconnu', variant: 'outline' },
  };

  return {
    status,
    ...(statusMap[status] || statusMap.UNKNOWN),
  };
}

/**
 * Get the display platform
 */
export function getDisplayPlatform(reservation: ReservationDetails): {
  platform: string;
  label: string;
  color: string;
} {
  const platform =
    reservation.PLATFORM ??
    reservation.ota ??
    reservation.reservation_source ??
    'UNKNOWN';

  const platformMap: Record<string, { label: string; color: string }> = {
    'Booking.com': { label: 'Booking.com', color: 'text-blue-600' },
    airbnb2: { label: 'Airbnb', color: 'text-red-600' },
    'Hotels.com': { label: 'Hotels.com', color: 'text-purple-600' },
    Expedia: { label: 'Expedia', color: 'text-yellow-600' },
    Travelocity: { label: 'Travelocity', color: 'text-green-600' },
    manual: { label: 'Directe', color: 'text-navy-600' },
    UNKNOWN: { label: 'Inconnue', color: 'text-gray-600' },
  };

  return {
    platform,
    ...(platformMap[platform] ?? platformMap.UNKNOWN),
  };
}

/**
 * Calculate the total amount
 */
export function calculateTotalAmount(reservation: ReservationDetails): {
  ht: number;
  vat: number;
  ttc: number;
  currency: string;
} {
  const ht = parseAmount(reservation.TOTAL_HT);
  const vat = parseAmount(reservation.TOTAL_VAT);
  const ttc = parseAmount(reservation.TOTAL_TTC ?? reservation.total_ttc);
  const currency = reservation.currency ?? reservation.money_currency ?? 'EUR';

  return { ht, vat, ttc, currency };
}

/**
 * Get deposit information
 */
export function getDepositInfo(reservation: ReservationDetails): {
  hasDeposit: boolean;
  amount: number;
} {
  const amount = parseAmount(reservation.DEPOSIT_WITHDRAW);
  return {
    hasDeposit: amount > 0,
    amount,
  };
}
