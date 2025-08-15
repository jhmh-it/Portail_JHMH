/**
 * Validation pour les requêtes du dashboard accounting
 */

/**
 * Extrait les paramètres de recherche d'une requête
 */
export function extractSearchParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

/**
 * Valide les paramètres de requête pour les métriques du dashboard
 */
export function validateDashboardMetricsQuery(params: URLSearchParams): {
  valid: boolean;
  error?: string;
  data?: {
    date: string;
    actif: string;
  };
} {
  const date = params.get('date');
  const actif = params.get('actif');

  if (!date || !actif) {
    return {
      valid: false,
      error: 'Les paramètres date et actif sont requis',
    };
  }

  // Validation du format de date (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      error: 'Le format de date doit être YYYY-MM-DD',
    };
  }

  return {
    valid: true,
    data: {
      date,
      actif,
    },
  };
}
