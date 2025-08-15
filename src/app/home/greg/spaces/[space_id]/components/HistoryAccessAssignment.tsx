'use client';

import { getAuth } from 'firebase/auth';
import { Search, MapPin, History, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useGregSpaces } from '../../../hooks';
import type { GregSpace } from '../../../types';

interface HistoryAccessAssignmentProps {
  spaceId: string;
}

export function HistoryAccessAssignment({
  spaceId,
}: HistoryAccessAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch all spaces
  const { data, isLoading, error } = useGregSpaces({
    page: 1,
    page_size: 100, // Get more spaces for assignment
    q: searchQuery || undefined,
  });

  // Filter out the current space from the list
  const availableSpaces = Array.isArray(data?.data)
    ? (data?.data as GregSpace[]).filter(
        (space: GregSpace) => space.space_id && space.space_id !== spaceId
      )
    : [];

  const handleSelectSpace = (targetSpaceId: string) => {
    setSelectedSpaces(prev => {
      if (prev.includes(targetSpaceId)) {
        return prev.filter(id => id !== targetSpaceId);
      }
      return [...prev, targetSpaceId];
    });
  };

  const handleSelectAll = () => {
    if (availableSpaces.length > 0) {
      if (selectedSpaces.length === availableSpaces.length) {
        setSelectedSpaces([]);
      } else {
        setSelectedSpaces(
          availableSpaces
            .map(space => space.space_id)
            .filter((id): id is string => Boolean(id))
        );
      }
    }
  };

  const handleAssignHistoryAccess = async () => {
    if (selectedSpaces.length === 0) {
      toast.error('Veuillez sélectionner au moins un espace');
      return;
    }

    setIsAssigning(true);

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch(
        `/api/greg/spaces/${spaceId}/assign-history-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            target_space_ids: selectedSpaces,
            notes: {},
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Erreur lors de l'assignation");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error ?? "Erreur lors de l'assignation");
      }

      toast.success(
        `Accès à l'historique de ${selectedSpaces.length} espace(s) assigné avec succès`,
        {
          style: {
            color: '#16a34a',
            borderColor: '#16a34a',
          },
        }
      );

      // Clear selection
      setSelectedSpaces([]);
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'assignation"
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // const formatSpaceType = (type: string): string => {
  //   switch (type) {
  //     case 'ROOM':
  //       return 'Groupe';
  //     case 'DM':
  //       return 'DM';
  //     default:
  //       return type;
  //   }
  // };

  return (
    <div className="h-full">
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="text-lg">
            Assigner l&apos;accès à l&apos;historique
          </CardTitle>
          <CardDescription>
            Sélectionnez les espaces dont cet espace pourra consulter
            l&apos;historique
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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
                onClick={handleSelectAll}
                disabled={!availableSpaces || availableSpaces.length === 0}
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
              onClick={handleAssignHistoryAccess}
              disabled={selectedSpaces.length === 0 || isAssigning}
              size="sm"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <History className="mr-2 h-4 w-4" />
                  Assigner l&apos;accès
                </>
              )}
            </Button>
          </div>

          {/* Spaces List */}
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )}
          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertDescription>
                Erreur lors du chargement des espaces
              </AlertDescription>
            </Alert>
          )}
          {!isLoading &&
            !error &&
            (!availableSpaces || availableSpaces.length === 0) && (
              <div className="text-muted-foreground py-8 text-center">
                Aucun autre espace disponible
              </div>
            )}
          {!isLoading &&
            !error &&
            availableSpaces &&
            availableSpaces.length > 0 && (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {availableSpaces.map((space: GregSpace) => (
                  <div
                    key={space.space_id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    onClick={() =>
                      space.space_id && handleSelectSpace(space.space_id)
                    }
                  >
                    <Checkbox
                      checked={
                        space.space_id
                          ? selectedSpaces.includes(space.space_id)
                          : false
                      }
                      onCheckedChange={() =>
                        space.space_id && handleSelectSpace(space.space_id)
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
            )}
        </CardContent>
      </Card>
    </div>
  );
}
