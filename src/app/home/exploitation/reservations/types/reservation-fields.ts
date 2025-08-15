export interface ReservationField {
  displayName: string;
  fieldName: string;
  type: 'string' | 'integer' | 'number';
}

export interface ReservationFieldsResponse {
  data: ReservationField[];
  error: boolean;
  message: string;
  timestamp?: string;
}

export interface ReservationOverrideFormData {
  [key: string]: string | number | undefined;
}
