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
import { useGregSpaces } from '@/hooks/useGregApi';
import type { GregSpace } from '@/types/greg';

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
  const availableSpaces =
    data?.data.filter(space => space.space_id !== spaceId) ?? [];

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
        setSelectedSpaces(availableSpaces.map(space => space.space_id));
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

  const formatSpaceType = (type: string): string => {
    switch (type) {
      case 'ROOM':
        return 'Groupe';
      case 'DM':
        return 'DM';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Assigner l&apos;accès à l&apos;historique
          </CardTitle>
          <CardDescription>
            Sélectionnez les espaces dont cet espace pourra consulter
            l&apos;historique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              onClick={handleAssignHistoryAccess}
              disabled={selectedSpaces.length === 0 || isAssigning}
              size="sm"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <History className="h-4 w-4 mr-2" />
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
                  className="flex items-center gap-3 p-3 border rounded-lg"
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
          {!isLoading && !error && !availableSpaces.length && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun autre espace disponible
            </div>
          )}
          {!isLoading && !error && availableSpaces.length && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSpaces.map((space: GregSpace) => (
                <div
                  key={space.space_id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectSpace(space.space_id)}
                >
                  <Checkbox
                    checked={selectedSpaces.includes(space.space_id)}
                    onCheckedChange={() => handleSelectSpace(space.space_id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium truncate">
                        {space.space_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {formatSpaceType(space.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate font-mono">
                      {space.space_id}
                    </p>
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
