'use client';

import { getAuth } from 'firebase/auth';
import {
  ArrowLeft,
  MapPin,
  FileText,
  History,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Removed Card imports as the info card has been deleted
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

import { DeleteSpaceModal } from './components/DeleteSpaceModal';
import { DocumentsAssignment } from './components/DocumentsAssignment';
import { EditSpaceModal } from './components/EditSpaceModal';
import { HistoryAccessAssignment } from './components/HistoryAccessAssignment';

interface SpaceDetails {
  space_id: string;
  space_name: string;
  type: string;
  notes?: string;
}

export default function SpaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.space_id as string;
  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const [spaceDetails, setSpaceDetails] = useState<SpaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopySpaceId = async () => {
    try {
      await navigator.clipboard.writeText(`spaces/${spaceId}`);
      toast.success('ID copié dans le presse-papier', {
        style: { color: 'green' },
        icon: '✓',
      });
    } catch {}
  };

  useEffect(() => {
    if (!spaceId || !user) return;

    const fetchSpaceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();

        const response = await fetch(`/api/greg/spaces/${spaceId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les détails de l'espace");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setSpaceDetails(result.data);
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

    fetchSpaceDetails();
  }, [spaceId, user, hideLoading]);

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Espaces', href: '/home/greg/spaces' },
    { label: spaceDetails?.space_name ?? 'Chargement...' },
  ];

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

  const handleEditSuccess = async () => {
    // Rafraîchir les données
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const response = await fetch(`/api/greg/spaces/${spaceId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSpaceDetails(result.data);
          toast.success('Espace modifié avec succès', {
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
    toast.success('Espace supprimé avec succès', {
      style: { color: 'green' },
      icon: '✓',
    });
    router.push('/home/greg/spaces');
  };

  if (error) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push('/home/greg/spaces')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux espaces
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-[calc(100vh-120px)] flex-col py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="mb-1 h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </>
                ) : (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h1
                            className="hover:text-primary/80 cursor-pointer text-2xl font-bold tracking-tight break-words transition-colors"
                            onClick={handleCopySpaceId}
                          >
                            {spaceDetails?.space_name}
                          </h1>
                        </TooltipTrigger>
                        <TooltipContent className="flex items-center gap-2">
                          <Copy className="h-3 w-3" />
                          <span>spaces/{spaceId}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatSpaceType(spaceDetails?.type ?? '')}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {!isLoading && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Informations encadrées supprimées car déjà présentes dans le header */}

        {/* Tabs for assignments */}
        {!isLoading && spaceDetails && (
          <Tabs defaultValue="documents" className="mt-6 flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-2 gap-3 p-1">
              <TabsTrigger
                value="documents"
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
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="history"
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
                <History className="h-4 w-4" />
                Accès Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="documents"
              className="mt-6 flex-1 overflow-y-auto"
            >
              <DocumentsAssignment spaceId={`spaces/${spaceId}`} />
            </TabsContent>

            <TabsContent
              value="history"
              className="mt-6 flex-1 overflow-y-auto"
            >
              <HistoryAccessAssignment spaceId={`spaces/${spaceId}`} />
            </TabsContent>
          </Tabs>
        )}

        {/* Modales */}
        {spaceDetails && (
          <>
            <EditSpaceModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              space={spaceDetails}
              onSuccess={handleEditSuccess}
            />
            <DeleteSpaceModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              spaceData={{
                space_id: spaceDetails.space_id,
                space_name: spaceDetails.space_name,
              }}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
