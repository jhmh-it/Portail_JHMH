'use client';

import { getAuth } from 'firebase/auth';
import {
  AlertCircle,
  Filter,
  Plus,
  RefreshCw,
  Search,
  User,
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

import { CreateUserModal } from './components/CreateUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { EditUserModal } from './components/EditUserModal';
import { UserFilters } from './components/UserFilters';
import { UsersTable } from './components/UsersTable';

interface GregUser {
  user_id: string;
  name: string;
  mail: string;
  custom_instruction?: string;
  frequence_utilisation?: number;
  rn?: number;
  source_prefere?: string;
  sources?: boolean;
  verbose?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<GregUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GregUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    source_prefere: 'all',
    verbose: 'all',
  });

  const router = useRouter();
  const { data: user } = useUser();
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
    { label: 'Utilisateurs' },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.source_prefere !== 'all' ||
    filters.verbose !== 'all';

  const handleClearFilters = () => {
    setFilters({
      source_prefere: 'all',
      verbose: 'all',
    });
    setSearchQuery('');
  };

  const fetchUsers = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return;
      }

      const idToken = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (filters.source_prefere !== 'all') {
        params.append('source_prefere', filters.source_prefere);
      }
      if (filters.verbose !== 'all') {
        params.append('verbose', filters.verbose);
      }

      const url = `/api/greg/users${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleRowClick = (gregUser: GregUser) => {
    showLoading();
    // Remove "users/" prefix if it exists in user_id
    const cleanUserId = gregUser.user_id.replace(/^users\//, '');
    router.push(`/home/greg/users/${cleanUserId}`);
  };

  const handleEdit = (gregUser: GregUser) => {
    setSelectedUser(gregUser);
    setShowEditModal(true);
  };

  const handleDelete = (gregUser: GregUser) => {
    setSelectedUser(gregUser);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchUsers();
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.mail.toLowerCase().includes(query) ||
        user.user_id.toLowerCase().includes(query) ||
        (user.source_prefere?.toLowerCase().includes(query) ?? false) ||
        (user.custom_instruction?.toLowerCase().includes(query) ?? false)
      );
    }

    return true;
  });

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {searchQuery || hasActiveFilters
              ? 'Aucun utilisateur trouvé avec ces critères'
              : 'Aucun utilisateur créé'}
          </p>
          {!searchQuery && !hasActiveFilters && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer"
            >
              Créer le premier utilisateur
            </Button>
          )}
        </div>
      );
    }

    return (
      <UsersTable
        users={filteredUsers}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64 mt-2" />
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
                  Vous devez être connecté pour voir les utilisateurs
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-navy">
                  Utilisateurs
                </h1>
                <p className="text-muted-foreground">
                  Gérez les utilisateurs de votre système
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou ID..."
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
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-2">
              <UserFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Utilisateurs</CardTitle>
              <CardDescription>
                {filteredUsers.length} utilisateur
                {filteredUsers.length > 1 ? 's' : ''} trouvé
                {filteredUsers.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer bg-[#0d1b3c] hover:bg-[#0d1b3c]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        {/* Modals */}
        <CreateUserModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleCreateSuccess}
        />

        {selectedUser && (
          <>
            <EditUserModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              user={selectedUser}
              onSuccess={handleEditSuccess}
            />
            <DeleteUserModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              user={selectedUser}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
