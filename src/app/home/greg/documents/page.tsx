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
import { useLoadingStore } from '@/stores/loading-store';

import { useGregDocuments } from '../hooks';
import type { GregDocument } from '../types';
import type { GregDocumentsFilters } from '../types/greg';

import {
  DocumentsTable,
  CreateDocumentModal,
  EditDocumentModal,
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
  const [editingDocument, setEditingDocument] = useState<GregDocument | null>(
    null
  );
  const [deletingDocument, setDeletingDocument] = useState<{
    id: string;
    spreadsheet_name?: string;
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
    setFilters((prev: GregDocumentsFilters) => ({
      ...prev,
      q: searchQuery || undefined,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: GregDocumentsFilters) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (page_size: string) => {
    setFilters((prev: GregDocumentsFilters) => ({
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

  const handleEdit = (document: GregDocument) => {
    setEditingDocument(document);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir les données après modification
    refetch();
    setEditingDocument(null);
  };

  const handleDelete = (document: GregDocument) => {
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
            <FileText className="text-primary h-8 w-8" />
            <div>
              <h1 className="text-navy text-3xl font-bold tracking-tight">
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
              <CardTitle className="flex items-center gap-2 text-base font-medium">
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
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Rechercher par nom, feuille, catégories..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="bg-muted/50 border-muted-foreground/20 focus:bg-background h-11 pr-28 pl-10"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="absolute top-1/2 right-2 h-8 -translate-y-1/2 transform"
                  >
                    Rechercher
                  </Button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-1">
                {/* Category Filter */}
                <div className="col-span-1 flex flex-col gap-2">
                  <Label>Catégories</Label>
                  <CategoryFilter
                    value={selectedCategories}
                    onChange={(categories: string[]) => {
                      setSelectedCategories(categories);
                      setFilters((prev: GregDocumentsFilters) => ({
                        ...prev,
                        page: 1,
                      }));
                    }}
                  />
                </div>
                {/* Pending Only Filter */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pending-only"
                    checked={pendingOnly}
                    onCheckedChange={(checked: boolean) => {
                      setPendingOnly(checked);
                      setFilters((prev: GregDocumentsFilters) => ({
                        ...prev,
                        page: 1,
                      }));
                    }}
                  />
                  <Label htmlFor="pending-only">
                    Afficher uniquement les documents en attente de révision
                  </Label>
                </div>
              </div>

              {/* Controls row */}
              <div className="flex items-end justify-between gap-4 border-t pt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Résultats par page
                  </Label>
                  <Select
                    value={filters.page_size?.toString() ?? '20'}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-10 w-[140px]">
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
                      <X className="mr-2 h-4 w-4" />
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
                      className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                    />
                    {isFetching ? 'Actualisation...' : 'Actualiser'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results */}
        <Card className="overflow-visible shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Résultats
              {isSuccess && data && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({data.total} document{data.total > 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Document
            </Button>
          </CardHeader>
          <CardContent className="overflow-visible px-6 pt-0 pb-8">
            <DocumentsTable
              data={
                data as unknown as
                  | {
                      data: GregDocument[];
                      total: number;
                      page: number;
                      page_size: number;
                      total_pages: number;
                    }
                  | undefined
              }
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
          <EditDocumentModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            document={{
              document_id: editingDocument.id,
              sheet_name: editingDocument.sheet_name,
              spreadsheet_name: editingDocument.spreadsheet_name,
              categories: editingDocument.categories,
              sql_request: editingDocument.pending_for_review,
              summary: editingDocument.summary,
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Modale de suppression de document */}
        {deletingDocument && (
          <DeleteDocumentModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            documentData={{
              id: deletingDocument.id,
              spreadsheet_name:
                deletingDocument.spreadsheet_name ?? 'Nom inconnu',
            }}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
