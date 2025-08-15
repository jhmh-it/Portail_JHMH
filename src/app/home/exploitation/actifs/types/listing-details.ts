/**
 * Types pour la gestion des listings détaillés
 */

export interface CheckInInstructions {
  default_check_in_time: string;
  default_check_out_time: string;
  notes: string;
  primary_method: string;
}

export interface CleaningStatus {
  updated_at: string;
  value: string;
}

export interface Prices {
  base_price: number;
  cleaning_fee: number;
  currency: string;
  extra_person_fee: number;
  guests_included: number;
  security_deposit_fee: number;
  weekend_base_price: number | null;
}

export interface PublicDescription {
  access: string;
  neighborhood: string;
  notes: string;
  space: string;
  summary: string;
  transit: string;
}

export interface ListingDetails {
  accommodates: number;
  active: boolean;
  address: string;
  bathrooms: number;
  bedrooms: number;
  beds: number;
  check_in_instructions: CheckInInstructions;
  cleaning_status: CleaningStatus;
  created_at: string;
  id: string;
  is_listed: boolean;
  last_updated_at: string | null;
  last_updated_timestamp: string;
  lat: number | null;
  lng: number | null;
  nickname: string;
  picture_url: string | null;
  prices: Prices;
  property_type: string;
  public_description: PublicDescription;
  timezone: string;
  title: string;
}

export interface ListingDetailsResponse {
  data: ListingDetails[];
  error: boolean;
  message: string;
  meta: {
    filters_applied: {
      listing_id: string;
    };
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}
