'use client';

import { getAuth } from 'firebase/auth';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGregSpaces } from '@/hooks/useGregApi';

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');

  const { data: spacesData, isLoading: isLoadingSpaces } = useGregSpaces({
    page: 1,
    page_size: 100,
  });

  const handleAssignSpace = async () => {
    if (!selectedSpaceId) return;

    setIsLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsLoading(false);
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
            space_ids: [selectedSpaceId],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'assignation");
      }

      toast.success('Espace assigné avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      setSelectedSpaceId('');
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'assignation de l'espace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignSpace = async (spaceId: string) => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  const availableSpaces =
    spacesData?.data?.filter(
      space => !assignedSpaces.includes(space.space_id)
    ) ?? [];

  const assignedSpaceDetails =
    spacesData?.data?.filter(space =>
      assignedSpaces.includes(space.space_id)
    ) ?? [];

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
    <Card>
      <CardHeader>
        <CardTitle>Espaces assignés</CardTitle>
        <CardDescription>
          Gérez les espaces assignés à ce document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire d'assignation */}
        <div className="flex gap-2">
          <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionnez un espace" />
            </SelectTrigger>
            <SelectContent>
              {availableSpaces.map(space => (
                <SelectItem key={space.space_id} value={space.space_id}>
                  {space.space_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignSpace}
            disabled={!selectedSpaceId || isLoading}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assigner
          </Button>
        </div>

        {/* Liste des espaces assignés */}
        <div className="space-y-2">
          {assignedSpaceDetails.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun espace assigné
            </p>
          ) : (
            assignedSpaceDetails.map(space => (
              <div
                key={space.space_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{space.space_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {space.space_id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnassignSpace(space.space_id)}
                  disabled={isLoading}
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
