export interface GregHealthResponse {
  service: string;
  status: string;
  timestamp: string;
  version: string;
}

export interface GregStatsResponse {
  timestamp: string;
  total_accesses: number;
  total_categories: number;
  total_documents: number;
  total_reminders: number;
  total_shifts: number;
  total_spaces: number;
  total_users: number;
}

export interface GregSpace {
  space_id: string;
  space_name: string;
  type: string;
  notes?: string;
}

export interface GregSpacesFilters {
  q?: string; // Search query
  page?: number;
  page_size?: number;
  space_type?: string; // Fixé à "ROOM" pour cette page
}

export interface GregSpacesResponse {
  data: GregSpace[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Documents interfaces
export interface GregDocument {
  id: string;
  spreadsheet_name: string;
  sheet_name: string;
  summary?: string;
  categories?: string;
  pending_for_review?: boolean;
}

export interface GregDocumentsFilters {
  q?: string; // Search query
  page?: number;
  page_size?: number;
  pending_only?: boolean; // Filtrer seulement les documents en attente
}

export interface GregDocumentsResponse {
  data: GregDocument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GregStatsResponse {
  timestamp: string;
  total_accesses: number;
  total_categories: number;
  total_documents: number;
  total_reminders: number;
  total_shifts: number;
  total_spaces: number;
  total_users: number;
}

export interface GregSpace {
  space_id: string;
  space_name: string;
  type: string;
  notes?: string;
}

export interface GregSpacesFilters {
  q?: string; // Search query
  page?: number;
  page_size?: number;
  space_type?: string; // Fixé à "ROOM" pour cette page
}

export interface GregSpacesResponse {
  data: GregSpace[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Documents interfaces
export interface GregDocument {
  id: string;
  spreadsheet_name: string;
  sheet_name: string;
  summary?: string;
  categories?: string;
  pending_for_review?: boolean;
}

export interface GregDocumentsFilters {
  q?: string; // Search query
  page?: number;
  page_size?: number;
  pending_only?: boolean; // Filtrer seulement les documents en attente
}

export interface GregDocumentsResponse {
  data: GregDocument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
