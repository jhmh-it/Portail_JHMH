/**
 * Export barrel pour les composants dashboard
 * Centralise l'accès aux composants partagés du dashboard
 */

// Layout components
export { DashboardLayout } from './dashboard-layout';
export { AppSidebar } from './app-sidebar';
export { Header } from './header';

// UI components
export { PageHeader } from './page-header';
export { StatCard } from './StatCard';
export { DataGrid } from './DataGrid';
export { MetricCard } from './MetricCard';
export { ResultsContainer } from './results-container';

// Presets and helpers
export { RESULTS_CONTAINER_PRESETS } from './results-container-presets';
export type {
  ResultsContainerPreset,
  ResultsContainerPresetKey,
} from './results-container-presets';
