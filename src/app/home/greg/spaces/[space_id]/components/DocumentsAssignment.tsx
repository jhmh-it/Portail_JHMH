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
import { useGregDocuments } from '@/hooks/useGregApi';
import type { GregDocument } from '@/types/greg';

interface DocumentsAssignmentProps {
  spaceId: string;
}

export function DocumentsAssignment({ spaceId }: DocumentsAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch all documents
  const { data, isLoading, error } = useGregDocuments({
    page: 1,
    page_size: 100, // Get more documents for assignment
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
      if (selectedDocuments.length === data.data.length) {
        setSelectedDocuments([]);
      } else {
        setSelectedDocuments(data.data.map(doc => doc.id));
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigner des documents</CardTitle>
          <CardDescription>
            Sélectionnez les documents à associer à cet espace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                disabled={!data?.data.length}
              >
                {selectedDocuments.length === data?.data.length &&
                data?.data.length > 0
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
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
                Erreur lors du chargement des documents
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && !data?.data.length && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun document disponible
            </div>
          )}
          {!isLoading && !error && data?.data.length && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.data.map((document: GregDocument) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectDocument(document.id)}
                >
                  <Checkbox
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={() => handleSelectDocument(document.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium truncate">
                        {document.spreadsheet_name}
                      </span>
                      {document.pending_for_review && (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200 text-xs"
                        >
                          En attente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {document.sheet_name}
                      {document.summary && ` • ${document.summary}`}
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
