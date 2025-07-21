// Types for the complete reservation details from the API
export interface ReservationDetails {
  // Basic information
  REF?: string;
  confirmationCode: string;
  guest_name?: string;
  guest_email?: string;
  listing_name?: string;

  // Dates
  DTE_CREATE?: string;
  DTE_MOD?: string;
  DTE_CONFIRM?: string;
  DTE_CANCELED?: string;
  DTE_CI?: string; // Check-in date
  DTE_CO?: string; // Check-out date
  checkin_date?: string;
  checkout_date?: string;

  // Status and platform
  STATE?: string;
  status?: string;
  PLATFORM?: string;
  ota?: string;

  // Guest information
  NUMBER_OF_GUESTS?: number;
  NUMBER_GUEST_ADULT?: number;
  NUMBER_GUEST_CHILD?: number;
  NUMBER_GUEST_INFANT?: number;
  number_of_guests?: number;

  // Stay details
  NUMBER_OF_NIGHTS?: number;
  nights?: number;

  // Financial information - Accommodation
  ACCOMODATION_HT?: number;
  ACCOMODATION_VAT?: number;
  ACCOMODATION_TTC?: number;
  GROWTH_ACCOMODATION_HT?: number;
  GROWTH_ACCOMODATION_VAT?: number;
  GROWTH_ACCOMODATION_TTC?: number;

  // Financial information - Cleaning
  MANDATORY_CLEANING_HT?: number;
  MANDATORY_CLEANING_VAT?: number;
  MANDATORY_CLEANING_TTC?: number;
  EXTRA_CLEANING_HT?: number;
  EXTRA_CLEANING_VAT?: number;
  EXTRA_CLEANING_TTC?: number;

  // Financial information - Other charges
  DISCOUNT_HT?: number;
  DISCOUNT_VAT?: number;
  DISCOUNT_TTC?: number;
  OTA_FEE?: number;
  CITY_TAX?: number;
  ADD_CHARGE_ROOM_UPDATE_HT?: number;
  ADD_CHARGE_ROOM_UPDATE_VAT?: number;
  ADD_CHARGE_ROOM_UPDATE_TTC?: number;
  EARLY_CI_HT?: number;
  EARLY_CI_VAT?: number;
  EARLY_CI_TTC?: number;
  LATE_CO_HT?: number;
  LATE_CO_VAT?: number;
  LATE_CO_TTC?: number;
  LAUNDRY_HT?: number;
  LAUNDRY_VAT?: number;
  LAUNDRY_TTC?: number;
  FOOD_HT?: number;
  FOOD_VAT?: number;
  FOOD_TTC?: number;
  DEPOSIT_WITHDRAW?: number;

  // Financial totals
  ACCOMODATION_AND_CLEANING_HT?: number;
  ACCOMODATION_AND_CLEANING_VAT?: number;
  ACCOMODATION_AND_CLEANING_TTC?: number;
  GROWTH_ACCOMODATION_AND_CLEANING_HT?: number;
  GROWTH_ACCOMODATION_AND_CLEANING_VAT?: number;
  GROWTH_ACCOMODATION_AND_CLEANING_TTC?: number;
  TOTAL_HT?: number;
  TOTAL_VAT?: number;
  TOTAL_TTC?: number;
  total_ttc?: number;

  // Currency
  currency?: string;

  // Metadata
  reportGenerationTimestamp?: string;
  auditNote?: string;

  // Dynamic fields (can contain any additional fields from external API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// API Query parameters for reservation details
export interface ReservationDetailsQueryParams {
  include_logs?: boolean;
  include_audit_note?: boolean;
  force_trace?: boolean;
  force_value?: boolean;
}

// API Response
export interface ReservationDetailsResponse {
  success: boolean;
  data: ReservationDetails | null;
  error?: string;
}

// Financial breakdown types
export interface FinancialBreakdown {
  category: string;
  items: FinancialItem[];
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}

export interface FinancialItem {
  label: string;
  amountHT?: number;
  amountVAT?: number;
  amountTTC?: number;
  isDiscount?: boolean;
}

// Guest breakdown
export interface GuestBreakdown {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

// Date information
export interface DateInformation {
  booking: string | null;
  confirmation: string | null;
  checkin: string | null;
  checkout: string | null;
  cancellation: string | null;
  lastModified: string | null;
  nights: number;
}
