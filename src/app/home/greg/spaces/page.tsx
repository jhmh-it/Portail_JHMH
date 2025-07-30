'use client';

import { Search, Filter, RefreshCw, MapPin, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGregSpaces } from '@/hooks/useGregApi';
import { useLoadingStore } from '@/stores/loading-store';
import type { GregSpacesFilters } from '@/types/greg';

import { SpacesTable, CreateSpaceModal, DeleteSpaceModal } from './components';

const PAGE_SIZES = [
  { value: '10', label: '10 résultats' },
  { value: '20', label: '20 résultats' },
  { value: '50', label: '50 résultats' },
  { value: '100', label: '100 résultats' },
];

export default function GregSpacesPage() {
  const [filters, setFilters] = useState<GregSpacesFilters>({
    page: 1,
    page_size: 20,
    space_type: 'ROOM', // Fixé à ROOM
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<{
    space_id: string;
    space_name: string;
    type: string;
    notes?: string;
  } | null>(null);
  const [deletingSpace, setDeletingSpace] = useState<{
    space_id: string;
    space_name: string;
  } | null>(null);
  const { hideLoading } = useLoadingStore();

  const { data, isLoading, isFetching, error, refetch, isSuccess } =
    useGregSpaces({
      ...filters,
    });

  // Fermer la modale de loading quand les données sont chargées
  useEffect(() => {
    if (!isLoading) {
      hideLoading();
    }
  }, [isLoading, hideLoading]);

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Espaces' },
  ];

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      q: searchQuery || undefined,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (page_size: string) => {
    setFilters(prev => ({
      ...prev,
      page_size: parseInt(page_size),
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      space_type: 'ROOM', // Toujours ROOM
    });
    setSearchQuery('');
  };

  const handleCreateSuccess = () => {
    // Rafraîchir les données après création
    refetch();
  };

  const handleEdit = (space: {
    space_id: string;
    space_name: string;
    type: string;
    notes?: string;
  }) => {
    setEditingSpace(space);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir les données après modification
    refetch();
    setEditingSpace(null);
  };

  const handleDelete = (space: { space_id: string; space_name: string }) => {
    setDeletingSpace(space);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    // Rafraîchir les données après suppression
    refetch();
    setDeletingSpace(null);
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(searchQuery);

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                Espaces
              </h1>
              <p className="text-muted-foreground">
                Gérez et consultez tous les espaces en temps réel
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres de recherche
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-muted-foreground"
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="pt-0">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom d'espace, ID ou notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-28 h-11 bg-muted/50 border-muted-foreground/20 focus:bg-background"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
                  >
                    Rechercher
                  </Button>
                </div>
              </div>

              {/* Controls row */}
              <div className="flex items-end justify-between gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Résultats par page
                  </Label>
                  <Select
                    value={filters.page_size?.toString() ?? '20'}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="h-10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Réinitialiser
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="h-10"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                    />
                    {isFetching ? 'Actualisation...' : 'Actualiser'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results */}
        <Card className="shadow-sm overflow-visible">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              Résultats
              {isSuccess && data && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({data.total} espace{data.total > 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Espace
            </Button>
          </CardHeader>
          <CardContent className="pt-0 px-6 pb-8 overflow-visible">
            <SpacesTable
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error}
              _filters={filters}
              onPageChange={handlePageChange}
              _onPageSizeChange={handlePageSizeChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Modale de création d'espace */}
        <CreateSpaceModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleCreateSuccess}
        />

        {/* Modale d'édition d'espace */}
        {editingSpace && (
          <CreateSpaceModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onSuccess={handleEditSuccess}
            editData={editingSpace}
            mode="edit"
          />
        )}

        {/* Modale de suppression d'espace */}
        {deletingSpace && (
          <DeleteSpaceModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            spaceData={deletingSpace}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
