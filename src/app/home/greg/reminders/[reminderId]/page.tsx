'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import {
  ChevronLeft,
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

  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Rappels', href: '/home/greg/reminders' },
    { label: reminder?.title ?? reminderId },
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

        const data = await response.json();
        setReminder(data);
        setError(null);
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
    toast.success('Rappel supprimé avec succès');
    router.push('/home/greg/reminders');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Urgent
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Haute
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Moyenne
          </Badge>
        );
      case 'LOW':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
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
                <ChevronLeft className="h-4 w-4 mr-2" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/home/greg/reminders')}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux rappels
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

        {/* Reminder Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {reminder.title ?? `Rappel ${reminder.reminder_id}`}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    ID: {reminder.reminder_id}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(reminder.status)}
                <span className="font-medium">
                  {getStatusText(reminder.status)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {reminder.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm">{reminder.description}</p>
              </div>
            )}

            {/* Main Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {reminder.type && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.type}
                      </p>
                    </div>
                  </div>
                )}
                {reminder.priority && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Priorité</p>
                      <div className="mt-1">
                        {getPriorityBadge(reminder.priority)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {reminder.due_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        Date d&apos;échéance
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(reminder.due_date)}
                      </p>
                    </div>
                  </div>
                )}
                {reminder.assigned_to && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Assigné à</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.assigned_to}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {reminder.notes && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Notes
                </h3>
                <p className="text-sm">{reminder.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t space-y-1">
              {reminder.created_at && (
                <p className="text-xs text-muted-foreground">
                  Créé le {formatDateTime(reminder.created_at)}
                </p>
              )}
              {reminder.updated_at &&
                reminder.updated_at !== reminder.created_at && (
                  <p className="text-xs text-muted-foreground">
                    Dernière modification le{' '}
                    {formatDateTime(reminder.updated_at)}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {reminder && (
          <>
            <EditReminderModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              reminder={{
                id: reminder.reminder_id,
                message: reminder.description ?? '',
                user_id: reminder.assigned_to ?? '',
                target_space_id: '',
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
                target_space_id: '',
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
