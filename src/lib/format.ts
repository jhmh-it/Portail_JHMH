/**
 * Centralized formatting utilities for date and currency
 * French locale defaults
 */

import { format as dateFnsFormat } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date string into a human-readable form.
 * Returns '-' on invalid input.
 */
export function formatDate(
  dateString: string | null | undefined,
  pattern = 'dd MMMM yyyy'
): string {
  if (!dateString) return '-';
  try {
    return dateFnsFormat(new Date(dateString), pattern, { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format a date string including time.
 * Returns '-' on invalid input.
 */
export function formatDateTime(
  dateString: string | null | undefined,
  pattern = 'dd MMM yyyy à HH:mm'
): string {
  return formatDate(dateString, pattern);
}

/**
 * Format a number as currency in fr-FR.
 * Defaults to EUR when currency is not provided.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'EUR'
): string {
  const safe = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(safe);
  } catch {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(safe);
  }
}
