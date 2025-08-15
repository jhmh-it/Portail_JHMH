'use client';

import { getAuth } from 'firebase/auth';
import { FileText, Edit, Trash2, Copy } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { useLoadingStore } from '@/stores/loading-store';

import { DeleteDocumentModal } from './components/DeleteDocumentModal';
import { EditDocumentModal } from './components/EditDocumentModal';
import { SpacesAssignment } from './components/SpacesAssignment';

interface DocumentDetails {
  id: string;
  title?: string;
  content?: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  summary?: string;
  categories?: string;
  is_pending_review?: boolean;
  pending_for_review?: boolean; // Deprecated alias
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
  const [_copied, setCopied] = useState(false);

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

  const handleCopyId = async () => {
    if (!documentDetails?.id) return;
    try {
      await navigator.clipboard.writeText(documentDetails.id);
      setCopied(true);
      toast.success('ID copié dans le presse-papier');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Erreur lors de la copie');
    }
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
      <div className="flex h-[calc(100vh-120px)] flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <FileText className="h-8 w-8 text-green-700" />
            </div>
            <div className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </>
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h1
                          className="hover:text-primary/80 cursor-pointer text-2xl font-bold tracking-tight transition-colors"
                          onClick={handleCopyId}
                        >
                          {documentDetails?.spreadsheet_name}
                        </h1>
                      </TooltipTrigger>
                      <TooltipContent className="flex items-center gap-2">
                        <Copy className="h-3 w-3" />
                        <span className="font-mono text-xs">
                          {documentDetails?.id}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground text-sm">
                      {documentDetails?.sheet_name}
                    </p>
                    {documentDetails && (
                      <Badge
                        variant={
                          (documentDetails.is_pending_review ??
                          documentDetails.pending_for_review)
                            ? 'secondary'
                            : 'default'
                        }
                        className={cn(
                          'text-xs',
                          (documentDetails.is_pending_review ??
                            documentDetails.pending_for_review)
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {(documentDetails.is_pending_review ??
                        documentDetails.pending_for_review)
                          ? 'En attente de révision'
                          : 'Validé'}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {!isLoading && documentDetails && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="info" className="flex h-full flex-col space-y-4">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 gap-3 p-1">
              <TabsTrigger
                value="info"
                style={{
                  cursor: 'pointer',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                className="flex items-center gap-2 hover:bg-gray-50 data-[state=active]:!border-[#0d1b3c] data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white"
              >
                Informations
              </TabsTrigger>
              <TabsTrigger
                value="spaces"
                style={{
                  cursor: 'pointer',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                className="flex items-center gap-2 hover:bg-gray-50 data-[state=active]:!border-[#0d1b3c] data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white"
              >
                Espaces
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 space-y-4">
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
                  <div className="space-y-4">
                    {/* Informations principales */}
                    <Card>
                      <CardHeader className="pb-4">
                        <h3 className="text-base font-medium">
                          Informations du document
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-muted-foreground text-sm font-medium">
                              Feuille de calcul
                            </p>
                            <p className="mt-1 text-sm">
                              {documentDetails.spreadsheet_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm font-medium">
                              Nom de la feuille
                            </p>
                            <p className="mt-1 text-sm">
                              {documentDetails.sheet_name}
                            </p>
                          </div>
                        </div>

                        {documentDetails.title && (
                          <div>
                            <p className="text-muted-foreground text-sm font-medium">
                              Titre
                            </p>
                            <p className="mt-1 text-sm">
                              {documentDetails.title}
                            </p>
                          </div>
                        )}

                        {documentDetails.summary && (
                          <div>
                            <p className="text-muted-foreground text-sm font-medium">
                              Résumé
                            </p>
                            <p className="mt-1 text-sm">
                              {documentDetails.summary}
                            </p>
                          </div>
                        )}

                        {documentDetails.content && (
                          <div>
                            <p className="text-muted-foreground mb-2 text-sm font-medium">
                              Contenu
                            </p>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <p className="text-sm whitespace-pre-wrap">
                                {documentDetails.content}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Catégories */}
                    {documentDetails.categories && (
                      <Card>
                        <CardHeader className="pb-2">
                          <h3 className="text-base font-medium">Catégories</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {documentDetails.categories
                              .split(',')
                              .map((category, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="rounded-full px-1 py-1"
                                >
                                  {category.trim()}
                                </Badge>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="spaces" className="mt-6 flex-1 overflow-y-auto">
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
                title:
                  documentDetails.title ??
                  documentDetails.spreadsheet_name ??
                  '',
                content:
                  documentDetails.content ?? documentDetails.summary ?? '',
                is_pending_review:
                  documentDetails.is_pending_review ??
                  documentDetails.pending_for_review ??
                  false,
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
                title:
                  documentDetails.title ??
                  documentDetails.spreadsheet_name ??
                  '',
                content:
                  documentDetails.content ?? documentDetails.summary ?? '',
                is_pending_review:
                  documentDetails.is_pending_review ??
                  documentDetails.pending_for_review ??
                  false,
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
