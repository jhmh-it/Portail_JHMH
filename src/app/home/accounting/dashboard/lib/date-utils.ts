/**
 * Utilitaires pour les dates dans le dashboard accounting
 */

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 * @param date - Date à formater
 * @returns Date formatée au format ISO (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse une date depuis le format API
 * @param dateString - Date au format YYYY-MM-DD
 * @returns Objet Date
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Vérifie si une date est valide
 * @param date - Date à vérifier
 * @returns true si la date est valide
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Obtient la date d'aujourd'hui formatée pour l'API
 * @returns Date d'aujourd'hui au format YYYY-MM-DD
 */
export function getTodayForAPI(): string {
  return formatDateForAPI(new Date());
}

/**
 * Obtient le premier jour du mois actuel
 * @returns Premier jour du mois au format YYYY-MM-DD
 */
export function getFirstDayOfMonthForAPI(): string {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDateForAPI(firstDay);
}

/**
 * Formate une date pour l'affichage utilisateur
 * @param date - Date à formater
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns Date formatée pour l'affichage
 */
export function formatDateForDisplay(
  date: Date,
  locale: string = 'fr-FR'
): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
