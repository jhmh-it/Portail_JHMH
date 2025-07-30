/**
 * Types pour la gestion des guests
 */

export interface Guest {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  birthday?: string;
  place_of_birth?: string;
  nationality?: string;
  gender?: string;
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  hometown?: string;
  notes?: string;
  vip_status?: boolean;
  blacklisted?: boolean;
  is_returning?: boolean;
  created_at?: string;
  updated_at?: string;
  last_updated_timestamp?: string;
  guest_type?: 'individual' | 'business';
  company_name?: string;
  company_registration?: string;
  contact_person?: string;
  preferred_language?: string;
  marketing_consent?: boolean;
  last_stay_date?: string;
  total_stays?: number;
  total_nights?: number;
  last_updated_by?: string;
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface GuestListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  guest_type?: string;
  vip_status?: boolean;
  blacklisted?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface GuestFilters {
  q: string;
  page: number;
  page_size: number;
  guest_type?: string;
  is_returning?: boolean;
  guest_id?: string;
  confirmation_code?: string;
}

export interface GuestListResponse {
  data: Guest[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CreateGuestRequest {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  hometown?: string;
  notes?: string;
  guest_type?: 'individual' | 'business';
  company_name?: string;
  company_registration?: string;
  contact_person?: string;
  preferred_language?: string;
  marketing_consent?: boolean;
  source?: string;
  tags?: string[];
}

export type UpdateGuestRequest = Partial<CreateGuestRequest>;

export interface ExternalGuestsResponse {
  data: Guest[];
  error: boolean;
  message: string;
  meta: {
    filters_applied: Record<string, unknown>;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}
