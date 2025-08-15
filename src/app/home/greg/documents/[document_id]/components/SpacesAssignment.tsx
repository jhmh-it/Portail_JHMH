'use client';

import { getAuth } from 'firebase/auth';
import { Plus, Trash2, Search, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useGregSpaces } from '../../../hooks';
import type { GregSpace } from '../../../types';

interface Props {
  documentId: string;
  assignedSpaces: string[];
  onUpdate: () => void;
}

export function SpacesAssignment({
  documentId,
  assignedSpaces,
  onUpdate,
}: Props) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const { data: spacesData, isLoading: isLoadingSpaces } = useGregSpaces({
    page: 1,
    page_size: 100,
    q: searchQuery || undefined,
  });

  const handleAssignSpaces = async () => {
    if (selectedSpaces.length === 0) return;

    setIsAssigning(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsAssigning(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `/api/greg/documents/${documentId}/assign-spaces`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            space_ids: selectedSpaces,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'assignation");
      }

      toast.success(
        `${selectedSpaces.length} espace(s) assigné(s) avec succès`,
        {
          style: { color: 'green' },
          icon: '✓',
        }
      );

      setSelectedSpaces([]);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'assignation de l'espace");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignSpace = async (spaceId: string) => {
    // désassignation unitaire

    const setLoading = (value: boolean) => {
      // garder compatibilité avec ancien état
      setIsAssigning(value);
    };
    setLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        `/api/greg/documents/${documentId}/unassign-spaces`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            space_ids: [spaceId],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la désassignation');
      }

      toast.success('Espace désassigné avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la désassignation de l'espace");
    } finally {
      setLoading(false);
    }
  };

  const availableSpaces = Array.isArray(spacesData?.data)
    ? (spacesData?.data as GregSpace[]).filter(
        (space: GregSpace) =>
          space.space_id && !assignedSpaces.includes(space.space_id)
      )
    : [];

  const assignedSpaceDetails = Array.isArray(spacesData?.data)
    ? (spacesData?.data as GregSpace[]).filter(
        (space: GregSpace) =>
          space.space_id && assignedSpaces.includes(space.space_id)
      )
    : [];

  if (isLoadingSpaces) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Espaces assignés</CardTitle>
          <CardDescription>
            Gérez les espaces assignés à ce document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Assigner des espaces</CardTitle>
        <CardDescription>
          Sélectionnez les espaces qui auront accès à ce document
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-6 overflow-hidden">
        {/* Recherche */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher des espaces..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedSpaces.length === availableSpaces.length) {
                  setSelectedSpaces([]);
                } else {
                  setSelectedSpaces(
                    availableSpaces.map(s => s.space_id as string)
                  );
                }
              }}
              disabled={!availableSpaces.length}
            >
              {selectedSpaces.length === availableSpaces.length &&
              availableSpaces.length > 0
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </Button>
            {selectedSpaces.length > 0 && (
              <Badge variant="secondary">
                {selectedSpaces.length} sélectionné(s)
              </Badge>
            )}
          </div>
          <Button
            onClick={handleAssignSpaces}
            disabled={selectedSpaces.length === 0 || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Assigner
              </>
            )}
          </Button>
        </div>

        {/* Liste des espaces disponibles */}
        {availableSpaces.length > 0 ? (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {availableSpaces.map(space => (
              <div
                key={space.space_id}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                onClick={() =>
                  space.space_id &&
                  setSelectedSpaces(prev =>
                    prev.includes(space.space_id as string)
                      ? prev.filter(id => id !== space.space_id)
                      : [...prev, space.space_id as string]
                  )
                }
              >
                <Checkbox
                  checked={selectedSpaces.includes(space.space_id as string)}
                  onCheckedChange={() =>
                    space.space_id &&
                    setSelectedSpaces(prev =>
                      prev.includes(space.space_id as string)
                        ? prev.filter(id => id !== space.space_id)
                        : [...prev, space.space_id as string]
                    )
                  }
                  onClick={e => e.stopPropagation()}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium break-words">
                      {space.space_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Aucun espace disponible
          </p>
        )}

        {/* Liste des espaces assignés */}
        <div className="space-y-2">
          {assignedSpaceDetails.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun espace assigné
            </p>
          ) : (
            assignedSpaceDetails.map(space => (
              <div
                key={space.space_id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{space.space_name}</p>
                  <p className="text-muted-foreground text-sm">
                    {space.space_id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnassignSpace(space.space_id as string)}
                  disabled={isAssigning}
                  className="cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
