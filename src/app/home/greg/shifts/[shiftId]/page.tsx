'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import {
  ChevronLeft,
  Clock,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Tag,
  AlertCircle,
} from 'lucide-react';
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
import { useGregSpaces } from '@/hooks/useGregApi';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

import { DeleteShiftModal } from '../components/DeleteShiftModal';
import { EditShiftModal } from '../components/EditShiftModal';

interface ShiftDetails {
  shift_id: string;
  name?: string;
  location?: string;
  capacity?: number;
  shift_type?: string;
  start_time: string;
  end_time: string;
  status?: string;
  created_at?: string;
}

export default function ShiftDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shiftId = params.shiftId as string;

  const [shift, setShift] = useState<ShiftDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: user } = useUser();
  const { data: spacesData } = useGregSpaces({ page: 1, page_size: 100 });
  const { hideLoading } = useLoadingStore();

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Shifts', href: '/home/greg/shifts' },
    { label: shift?.name ?? shiftId },
  ];

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('Utilisateur non connecté');
          return;
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/greg/shifts/${shiftId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Shift non trouvé');
          }
          throw new Error('Erreur lors de la récupération du shift');
        }

        const data = await response.json();
        setShift(data);
        setError(null);
      } catch (error: unknown) {
        console.error('Erreur:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les détails du shift'
        );
      } finally {
        setIsLoading(false);
        hideLoading();
      }
    };

    if (user && shiftId) {
      fetchShiftDetails();
    } else {
      setIsLoading(false);
      hideLoading();
    }
  }, [user, shiftId, hideLoading]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    // Refresh shift details
    window.location.reload();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    toast.success('Shift supprimé avec succès');
    router.push('/home/greg/shifts');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous devez être connecté pour voir les détails du shift
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !shift) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error ?? 'Shift non trouvé'}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/home/greg/shifts')}
                className="mt-4 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour aux shifts
              </Button>
            </CardContent>
          </Card>
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
              variant="ghost"
              onClick={() => router.push('/home/greg/shifts')}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux shifts
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Shift Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {shift.name ?? `Shift ${shift.shift_id}`}
                </CardTitle>
                <CardDescription className="mt-2">
                  ID: {shift.shift_id}
                </CardDescription>
              </div>
              {shift.status && (
                <Badge variant="secondary" className="text-sm">
                  {shift.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(shift.start_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Horaires</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(shift.start_time)} -{' '}
                      {formatTime(shift.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {shift.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Localisation</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.location}
                      </p>
                    </div>
                  </div>
                )}
                {shift.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Capacité</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.capacity} participants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {shift.shift_type && (
              <div className="flex items-start gap-3 pt-4 border-t">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Type de shift</p>
                  <p className="text-sm text-muted-foreground">
                    {shift.shift_type}
                  </p>
                </div>
              </div>
            )}

            {shift.created_at && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Créé le {formatDateTime(shift.created_at)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {shift && (
          <>
            <EditShiftModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              shift={{
                id: shift.shift_id,
                space_id: '', // This will be filled from the API
                content: shift.name ?? '',
                start_time: shift.start_time,
                end_time: shift.end_time,
              }}
              spaces={spacesData?.data ?? []}
              onSuccess={handleEditSuccess}
            />
            <DeleteShiftModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              shift={{
                id: shift.shift_id,
                space_id: '', // This will be filled from the API
                content: shift.name ?? `Shift ${shift.shift_id}`,
                start_time: shift.start_time,
                end_time: shift.end_time,
              }}
              spaceName="Espace"
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
