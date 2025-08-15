'use client';

import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import {
  ArrowLeft,
  Bell,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

import { DeleteReminderModal } from '../components/DeleteReminderModal';
import { EditReminderModal } from '../components/EditReminderModal';

interface ReminderDetails {
  reminder_id: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  source_space_id?: string;
  source_space_name?: string;
  target_space_id?: string;
  target_space_name?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ReminderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reminderId = params.reminderId as string;

  const [reminder, setReminder] = useState<ReminderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [_copied, setCopied] = useState(false);

  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Rappels', href: '/home/greg/reminders' },
  ];

  useEffect(() => {
    const fetchReminderDetails = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          return;
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/greg/reminders/${reminderId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Rappel non trouvé');
          }
          throw new Error('Erreur lors de la récupération du rappel');
        }

        const result = await response.json();
        const raw = result?.data ?? result;
        const normalizeStatus = (s?: string) => {
          const v = (s ?? '').toLowerCase();
          if (v === 'done' || v === 'completed') return 'COMPLETED';
          if (v === 'cancelled' || v === 'canceled') return 'CANCELLED';
          if (v === 'in_progress' || v === 'in-progress') return 'IN_PROGRESS';
          if (v === 'pending') return 'PENDING';
          return s?.toUpperCase();
        };
        const firstLine: string | undefined =
          typeof raw?.message === 'string'
            ? (raw.message as string).split('\n')[0]?.trim()
            : undefined;
        const mapped: ReminderDetails = {
          reminder_id: raw?.reminder_id ?? raw?.id ?? reminderId,
          title: raw?.title ?? firstLine ?? undefined,
          description:
            raw?.description ??
            (typeof raw?.message === 'string' ? raw.message : undefined),
          type: raw?.type ?? undefined,
          status: normalizeStatus(raw?.status),
          priority: raw?.priority ?? undefined,
          due_date: raw?.due_date ?? raw?.remind_at ?? undefined,
          assigned_to: raw?.assigned_to ?? raw?.user_id ?? undefined,
          source_space_id: raw?.source_space_id ?? undefined,
          target_space_id: raw?.target_space_id ?? undefined,
          notes: raw?.notes ?? undefined,
          created_at: raw?.created_at ?? undefined,
          updated_at: raw?.updated_at ?? undefined,
        };
        setReminder(mapped);
        setError(null);

        // Fetch user name if assigned_to exists
        if (mapped.assigned_to) {
          try {
            const userResponse = await fetch(
              `/api/greg/users/${mapped.assigned_to.replace(/^users\//, '')}`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const userName = userData?.data?.name ?? userData?.name;
              if (userName) {
                setReminder(prev =>
                  prev ? { ...prev, assigned_to_name: userName } : prev
                );
              }
            }
          } catch (err) {
            console.error(
              "Erreur lors de la récupération du nom de l'utilisateur:",
              err
            );
          }
        }

        // Fetch source space name if exists
        if (mapped.source_space_id) {
          try {
            const spaceResponse = await fetch(
              `/api/greg/spaces/${mapped.source_space_id.replace(/^spaces\//, '')}`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );
            if (spaceResponse.ok) {
              const spaceData = await spaceResponse.json();
              const spaceName =
                spaceData?.data?.space_name ?? spaceData?.space_name;
              if (spaceName) {
                setReminder(prev =>
                  prev ? { ...prev, source_space_name: spaceName } : prev
                );
              }
            }
          } catch (err) {
            console.error(
              "Erreur lors de la récupération du nom de l'espace source:",
              err
            );
          }
        }

        // Fetch target space name if exists
        if (mapped.target_space_id) {
          try {
            const spaceResponse = await fetch(
              `/api/greg/spaces/${mapped.target_space_id.replace(/^spaces\//, '')}`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );
            if (spaceResponse.ok) {
              const spaceData = await spaceResponse.json();
              const spaceName =
                spaceData?.data?.space_name ?? spaceData?.space_name;
              if (spaceName) {
                setReminder(prev =>
                  prev ? { ...prev, target_space_name: spaceName } : prev
                );
              }
            }
          } catch (err) {
            console.error(
              "Erreur lors de la récupération du nom de l'espace cible:",
              err
            );
          }
        }
      } catch (error: unknown) {
        console.error('Erreur:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les détails du rappel'
        );
      } finally {
        setIsLoading(false);
        hideLoading();
      }
    };

    if (user && reminderId) {
      fetchReminderDetails();
    } else {
      setIsLoading(false);
      hideLoading();
    }
  }, [user, reminderId, hideLoading]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    // Refresh reminder details
    window.location.reload();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    toast.success('Rappel supprimé avec succès', {
      style: { color: 'green' },
      icon: '✓',
    });
    router.push('/home/greg/reminders');
  };

  const toSafeDate = (input?: string): Date | null => {
    if (!input || typeof input !== 'string') return null;
    const d = new Date(input);
    if (isValid(d)) return d;
    const p = parseISO(input);
    if (isValid(p)) return p;
    const n = Number(input);
    if (Number.isFinite(n)) {
      const ms = n > 1e12 ? n : n * 1000;
      const dn = new Date(ms);
      if (isValid(dn)) return dn;
    }
    return null;
  };

  const formatDateTime = (dateString: string) => {
    const d = toSafeDate(dateString);
    return d ? format(d, 'dd MMMM yyyy à HH:mm', { locale: fr }) : '-';
  };

  const formatDate = (dateString: string) => {
    const d = toSafeDate(dateString);
    return d ? format(d, 'dd MMMM yyyy', { locale: fr }) : '-';
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800">
            Urgent
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className="border-orange-200 bg-orange-100 text-orange-800">
            Haute
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
            Moyenne
          </Badge>
        );
      case 'LOW':
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
            Faible
          </Badge>
        );
      default:
        return priority ? <Badge variant="outline">{priority}</Badge> : null;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'PENDING':
        return 'En attente';
      default:
        return status ?? 'Non défini';
    }
  };

  const handleCopyId = async () => {
    if (reminder?.reminder_id) {
      try {
        await navigator.clipboard.writeText(reminder.reminder_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('ID copié dans le presse-papier', {
          style: { color: 'green' },
          icon: '✓',
        });
      } catch {}
    }
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
                  Vous devez être connecté pour voir les détails du rappel
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reminder) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error ?? 'Rappel non trouvé'}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/home/greg/reminders')}
                className="mt-4 cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux rappels
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="text-primary h-8 w-8" />
            <div className="min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="mb-1 h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h1
                        className="hover:text-primary/80 cursor-pointer text-2xl font-bold tracking-tight break-words transition-colors"
                        onClick={handleCopyId}
                      >
                        {reminder?.title ?? `Rappel ${reminder?.reminder_id}`}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2">
                      <Copy className="h-3 w-3" />
                      <span>{reminder?.reminder_id}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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

        {/* Reminder Details Card */}
        {!isLoading && reminder && (
          <Card className="relative shadow-sm">
            {/* Status Badge - Top Right Corner */}
            <div className="absolute top-4 right-4 z-10">
              <Badge
                variant={(() => {
                  if (reminder.status === 'COMPLETED') return 'default';
                  if (reminder.status === 'CANCELLED') return 'destructive';
                  if (reminder.status === 'IN_PROGRESS') return 'secondary';
                  return 'outline';
                })()}
                className={(() => {
                  if (reminder.status === 'COMPLETED')
                    return 'border-green-200 bg-green-100 text-green-800';
                  if (reminder.status === 'CANCELLED')
                    return 'border-red-200 bg-red-100 text-red-800';
                  if (reminder.status === 'IN_PROGRESS')
                    return 'border-blue-200 bg-blue-100 text-blue-800';
                  return 'border-amber-200 bg-amber-100 text-amber-800';
                })()}
              >
                {getStatusIcon(reminder.status)}
                <span className="ml-1.5">{getStatusText(reminder.status)}</span>
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>Informations du rappel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Information Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {reminder.priority && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Priorité</p>
                        <div className="mt-1">
                          {getPriorityBadge(reminder.priority)}
                        </div>
                      </div>
                    </div>
                  )}

                  {reminder.type && (
                    <div className="flex items-start gap-3">
                      <Tag className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Type</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-600">
                          {reminder.type}
                        </p>
                      </div>
                    </div>
                  )}

                  {reminder.due_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Date de rappel</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-600">
                          {formatDate(reminder.due_date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {reminder.assigned_to && (
                    <div className="flex items-start gap-3">
                      <User className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Assigné à</p>
                        <p className="mt-0.5 text-sm">
                          <Link
                            href={`/home/greg/users/${reminder.assigned_to.replace(/^users\//, '')}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {reminder.assigned_to_name ?? reminder.assigned_to}
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {reminder.source_space_id && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Espace source</p>
                        {reminder.source_space_id.startsWith('spaces/') ? (
                          <p className="mt-0.5 text-sm">
                            <Link
                              href={`/home/greg/spaces/${reminder.source_space_id.replace(/^spaces\//, '')}`}
                              className="font-medium break-all text-blue-600 hover:underline"
                            >
                              {reminder.source_space_name ??
                                reminder.source_space_id}
                            </Link>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-sm font-medium break-all text-gray-600">
                            {reminder.source_space_name ??
                              reminder.source_space_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {reminder.target_space_id && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Espace cible</p>
                        {reminder.target_space_id.startsWith('spaces/') ? (
                          <p className="mt-0.5 text-sm">
                            <Link
                              href={`/home/greg/spaces/${reminder.target_space_id.replace(/^spaces\//, '')}`}
                              className="font-medium break-all text-blue-600 hover:underline"
                            >
                              {reminder.target_space_name ??
                                reminder.target_space_id}
                            </Link>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-sm font-medium break-all text-gray-600">
                            {reminder.target_space_name ??
                              reminder.target_space_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {reminder.notes && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Notes
                  </h3>
                  <p className="text-sm">{reminder.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-1 border-t pt-4">
                {reminder.created_at && (
                  <p className="text-muted-foreground text-xs">
                    Créé le {formatDateTime(reminder.created_at)}
                  </p>
                )}
                {reminder.updated_at &&
                  reminder.updated_at !== reminder.created_at && (
                    <p className="text-muted-foreground text-xs">
                      Dernière modification le{' '}
                      {formatDateTime(reminder.updated_at)}
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {reminder && (
          <>
            <EditReminderModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              reminder={{
                id: reminder.reminder_id.replace('reminders/', ''), // Remove prefix if present
                message: reminder.description ?? '',
                user_id: reminder.assigned_to ?? '',
                target_space_id: reminder.target_space_id ?? '',
                status: reminder.status ?? 'PENDING',
                remind_at: reminder.due_date ?? new Date().toISOString(),
                created_at: reminder.created_at ?? new Date().toISOString(),
                updated_at: reminder.updated_at ?? new Date().toISOString(),
              }}
              onSuccess={handleEditSuccess}
            />
            <DeleteReminderModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              reminder={{
                id: reminder.reminder_id,
                message:
                  reminder.title ??
                  reminder.description ??
                  `Rappel ${reminder.reminder_id}`,
                user_id: reminder.assigned_to ?? '',
                target_space_id: reminder.target_space_id ?? '',
                status: reminder.status ?? 'PENDING',
                remind_at: reminder.due_date ?? new Date().toISOString(),
                created_at: reminder.created_at ?? new Date().toISOString(),
                updated_at: reminder.updated_at ?? new Date().toISOString(),
              }}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
