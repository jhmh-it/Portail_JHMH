'use client';

import { getAuth } from 'firebase/auth';
import {
  ArrowLeft,
  MapPin,
  FileText,
  History,
  Edit,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux espaces
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/home/greg/spaces')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {spaceDetails?.space_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {formatSpaceType(spaceDetails?.type ?? '')} • spaces/
                      {spaceId}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : (
          spaceDetails && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Informations</CardTitle>
                    <CardDescription>Détails de l&apos;espace</CardDescription>
                  </div>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type
                    </p>
                    <p className="text-sm mt-1">
                      {formatSpaceType(spaceDetails.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ID
                    </p>
                    <p className="text-sm font-mono mt-1">
                      {spaceDetails.space_id}
                    </p>
                  </div>
                </div>
                {spaceDetails.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm mt-1">{spaceDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}

        {/* Tabs for assignments */}
        {!isLoading && spaceDetails && (
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Accès Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-6">
              <DocumentsAssignment spaceId={`spaces/${spaceId}`} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
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
