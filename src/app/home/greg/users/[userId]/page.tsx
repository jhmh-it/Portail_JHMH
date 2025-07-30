'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import {
  ChevronLeft,
  User,
  Edit,
  Trash2,
  Mail,
  Settings,
  Activity,
  Tag,
  AlertCircle,
  FileText,
  Hash,
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

import { DeleteUserModal } from '../components/DeleteUserModal';
import { EditUserModal } from '../components/EditUserModal';

interface UserDetails {
  user_id: string;
  name: string;
  mail: string;
  custom_instruction?: string;
  frequence_utilisation?: number;
  rn?: number;
  source_prefere?: string;
  sources?: boolean;
  verbose?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [gregUser, setGregUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Utilisateurs', href: '/home/greg/users' },
    { label: gregUser?.name ?? userId },
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('Utilisateur non connecté');
          return;
        }

        const idToken = await currentUser.getIdToken();

        // Clean userId (remove users/ prefix if present)
        const cleanUserId = userId.replace(/^users\//, '');

        const response = await fetch(`/api/greg/users/${cleanUserId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Utilisateur non trouvé');
          }
          throw new Error("Erreur lors de la récupération de l'utilisateur");
        }

        const data = await response.json();
        setGregUser(data);
        setError(null);
      } catch (error: unknown) {
        console.error('Erreur:', error);
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les détails de l'utilisateur"
        );
      } finally {
        setIsLoading(false);
        hideLoading();
      }
    };

    if (user && userId) {
      fetchUserDetails();
    } else {
      setIsLoading(false);
      hideLoading();
    }
  }, [user, userId, hideLoading]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    // Refresh user details
    window.location.reload();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    toast.success('Utilisateur supprimé avec succès');
    router.push('/home/greg/users');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const getVerboseBadge = (verbose?: boolean) => {
    if (verbose === undefined)
      return <Badge variant="outline">Non défini</Badge>;
    return verbose ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Activé
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        Désactivé
      </Badge>
    );
  };

  const getSourcesBadge = (sources?: boolean) => {
    if (sources === undefined)
      return <Badge variant="outline">Non défini</Badge>;
    return sources ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        Activées
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        Désactivées
      </Badge>
    );
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return <Badge variant="outline">Non défini</Badge>;

    switch (source.toLowerCase()) {
      case 'web':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Web
          </Badge>
        );
      case 'mobile':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Mobile
          </Badge>
        );
      case 'api':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            API
          </Badge>
        );
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getActivityBadge = (frequency?: number) => {
    if (frequency === undefined)
      return <Badge variant="outline">Non défini</Badge>;

    if (frequency >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Très actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 20) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          Modéré ({frequency}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Faible ({frequency}%)
        </Badge>
      );
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
                  Vous devez être connecté pour voir les détails de
                  l&apos;utilisateur
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !gregUser) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error ?? 'Utilisateur non trouvé'}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/home/greg/users')}
                className="mt-4 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour aux utilisateurs
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
              onClick={() => router.push('/home/greg/users')}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux utilisateurs
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

        {/* User Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{gregUser.name}</CardTitle>
                  <CardDescription className="mt-2">
                    ID: {gregUser.user_id}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                {getActivityBadge(gregUser.frequence_utilisation)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Contact
              </h3>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {gregUser.mail}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground">
                Configuration
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Source préférée</p>
                      <div className="mt-1">
                        {getSourceBadge(gregUser.source_prefere)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Mode verbose</p>
                      <div className="mt-1">
                        {getVerboseBadge(gregUser.verbose)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sources</p>
                      <div className="mt-1">
                        {getSourcesBadge(gregUser.sources)}
                      </div>
                    </div>
                  </div>
                  {gregUser.rn !== undefined && (
                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Numéro de ligne</p>
                        <p className="text-sm text-muted-foreground">
                          {gregUser.rn}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            {gregUser.custom_instruction && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Instructions personnalisées
                </h3>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{gregUser.custom_instruction}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t space-y-1">
              {gregUser.created_at && (
                <p className="text-xs text-muted-foreground">
                  Créé le {formatDateTime(gregUser.created_at)}
                </p>
              )}
              {gregUser.updated_at &&
                gregUser.updated_at !== gregUser.created_at && (
                  <p className="text-xs text-muted-foreground">
                    Dernière modification le{' '}
                    {formatDateTime(gregUser.updated_at)}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {gregUser && (
          <>
            <EditUserModal
              open={showEditModal}
              onOpenChange={setShowEditModal}
              user={gregUser}
              onSuccess={handleEditSuccess}
            />
            <DeleteUserModal
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              user={gregUser}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
