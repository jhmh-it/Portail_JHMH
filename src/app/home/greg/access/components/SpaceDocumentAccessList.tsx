'use client';

import { getAuth } from 'firebase/auth';
import {
  MoreVertical,
  Trash2,
  Edit,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
import { useGregDocuments, useGregSpaces } from '@/hooks/useGregApi';
import { useUser } from '@/hooks/useUser';

interface SpaceDocumentAccess {
  space_id: string;
  document_id: string;
  granted_at: string;
}

interface Props {
  searchQuery: string;
  filters: {
    spaceType: string;
    documentType: string;
    dateRange: string;
  };
  onCreateNew: () => void;
  onLoadingChange?: (isLoading: boolean) => void; // Ajout pour synchronisation loader global
}

export function SpaceDocumentAccessList({
  searchQuery,
  filters,
  onCreateNew,
  onLoadingChange,
}: Props) {
  const [accessList, setAccessList] = useState<SpaceDocumentAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronisation du loader global
  useEffect(() => {
    if (onLoadingChange) onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  // Get user to ensure we're authenticated
  const { data: user } = useUser();

  // Fetch documents and spaces for mapping
  const { data: documentsData } = useGregDocuments({ page: 1, page_size: 100 });
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
        setIsLoading(false);
        setError('Utilisateur non connecté à Firebase (désynchronisation).');
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/greg/space-document-access', {
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
      setError('Impossible de charger les accès');
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

  const handleDelete = async (spaceId: string, documentId: string) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/greg/space-document-access', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          space_id: spaceId,
          document_id: documentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Accès supprimé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      fetchAccessList();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Filter access list based on search and filters
  const filteredAccessList = accessList.filter(access => {
    const space = spacesData?.data?.find(s => s.space_id === access.space_id);
    const document = documentsData?.data?.find(
      d => d.id === access.document_id
    );

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !space?.space_name.toLowerCase().includes(query) &&
        !document?.spreadsheet_name.toLowerCase().includes(query) &&
        !access.space_id.toLowerCase().includes(query) &&
        !access.document_id.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Space type filter
    if (filters.spaceType !== 'all' && space?.type !== filters.spaceType) {
      return false;
    }

    // Document type filter
    if (filters.documentType !== 'all') {
      if (filters.documentType === 'pending' && !document?.pending_for_review) {
        return false;
      }
      if (filters.documentType === 'approved' && document?.pending_for_review) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès Documents-Espaces</CardTitle>
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
          <CardTitle>Accès Documents-Espaces</CardTitle>
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
          <CardTitle>Accès Documents-Espaces</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Accès Documents-Espaces</CardTitle>
          <CardDescription>
            Gérez quels espaces peuvent accéder à quels documents
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onCreateNew}
            className="cursor-pointer bg-[#0d1b3c] hover:bg-[#0d1b3c]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel accès
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAccessList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {searchQuery || Object.values(filters).some(v => v !== 'all')
                ? 'Aucun accès trouvé avec ces critères'
                : 'Aucun accès configuré'}
            </p>
            <Button onClick={onCreateNew} size="sm" className="cursor-pointer">
              Créer un premier accès
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Espace</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Date d&apos;accès</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccessList.map(access => {
                  const space = spacesData?.data?.find(
                    s => s.space_id === access.space_id
                  );
                  const document = documentsData?.data?.find(
                    d => d.id === access.document_id
                  );

                  return (
                    <TableRow key={`${access.space_id}-${access.document_id}`}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">
                            {space?.space_name ?? 'Inconnu'}
                          </p>
                          {space?.type && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {space.type === 'ROOM' ? 'Groupe' : 'DM'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">
                            {document?.spreadsheet_name ?? 'Inconnu'}
                          </p>
                          {document?.pending_for_review && (
                            <Badge
                              variant="secondary"
                              className="text-xs w-fit"
                            >
                              En attente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() =>
                                handleDelete(
                                  access.space_id,
                                  access.document_id
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
  );
}
