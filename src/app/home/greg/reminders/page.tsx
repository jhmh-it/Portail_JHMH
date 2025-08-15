'use client';

import { getAuth } from 'firebase/auth';
import {
  AlertCircle,
  Bell,
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

import { CreateReminderModal } from './components/CreateReminderModal';
import { DeleteReminderModal } from './components/DeleteReminderModal';
import { EditReminderModal } from './components/EditReminderModal';
import { ReminderFilters } from './components/ReminderFilters';
import { RemindersTable } from './components/RemindersTable';

interface Reminder {
  id: string;
  message: string;
  user_id: string;
  source_space_id?: string;
  target_space_id: string;
  status: string;
  remind_at: string;
  created_at: string;
  updated_at: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    userId: 'all',
  });
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});

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
    { label: 'Rappels' },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.status !== 'all' ||
    filters.userId !== 'all';

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      userId: 'all',
    });
    setSearchQuery('');
  };

  const fetchReminders = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return;
      }

      const idToken = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.userId !== 'all') {
        if (filters.userId === 'current' && user?.uid) {
          params.append('user_id', user.uid);
        } else if (filters.userId !== 'current') {
          params.append('user_id', filters.userId);
        }
      }

      const url = `/api/greg/reminders${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des rappels');
      }

      const raw = await response.json();
      let list: Reminder[] = [];
      if (Array.isArray(raw?.data)) {
        list = raw.data as Reminder[];
      } else if (Array.isArray(raw)) {
        list = raw as Reminder[];
      } else if (raw?.success && Array.isArray(raw?.data?.data)) {
        list = raw.data.data as Reminder[];
      }

      // Deduplicate by id, keep the most recent (by updated_at then remind_at)
      const toTime = (d?: string) => {
        if (!d) return 0;
        const t = new Date(d).getTime();
        return Number.isFinite(t) ? t : 0;
      };

      const idToReminder = new Map<string, Reminder>();
      for (const r of list) {
        const existing = idToReminder.get(r.id);
        if (!existing) {
          idToReminder.set(r.id, r);
          continue;
        }
        const existingTime = Math.max(
          toTime(existing.updated_at),
          toTime(existing.remind_at)
        );
        const currentTime = Math.max(toTime(r.updated_at), toTime(r.remind_at));
        if (currentTime >= existingTime) {
          idToReminder.set(r.id, r);
        }
      }

      const deduped = Array.from(idToReminder.values()).sort((a, b) => {
        const ta = Math.max(toTime(a.updated_at), toTime(a.remind_at));
        const tb = Math.max(toTime(b.updated_at), toTime(b.remind_at));
        return tb - ta;
      });

      setReminders(deduped);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les rappels');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchUsersMap = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/greg/users', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return;
      const raw = await response.json();
      let list: Array<{ user_id: string; name: string }> = [];
      if (Array.isArray(raw?.data)) {
        list = raw.data as Array<{ user_id: string; name: string }>;
      } else if (Array.isArray(raw)) {
        list = raw as Array<{ user_id: string; name: string }>;
      }
      const map: Record<string, string> = {};
      for (const u of list) {
        if (u?.user_id && u?.name) {
          map[u.user_id] = u.name;
        }
      }
      setUserNamesMap(map);
    } catch (err) {
      // Silencieux: absence de noms n'est pas bloquante
      console.warn('Unable to fetch users map', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
      fetchUsersMap();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReminders();
  };

  const handleRowClick = (reminder: Reminder) => {
    showLoading();
    router.push(`/home/greg/reminders/${reminder.id}`);
  };

  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowEditModal(true);
  };

  const handleDelete = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedReminder(null);
    fetchReminders();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedReminder(null);
    fetchReminders();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchReminders();
  };

  // Filter reminders based on search
  const safeSpaces: GregSpace[] = Array.isArray(spacesData?.data)
    ? ((spacesData?.data ?? []) as GregSpace[])
    : ([] as GregSpace[]);
  const filteredReminders = reminders.filter(reminder => {
    const spacesArray: GregSpace[] = safeSpaces;
    const sourceSpace = reminder.source_space_id
      ? (spacesArray.find(s => s.space_id === reminder.source_space_id) ?? null)
      : null;
    const targetSpace = spacesArray.find(
      s => s.space_id === reminder.target_space_id
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reminder.message.toLowerCase().includes(query) ||
        reminder.id.toLowerCase().includes(query) ||
        reminder.user_id.toLowerCase().includes(query) ||
        Boolean(sourceSpace?.space_name?.toLowerCase().includes(query)) ||
        Boolean(targetSpace?.space_name?.toLowerCase().includes(query))
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

    if (filteredReminders.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery || hasActiveFilters
              ? 'Aucun rappel trouvé avec ces critères'
              : 'Aucun rappel créé'}
          </p>
          {!searchQuery && !hasActiveFilters && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer"
            >
              Créer le premier rappel
            </Button>
          )}
        </div>
      );
    }

    return (
      <RemindersTable
        reminders={filteredReminders}
        spaces={spacesData?.data ?? []}
        userNames={userNamesMap}
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
                  Vous devez être connecté pour voir les rappels
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
              <Bell className="text-primary h-8 w-8" />
              <div>
                <h1 className="text-navy text-3xl font-bold tracking-tight">
                  Rappels
                </h1>
                <p className="text-muted-foreground">
                  Gérez vos rappels et notifications
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Rechercher par message, ID ou espace..."
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
              <ReminderFilters
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
              <CardTitle className="text-xl">Rappels</CardTitle>
              <CardDescription>
                {filteredReminders.length} rappel
                {filteredReminders.length > 1 ? 's' : ''} trouvé
                {filteredReminders.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="cursor-pointer bg-[#0d1b3c] text-white hover:bg-[#0d1b3c]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rappel
            </Button>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        {/* Modals */}
        <CreateReminderModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          spaces={spacesData?.data ?? []}
          currentUserId={user?.uid ?? ''}
          onSuccess={handleCreateSuccess}
        />

        {selectedReminder && (
          <>
            <EditReminderModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              reminder={selectedReminder}
              onSuccess={handleEditSuccess}
            />
            <DeleteReminderModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              reminder={selectedReminder}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
