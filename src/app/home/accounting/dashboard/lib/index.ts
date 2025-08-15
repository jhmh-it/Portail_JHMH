/**
 * Export barrel pour les utilitaires dashboard accounting
 */

// Export sélectif pour éviter les conflits
export {
  createDashboardErrorResponse,
  createDashboardSuccessResponse,
  DEFAULT_DASHBOARD_CACHE_HEADERS,
  formatNumber,
  formatPercentageNumber,
  formatCurrencyNumber,
  formatInteger,
  formatCurrency,
  formatPercentage,
  formatNumberWithSeparators,
  getSafeValue,
  calculateChangePercentage,
  calculateAchievementRate,
  getPerformanceColorClass,
  getComparisonColorClass,
  getTrendIcon,
  formatValue,
} from './dashboard-utils';

export * from './date-utils';
export * from './actifs-utils';
