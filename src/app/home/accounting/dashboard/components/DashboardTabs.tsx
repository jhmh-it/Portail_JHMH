/**
 * Composant pour les onglets du dashboard
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { DashboardMetrics } from '../types';

import { AnalysisTab } from './tabs/AnalysisTab';
import { ForecastsTab } from './tabs/ForecastsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { OverviewTab } from './tabs/OverviewTab';

interface DashboardTabsProps {
  /** Données des métriques à afficher */
  metrics: DashboardMetrics;
}

/**
 * Styles pour les onglets (réutilisables)
 */
const TAB_TRIGGER_STYLES = {
  cursor: 'pointer',
  border: '1px solid #d1d5db',
  backgroundColor: 'white',
  color: '#374151',
  fontWeight: '500',
  transition: 'all 0.2s',
} as const;

const TAB_TRIGGER_CLASSES =
  'hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]';

/**
 * Configuration des onglets
 */
const TABS_CONFIG = [
  {
    value: 'overview',
    label: "Vue d'ensemble",
    component: OverviewTab,
  },
  {
    value: 'analysis',
    label: 'Analyse',
    component: AnalysisTab,
  },
  {
    value: 'forecasts',
    label: 'Prévisions',
    component: ForecastsTab,
  },
  {
    value: 'history',
    label: 'Historique',
    component: HistoryTab,
  },
] as const;

/**
 * Composant des onglets du dashboard avec tous les composants
 */
export function DashboardTabs({ metrics }: DashboardTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4 gap-3 bg-gray-100 p-1">
          {TABS_CONFIG.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              style={TAB_TRIGGER_STYLES}
              className={TAB_TRIGGER_CLASSES}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS_CONFIG.map(({ value, component: Component }) => (
          <TabsContent key={value} value={value} className="space-y-6">
            <Component metrics={metrics} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
