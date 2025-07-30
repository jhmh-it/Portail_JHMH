'use client';

import { getAuth } from 'firebase/auth';
import { ArrowLeft, FileText, Edit, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { useLoadingStore } from '@/stores/loading-store';

import { DeleteDocumentModal } from './components/DeleteDocumentModal';
import { EditDocumentModal } from './components/EditDocumentModal';
import { SpacesAssignment } from './components/SpacesAssignment';

interface DocumentDetails {
  id: string;
  spreadsheet_name: string;
  sheet_name: string;
  summary?: string;
  categories?: string;
  pending_for_review?: boolean;
}

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.document_id as string;
  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const [documentDetails, setDocumentDetails] =
    useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      if (!user || !documentId) return;

      try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Token non disponible');

        const response = await fetch(`/api/greg/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails du document');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setDocumentDetails(result.data);
        } else {
          throw new Error(result.error ?? 'Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails:', err);
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue'
        );
      } finally {
        setIsLoading(false);
        hideLoading();
      }
    };

    fetchDocumentDetails();
  }, [documentId, user, hideLoading]);

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Documents', href: '/home/greg/documents' },
    { label: documentDetails?.spreadsheet_name ?? 'Chargement...' },
  ];

  const handleEditSuccess = async () => {
    // Rafraîchir les données
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const response = await fetch(`/api/greg/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDocumentDetails(result.data);
          toast.success('Document modifié avec succès', {
            style: { color: 'green' },
            icon: '✓',
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    }
  };

  const handleDeleteSuccess = () => {
    toast.success('Document supprimé avec succès', {
      style: { color: 'green' },
      icon: '✓',
    });
    router.push('/home/greg/documents');
  };

  const handleSpacesUpdate = () => {
    // Re-fetch document details after spaces are updated
    const fetchUpdatedDetails = async () => {
      if (!user || !documentId) return;

      try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;

        const response = await fetch(`/api/greg/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setDocumentDetails(result.data);
          }
        }
      } catch (err) {
        console.error('Erreur lors du rafraîchissement:', err);
      }
    };

    fetchUpdatedDetails();
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/home/greg/documents')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux documents
          </Button>
        </div>

        {/* Titre et description */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="h-8 w-8 text-green-700" />
          </div>
          <div className="flex-1">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">
                  {documentDetails?.spreadsheet_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {documentDetails?.sheet_name}
                </p>
              </>
            )}
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="spaces">Espaces</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ) : (
                documentDetails && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Informations du document
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditModal(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Détails du document</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            ID
                          </p>
                          <p className="text-sm font-mono mt-1">
                            {documentDetails.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Statut
                          </p>
                          <div className="mt-1">
                            <Badge
                              variant={
                                documentDetails.pending_for_review
                                  ? 'secondary'
                                  : 'default'
                              }
                              className={cn(
                                documentDetails.pending_for_review
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                              )}
                            >
                              {documentDetails.pending_for_review
                                ? 'En attente de révision'
                                : 'Validé'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Nom de la feuille de calcul
                        </p>
                        <p className="text-sm mt-1">
                          {documentDetails.spreadsheet_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Nom de la feuille
                        </p>
                        <p className="text-sm mt-1">
                          {documentDetails.sheet_name}
                        </p>
                      </div>
                      {documentDetails.summary && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Résumé
                          </p>
                          <p className="text-sm mt-1">
                            {documentDetails.summary}
                          </p>
                        </div>
                      )}
                      {documentDetails.categories && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Catégories
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {documentDetails.categories
                              .split(',')
                              .map((category, index) => (
                                <Badge key={index} variant="outline">
                                  {category.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </TabsContent>

            <TabsContent value="spaces" className="mt-6">
              {documentDetails && (
                <SpacesAssignment
                  documentId={documentId}
                  assignedSpaces={[]}
                  onUpdate={handleSpacesUpdate}
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Modales */}
        {documentDetails && (
          <>
            <EditDocumentModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              document={{
                id: documentDetails.id,
                title: documentDetails.spreadsheet_name,
                content: documentDetails.summary ?? '',
                is_pending_review: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              onSuccess={handleEditSuccess}
            />
            <DeleteDocumentModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              document={{
                id: documentDetails.id,
                title: documentDetails.spreadsheet_name,
                content: documentDetails.summary ?? '',
                is_pending_review: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
