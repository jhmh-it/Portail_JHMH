'use client';

import { ArrowRight, Calculator, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountingTools } from '@/hooks/useAccountingTools';

// Icônes pour chaque outil
const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: Calculator,
  analytics: BarChart3,
  booking: Calendar,
};

export default function AccountingPage() {
  const { accountingTools, isLoading, error } = useAccountingTools();

  const breadcrumbs = [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Accounting Tool' },
  ];

  if (error) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              Accounting Tool
            </h1>
            <p className="text-muted-foreground">
              Outils de gestion comptable et financière.
            </p>
          </div>

          <Card className="border-red-200">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-red-600">
                Erreur lors du chargement des outils : {error}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Accounting Tool
          </h1>
          <p className="text-muted-foreground">
            Outils de gestion comptable et financière pour optimiser vos
            processus.
          </p>
        </div>

        {/* Grille des outils */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? // Skeleton loading
              Array.from(
                { length: 3 },
                (_, index) => `tool-skeleton-${index}`
              ).map(skeletonId => (
                <Card
                  key={skeletonId}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : // Outils réels
              accountingTools.map(tool => {
                const IconComponent = toolIcons[tool.id] || Calculator;

                return (
                  <Card
                    key={tool.id}
                    className="group hover:shadow-lg transition-all duration-200 hover:border-navy/20"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy/10 rounded-lg group-hover:bg-navy/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-navy" />
                        </div>
                        <CardTitle className="text-navy group-hover:text-navy/80 transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        asChild
                        className="w-full bg-navy text-white hover:bg-navy/90 group-hover:bg-navy/80 transition-colors"
                      >
                        <Link
                          href={tool.url}
                          className="flex items-center justify-center gap-2"
                        >
                          Accéder
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Section informative */}
        {!isLoading && accountingTools.length > 0 && (
          <Card className="bg-navy/5 border-navy/20">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <Calculator className="h-5 w-5" />À propos de l&apos;Accounting
                Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                L&apos;Accounting Tool regroupe tous les outils nécessaires pour
                la gestion comptable et financière de votre entreprise. Chaque
                module est conçu pour simplifier vos processus et améliorer
                votre efficacité.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
