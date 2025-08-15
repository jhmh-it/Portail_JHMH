'use client';

import { getAuth } from 'firebase/auth';
import {
  AlertCircle,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

import { useGregSpaces } from '../hooks';
import type { GregSpace } from '../types';

import { CreateShiftModal } from './components/CreateShiftModal';
import { DeleteShiftModal } from './components/DeleteShiftModal';
import { EditShiftModal } from './components/EditShiftModal';
import { ShiftFilters } from './components/ShiftFilters';
import { ShiftsTable } from './components/ShiftsTable';

interface Shift {
  id: string;
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    spaceId: 'all',
  });

  const router = useRouter();
  const { data: user } = useUser();
  const { data: spacesData } = useGregSpaces({ page: 1, page_size: 100 });
  const { showLoading, hideLoading } = useLoadingStore();

  // Fermer le loader global dès que le chargement est terminé
  useEffect(() => {
    if (!isLoading) {
      hideLoading();
    }
  }, [isLoading, hideLoading]);

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Shifts' },
  ];

  // Check if any filters are active
  const hasActiveFilters = Boolean(searchQuery) || filters.spaceId !== 'all';

  const handleClearFilters = () => {
    setFilters({
      spaceId: 'all',
    });
    setSearchQuery('');
  };

  const fetchShifts = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return;
      }

      const idToken = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (filters.spaceId !== 'all') {
        params.append('space_id', filters.spaceId);
      }

      const url = `/api/greg/shifts${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des shifts');
      }

      const data = await response.json();
      setShifts(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les shifts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchShifts();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchShifts();
  };

  const handleRowClick = (shift: Shift) => {
    showLoading();
    router.push(`/home/greg/shifts/${shift.id}`);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setShowEditModal(true);
  };

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedShift(null);
    fetchShifts();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedShift(null);
    fetchShifts();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchShifts();
  };

  // Filter shifts based on search
  const filteredShifts = shifts.filter(shift => {
    const space = Array.isArray(spacesData?.data)
      ? spacesData.data.find((s: GregSpace) => s.space_id === shift.space_id)
      : undefined;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        shift.content.toLowerCase().includes(query) ||
        shift.id.toLowerCase().includes(query) ||
        space?.space_name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="mt-2 h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous devez être connecté pour voir les shifts
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredShifts.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery || hasActiveFilters
              ? 'Aucun shift trouvé avec ces critères'
              : 'Aucun shift créé'}
          </p>
          {!searchQuery && !hasActiveFilters && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer"
            >
              Créer le premier shift
            </Button>
          )}
        </div>
      );
    }

    return (
      <ShiftsTable
        shifts={filteredShifts}
        spaces={spacesData?.data ?? []}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-8 w-8" />
              <div>
                <h1 className="text-navy text-3xl font-bold tracking-tight">
                  Shifts
                </h1>
                <p className="text-muted-foreground">
                  Gérez les shifts et plannings de vos équipes
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Rechercher par contenu, ID ou espace..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="cursor-pointer gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-xs"
                  >
                    {(filters.spaceId !== 'all' ? 1 : 0) +
                      (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="cursor-pointer"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-2">
              <ShiftFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
                spaces={spacesData?.data ?? []}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Shifts</CardTitle>
              <CardDescription>
                {filteredShifts.length} shift
                {filteredShifts.length > 1 ? 's' : ''} trouvé
                {filteredShifts.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer bg-[#0d1b3c] text-white hover:bg-[#0d1b3c]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau shift
            </Button>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        {/* Modals */}
        <CreateShiftModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          spaces={spacesData?.data ?? []}
          onSuccess={handleCreateSuccess}
        />

        {selectedShift && (
          <>
            <EditShiftModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              shift={selectedShift}
              spaces={spacesData?.data ?? []}
              onSuccess={handleEditSuccess}
            />
            <DeleteShiftModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              shift={selectedShift}
              spaceName={
                Array.isArray(spacesData?.data)
                  ? (spacesData.data.find(
                      (s: GregSpace) => s.space_id === selectedShift.space_id
                    )?.space_name ?? 'Inconnu')
                  : 'Inconnu'
              }
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
