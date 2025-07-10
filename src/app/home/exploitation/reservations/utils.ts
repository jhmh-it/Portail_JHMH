import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { DATE_FORMAT, PAGINATION_CONFIG } from './constants';

/**
 * Formats a date string to a localized format
 * @param dateString - Date string to format
 * @returns Formatted date string or '-' if invalid
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  try {
    return format(new Date(dateString), DATE_FORMAT, { locale: fr });
  } catch {
    return dateString;
  }
}

/**
 * Formats a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: EUR)
 * @returns Formatted currency string or '-' if invalid
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'EUR'
): string {
  if (amount == null) return '-';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generates pagination items with ellipsis
 * @param currentPage - Current active page
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis markers
 */
export function generatePaginationItems(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const items: (number | string)[] = [];
  const { MAX_VISIBLE_PAGES } = PAGINATION_CONFIG;

  if (totalPages <= MAX_VISIBLE_PAGES) {
    // Show all pages if few enough
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Logic for showing pages with ellipsis
    items.push(1);

    if (currentPage > 3) {
      items.push('ellipsis-start');
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      items.push('ellipsis-end');
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }
  }

  return items;
}
