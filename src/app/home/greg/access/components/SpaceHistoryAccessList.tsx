'use client';

import { getAuth } from 'firebase/auth';
import {
  MoreVertical,
  Trash2,
  Edit,
  Calendar,
  AlertCircle,
  StickyNote,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser } from '@/hooks/useUser';

import { useGregSpaces } from '../../hooks';
import type { GregSpace } from '../../types';

import { DeleteHistoryAccessModal } from './DeleteHistoryAccessModal';
import { EditHistoryAccessModal } from './EditHistoryAccessModal';

interface SpaceHistoryAccess {
  space_id: string;
  space_target_id: string;
  granted_at: string;
  note?: string;
}

interface Props {
  searchQuery: string;
  filters: {
    spaceType: string;
    documentType: string;
    dateRange: string;
  };
  onCreateNew: () => void;
}

export function SpaceHistoryAccessList({
  searchQuery,
  filters,
  onCreateNew,
}: Props) {
  const [accessList, setAccessList] = useState<SpaceHistoryAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccess, setSelectedAccess] =
    useState<SpaceHistoryAccess | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get user to ensure we're authenticated
  const { data: user } = useUser();

  // Fetch spaces for mapping
  const { data: spacesData } = useGregSpaces({ page: 1, page_size: 100 });

  // Timeout de sécurité pour éviter le blocage du loading si user reste indéfini
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      if (!user) {
        setError(
          "Impossible de déterminer l'utilisateur. Veuillez vous reconnecter."
        );
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [user]);

  const fetchAccessList = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.warn(
          '[SpaceHistoryAccessList] Blocage: user présent côté app mais currentUser Firebase null. Chargement infini évité.'
        );
        setIsLoading(false);
        // Ajout d'un log visuel pour debug
        setError('Utilisateur non connecté à Firebase (désynchronisation).');
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/greg/space-history-access', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des accès');
      }

      const data = await response.json();
      setAccessList(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les accès historiques');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccessList();
    } else if (user === null) {
      setIsLoading(false);
    }
  }, [user]);

  const handleEdit = (access: SpaceHistoryAccess) => {
    setSelectedAccess(access);
    setShowEditModal(true);
  };

  const handleDelete = (access: SpaceHistoryAccess) => {
    setSelectedAccess(access);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedAccess(null);
    fetchAccessList();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedAccess(null);
    fetchAccessList();
  };

  // Filter access list based on search and filters
  const filteredAccessList = accessList.filter(access => {
    const sourceSpace = Array.isArray(spacesData?.data)
      ? spacesData.data.find((s: GregSpace) => s.space_id === access.space_id)
      : undefined;
    const targetSpace = Array.isArray(spacesData?.data)
      ? spacesData.data.find(
          (s: GregSpace) => s.space_id === access.space_target_id
        )
      : undefined;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !sourceSpace?.space_name.toLowerCase().includes(query) &&
        !targetSpace?.space_name.toLowerCase().includes(query) &&
        !access.space_id.toLowerCase().includes(query) &&
        !access.space_target_id.toLowerCase().includes(query) &&
        !access.note?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Space type filter
    if (filters.spaceType !== 'all') {
      if (
        sourceSpace?.type !== filters.spaceType &&
        targetSpace?.type !== filters.spaceType
      ) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès Historiques entre Espaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès Historiques entre Espaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour voir les accès
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès Historiques entre Espaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              Accès Historiques entre Espaces
            </CardTitle>
            <CardDescription>
              Gérez quels espaces peuvent accéder à l&apos;historique
              d&apos;autres espaces
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onCreateNew}
              className="cursor-pointer bg-[#0d1b3c] text-white hover:bg-[#0d1b3c]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel accès
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAccessList.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.values(filters).some(v => v !== 'all')
                  ? 'Aucun accès trouvé avec ces critères'
                  : 'Aucun accès historique configuré'}
              </p>
              <Button
                onClick={onCreateNew}
                size="sm"
                className="cursor-pointer"
              >
                Créer un premier accès
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Espace demandeur</TableHead>
                    <TableHead>Espace cible</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date d&apos;accès</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccessList.map(access => {
                    const sourceSpace = Array.isArray(spacesData?.data)
                      ? spacesData.data.find(
                          (s: GregSpace) => s.space_id === access.space_id
                        )
                      : undefined;
                    const targetSpace = Array.isArray(spacesData?.data)
                      ? spacesData.data.find(
                          (s: GregSpace) =>
                            s.space_id === access.space_target_id
                        )
                      : undefined;

                    return (
                      <TableRow
                        key={`${access.space_id}-${access.space_target_id}`}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">
                              {sourceSpace?.space_name ?? 'Inconnu'}
                            </p>
                            {sourceSpace?.type && (
                              <Badge
                                variant="outline"
                                className="w-fit text-xs"
                              >
                                {sourceSpace.type === 'ROOM' ? 'Groupe' : 'DM'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">
                              {targetSpace?.space_name ?? 'Inconnu'}
                            </p>
                            {targetSpace?.type && (
                              <Badge
                                variant="outline"
                                className="w-fit text-xs"
                              >
                                {targetSpace.type === 'ROOM' ? 'Groupe' : 'DM'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {access.note ? (
                            <div className="flex max-w-xs items-start gap-2">
                              <StickyNote className="text-muted-foreground mt-0.5 h-3 w-3" />
                              <p className="text-muted-foreground line-clamp-2 text-sm">
                                {access.note}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(access.granted_at).toLocaleDateString(
                              'fr-FR'
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEdit(access)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier la note
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => handleDelete(access)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAccess && (
        <>
          <EditHistoryAccessModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            access={selectedAccess}
            spaces={spacesData?.data ?? []}
            onSuccess={handleEditSuccess}
          />
          <DeleteHistoryAccessModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            access={selectedAccess}
            sourceSpaceName={
              Array.isArray(spacesData?.data)
                ? (spacesData.data.find(
                    (s: GregSpace) => s.space_id === selectedAccess.space_id
                  )?.space_name ?? 'Inconnu')
                : 'Inconnu'
            }
            targetSpaceName={
              Array.isArray(spacesData?.data)
                ? (spacesData.data.find(
                    (s: GregSpace) =>
                      s.space_id === selectedAccess.space_target_id
                  )?.space_name ?? 'Inconnu')
                : 'Inconnu'
            }
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </>
  );
}
