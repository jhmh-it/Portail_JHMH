'use client';

import {
  Shield,
  FileText,
  History,
  Search,
  Filter,
  X,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoadingStore } from '@/stores/loading-store';

import {
  SpaceDocumentAccessList,
  SpaceHistoryAccessList,
  CreateAccessModal,
  AccessFilters,
} from './components';

export default function GregAccessPage() {
  const [activeTab, setActiveTab] = useState('document-access');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    spaceType: 'all',
    documentType: 'all',
    dateRange: 'all',
  });

  // Suivi du chargement des accès
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { hideLoading } = useLoadingStore();

  // Fermer le loader global dès que le chargement des accès est terminé
  useEffect(() => {
    if (!isAccessLoading) {
      hideLoading();
    }
  }, [isAccessLoading, hideLoading]);

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Gestion des accès' },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.spaceType !== 'all' ||
    filters.documentType !== 'all' ||
    filters.dateRange !== 'all';

  const handleClearFilters = () => {
    setFilters({
      spaceType: 'all',
      documentType: 'all',
      dateRange: 'all',
    });
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a page refresh to reload all data
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-navy">
                  Gestion des accès
                </h1>
                <p className="text-muted-foreground">
                  Gérez les permissions entre documents, espaces et historiques
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par espace, document ou utilisateur..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 cursor-pointer"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-xs"
                  >
                    {Object.values(filters).filter(v => v !== 'all').length +
                      (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="cursor-pointer"
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-2">
              <AccessFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 gap-3 mb-6 bg-gray-100 p-1 max-w-[600px]">
            <TabsTrigger
              value="document-access"
              className="gap-2 hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Accès aux</span> Documents
            </TabsTrigger>
            <TabsTrigger
              value="history-access"
              className="gap-2 hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Accès aux</span> Historiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document-access" className="space-y-4">
            <SpaceDocumentAccessList
              searchQuery={searchQuery}
              filters={filters}
              onCreateNew={() => setShowCreateModal(true)}
              onLoadingChange={setIsAccessLoading}
            />
          </TabsContent>

          <TabsContent value="history-access" className="space-y-4">
            <SpaceHistoryAccessList
              searchQuery={searchQuery}
              filters={filters}
              onCreateNew={() => setShowCreateModal(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Create Access Modal */}
        <CreateAccessModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          accessType={activeTab}
        />
      </div>
    </DashboardLayout>
  );
}
