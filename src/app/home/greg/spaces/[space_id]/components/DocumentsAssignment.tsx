'use client';

import { getAuth } from 'firebase/auth';
import { Search, FileText, Plus, Loader2 } from 'lucide-react';
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

import { useGregDocuments } from '../../../hooks';
import type { GregDocument } from '../../../types';

interface DocumentsAssignmentProps {
  spaceId: string;
}

export function DocumentsAssignment({ spaceId }: DocumentsAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch all documents
  const { data, isLoading, error } = useGregDocuments({
    // Pas de pagination côté API: on ne passe aucun paramètre non supporté
    q: searchQuery || undefined,
  });

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      }
      return [...prev, documentId];
    });
  };

  const handleSelectAll = () => {
    if (data?.data) {
      if (selectedDocuments.length === (data.data as unknown[]).length) {
        setSelectedDocuments([]);
      } else {
        setSelectedDocuments(
          (data.data as unknown as GregDocument[]).map(
            (doc: GregDocument) => doc.id
          )
        );
      }
    }
  };

  const handleAssignDocuments = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Veuillez sélectionner au moins un document');
      return;
    }

    setIsAssigning(true);

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch(
        `/api/greg/spaces/${spaceId}/assign-documents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            document_ids: selectedDocuments,
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
        `${selectedDocuments.length} document(s) assigné(s) avec succès`,
        {
          style: {
            color: '#16a34a',
            borderColor: '#16a34a',
          },
        }
      );

      // Clear selection
      setSelectedDocuments([]);
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

  return (
    <div className="h-full">
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Assigner des documents</CardTitle>
          <CardDescription>
            Sélectionnez les documents à associer à cet espace
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Rechercher des documents..."
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
                disabled={!data?.data || data.data.length === 0}
              >
                {selectedDocuments.length === data?.data?.length &&
                data?.data?.length > 0
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
              {selectedDocuments.length > 0 && (
                <Badge variant="secondary">
                  {selectedDocuments.length} sélectionné(s)
                </Badge>
              )}
            </div>
            <Button
              onClick={handleAssignDocuments}
              disabled={selectedDocuments.length === 0 || isAssigning}
              size="sm"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Assigner les documents
                </>
              )}
            </Button>
          </div>

          {/* Documents List */}
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
                Erreur lors du chargement des documents
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (!data?.data || data.data.length === 0) && (
            <div className="text-muted-foreground py-8 text-center">
              Aucun document disponible
            </div>
          )}
          {!isLoading && !error && data?.data && data.data.length > 0 && (
            <div className="flex-1 space-y-2 overflow-y-auto">
              {(data?.data as unknown as GregDocument[]).map(
                (document: GregDocument) => (
                  <div
                    key={document.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    onClick={() => handleSelectDocument(document.id)}
                  >
                    <Checkbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={() => handleSelectDocument(document.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium break-words">
                          {document.spreadsheet_name}
                        </span>
                        {document.pending_for_review && (
                          <Badge
                            variant="outline"
                            className="border-orange-200 text-xs text-orange-600"
                          >
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm break-words">
                        {document.sheet_name}
                        {document.summary && ` • ${document.summary}`}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
