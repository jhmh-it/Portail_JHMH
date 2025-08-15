/**
 * Accounting Page - Using unified tool system
 * Professional dashboard with consistent components
 */

'use client';

// External imports
import { DashboardLayout, PageHeader } from '@/components/dashboard';
import { ErrorVariants } from '@/components/states';
import { ToolGrid, useToolNavigation } from '@/components/tools';

// Internal imports - configuration only
import { PAGE_CONFIGS, BREADCRUMBS } from './config';
import { useAccountingTools } from './hooks';

/**
 * Page principale des outils accounting
 * Affiche la liste des outils disponibles avec gestion des états
 */
export default function AccountingPage() {
  const { accountingTools, isLoading, error, refetch } = useAccountingTools();
  const { handleToolClick, isAnyToolLoading } = useToolNavigation();

  return (
    <DashboardLayout breadcrumbs={[...BREADCRUMBS.ACCOUNTING]}>
      <div className="flex flex-col gap-6 py-6">
        {/* En-tête */}
        <PageHeader
          title={PAGE_CONFIGS.ACCOUNTING.title}
          description={
            error
              ? PAGE_CONFIGS.ACCOUNTING.errorDescription
              : PAGE_CONFIGS.ACCOUNTING.description
          }
        />

        {/* Contenu principal - Using unified ToolGrid */}
        <main>
          {error ? (
            <ErrorVariants.Card
              error={error}
              onRetry={refetch}
              title="Erreur de chargement des outils"
            />
          ) : (
            <ToolGrid
              tools={accountingTools}
              onToolClick={handleToolClick}
              isLoading={isLoading || isAnyToolLoading()}
            />
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
