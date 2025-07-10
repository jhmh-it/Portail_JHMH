// Status configurations with their display properties
export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  CONFIRMED: {
    label: 'Confirmée',
    variant: 'default',
  },
  PENDING: {
    label: 'En attente',
    variant: 'secondary',
  },
  CANCELLED: {
    label: 'Annulée',
    variant: 'destructive',
  },
  'CHECKED-OUT': {
    label: 'Terminée',
    variant: 'outline',
  },
  'CHECKED-IN': {
    label: 'En cours',
    variant: 'default',
  },
  'NO-SHOW': {
    label: 'No show',
    variant: 'destructive',
  },
} as const;

// OTA (Online Travel Agency) configurations
export const OTA_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  'Booking.com': {
    label: 'Booking.com',
    color: 'text-blue-600',
  },
  airbnb2: {
    label: 'Airbnb',
    color: 'text-red-600',
  },
  'Hotels.com': {
    label: 'Hotels.com',
    color: 'text-purple-600',
  },
  Expedia: {
    label: 'Expedia',
    color: 'text-yellow-600',
  },
  manual: {
    label: 'Direct',
    color: 'text-gray-600',
  },
} as const;

// Pagination constants
export const PAGINATION_CONFIG = {
  MAX_VISIBLE_PAGES: 5,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// Date format options
export const DATE_FORMAT = 'dd MMM yyyy';
