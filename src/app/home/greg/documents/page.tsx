'use client';

import { Search, Filter, RefreshCw, FileText, X, Plus } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { useGregDocuments } from '@/hooks/useGregApi';
import { useLoadingStore } from '@/stores/loading-store';
import type { GregDocumentsFilters } from '@/types/greg';

import {
  DocumentsTable,
  CreateDocumentModal,
  DeleteDocumentModal,
  CategoryFilter,
} from './components';

const PAGE_SIZES = [
  { value: '10', label: '10 résultats' },
  { value: '20', label: '20 résultats' },
  { value: '50', label: '50 résultats' },
  { value: '100', label: '100 résultats' },
];

export default function GregDocumentsPage() {
  const [filters, setFilters] = useState<GregDocumentsFilters>({
    page: 1,
    page_size: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<{
    id: string;
    spreadsheet_name: string;
    sheet_name: string;
    summary?: string;
    categories?: string;
  } | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<{
    id: string;
    spreadsheet_name: string;
  } | null>(null);
  const { hideLoading } = useLoadingStore();

  const { data, isLoading, isFetching, error, refetch, isSuccess } =
    useGregDocuments({
      ...filters,
      pending_only: pendingOnly,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
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
    { label: 'Documents' },
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
    });
    setSearchQuery('');
    setPendingOnly(false);
    setSelectedCategories([]);
  };

  const handleCreateSuccess = () => {
    // Rafraîchir les données après création
    refetch();
  };

  const handleEdit = (document: {
    id: string;
    spreadsheet_name: string;
    sheet_name: string;
    summary?: string;
    categories?: string;
    pending_for_review?: boolean;
  }) => {
    // On ne passe pas pending_for_review à la modale d'édition
    const { pending_for_review: _pending_for_review, ...editData } = document;
    setEditingDocument(editData);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir les données après modification
    refetch();
    setEditingDocument(null);
  };

  const handleDelete = (document: { id: string; spreadsheet_name: string }) => {
    setDeletingDocument(document);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    // Rafraîchir les données après suppression
    refetch();
    setDeletingDocument(null);
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchQuery || pendingOnly || selectedCategories.length > 0
  );

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                Documents
              </h1>
              <p className="text-muted-foreground">
                Organisez vos documents et feuilles de calcul par catégories
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
                    placeholder="Rechercher par nom, feuille, catégories..."
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

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                {/* Category Filter */}
                <div className="flex flex-col gap-2 col-span-1">
                  <Label>Catégories</Label>
                  <CategoryFilter
                    value={selectedCategories}
                    onChange={categories => {
                      setSelectedCategories(categories);
                      setFilters(prev => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                {/* Pending Only Filter */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pending-only"
                    checked={pendingOnly}
                    onCheckedChange={checked => {
                      setPendingOnly(checked);
                      setFilters(prev => ({ ...prev, page: 1 }));
                    }}
                  />
                  <Label htmlFor="pending-only">
                    Afficher uniquement les documents en attente de révision
                  </Label>
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
                  ({data.total} document{data.total > 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Document
            </Button>
          </CardHeader>
          <CardContent className="pt-0 px-6 pb-8 overflow-visible">
            <DocumentsTable
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error?.message ?? null}
              filters={{
                q: filters.q ?? '',
                page: filters.page ?? 1,
                page_size: filters.page_size ?? 20,
              }}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Modale de création de document */}
        <CreateDocumentModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleCreateSuccess}
        />

        {/* Modale d'édition de document */}
        {editingDocument && (
          <CreateDocumentModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Modale de suppression de document */}
        {deletingDocument && (
          <DeleteDocumentModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            documentData={deletingDocument}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
