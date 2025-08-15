'use client';

import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import {
  ArrowLeft,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

import { useGregSpaces } from '../../hooks';
import { DeleteShiftModal } from '../components/DeleteShiftModal';
import { EditShiftModal } from '../components/EditShiftModal';

interface ShiftDetails {
  shift_id: string;
  space_id?: string;
  name?: string;
  content?: string;
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

        const result = await response.json();
        // Déballer la réponse standardisée { success, data }
        const raw = result?.data ?? result;
        // Normaliser la structure aux besoins de l'UI
        const mapped: ShiftDetails = {
          shift_id: raw?.shift_id ?? raw?.id ?? shiftId,
          space_id: raw?.space_id,
          name: raw?.name ?? undefined,
          content: typeof raw?.content === 'string' ? raw.content : undefined,
          location: raw?.location ?? undefined,
          capacity:
            typeof raw?.capacity === 'number' ? raw.capacity : undefined,
          shift_type: raw?.shift_type ?? undefined,
          start_time: raw?.start_time ?? '',
          end_time: raw?.end_time ?? '',
          status: raw?.status ?? undefined,
          created_at: raw?.created_at ?? undefined,
        };
        setShift(mapped);
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

  const toSafeDate = (input?: string): Date | null => {
    if (!input || typeof input !== 'string') return null;
    // Essayer ISO directement
    const direct = new Date(input);
    if (isValid(direct)) return direct;
    // Essayer parseISO
    const iso = parseISO(input);
    if (isValid(iso)) return iso;
    // Essayer timestamp numérique (sec ou ms)
    const asNumber = Number(input);
    if (Number.isFinite(asNumber)) {
      const millis = asNumber > 1e12 ? asNumber : asNumber * 1000;
      const fromNum = new Date(millis);
      if (isValid(fromNum)) return fromNum;
    }
    return null;
  };

  const formatDateTime = (dateString: string) => {
    const d = toSafeDate(dateString);
    return d ? format(d, 'dd MMMM yyyy à HH:mm', { locale: fr }) : '-';
  };

  const formatTime = (dateString: string) => {
    const d = toSafeDate(dateString);
    return d ? format(d, 'HH:mm', { locale: fr }) : '-';
  };

  const formatDate = (dateString: string) => {
    const d = toSafeDate(dateString);
    return d ? format(d, 'dd MMMM yyyy', { locale: fr }) : '-';
  };

  const escapeHtml = (unsafe: string): string =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const renderBasicMarkdown = (text: string): string => {
    let html = escapeHtml(text);
    // horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-4" />');
    // checkboxes
    html = html.replace(/^\s*\[x\]/gim, '✅');
    html = html.replace(/^\s*\[ \]/gim, '⬜');
    // bold then italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // bullets
    html = html.replace(/^\s*[•●]\s*/gm, '• ');
    // line breaks
    html = html.replace(/\n/g, '<br />');
    return html;
  };

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
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
                <ArrowLeft className="mr-2 h-4 w-4" />
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
      <div>
        {/* Shift Details */}
        <div className="pb-6">
          <Card className="relative border-0 bg-transparent shadow-none">
            {shift.status && (
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="secondary" className="text-sm">
                  {shift.status}
                </Badge>
              </div>
            )}
            <CardHeader className="relative pb-6">
              <CardTitle className="text-2xl font-semibold">
                Informations du shift
              </CardTitle>
              {/* Actions inside header, absolute & non-intrusive */}
              <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="cursor-pointer bg-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6">
              {/* Date and Time Section */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(shift.start_time)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Horaires
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTime(shift.start_time)} -{' '}
                      {formatTime(shift.end_time)}
                    </span>
                  </div>
                </div>
                {shift.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Localisation
                      </span>
                      <span className="text-sm text-gray-600">
                        {shift.location}
                      </span>
                    </div>
                  </div>
                )}
                {typeof shift.capacity === 'number' && (
                  <div className="flex items-center gap-3">
                    <Users className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Capacité
                      </span>
                      <span className="text-sm text-gray-600">
                        {shift.capacity} participants
                      </span>
                    </div>
                  </div>
                )}
                {shift.shift_type && (
                  <div className="flex items-center gap-3">
                    <Tag className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Type
                      </span>
                      <span className="text-sm text-gray-600">
                        {shift.shift_type}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content block */}
              {shift.content && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Contenu
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-5">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-gray-700 [&_li]:list-disc [&>em]:italic [&>p]:mb-4 [&>strong]:font-semibold [&>ul]:my-3 [&>ul]:space-y-2 [&>ul]:pl-5"
                      dangerouslySetInnerHTML={{
                        __html: renderBasicMarkdown(shift.content),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {shift.created_at && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    Créé le {formatDateTime(shift.created_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {shift && (
        <>
          <EditShiftModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            shift={{
              id: shift.shift_id,
              space_id: shift.space_id ?? '',
              content: shift.content ?? '',
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
              space_id: shift.space_id ?? '',
              content: shift.name ?? `Shift ${shift.shift_id}`,
              start_time: shift.start_time,
              end_time: shift.end_time,
            }}
            spaceName="Espace"
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </DashboardLayout>
  );
}
