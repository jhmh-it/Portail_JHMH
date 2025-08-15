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
  Tag,
  AlertCircle,
  FileText,
  Hash,
  Copy,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const [_copiedUserId, setCopiedUserId] = useState(false);

  const { data: user } = useUser();
  const { hideLoading } = useLoadingStore();

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Greg', href: '/home/greg' },
    { label: 'Utilisateurs', href: '/home/greg/users' },
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

  const handleCopyUserId = async () => {
    if (!gregUser?.user_id) return;
    try {
      await navigator.clipboard.writeText(gregUser.user_id);
      setCopiedUserId(true);
      toast.success('ID copié dans le presse-papier');
      setTimeout(() => setCopiedUserId(false), 1500);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const getVerboseBadge = (verbose?: boolean) => {
    if (verbose === undefined)
      return <Badge variant="outline">Non défini</Badge>;
    return verbose ? (
      <Badge className="border-green-200 bg-green-100 text-green-800">
        Activé
      </Badge>
    ) : (
      <Badge className="border-gray-200 bg-gray-100 text-gray-800">
        Désactivé
      </Badge>
    );
  };

  const getSourcesBadge = (sources?: boolean) => {
    if (sources === undefined)
      return <Badge variant="outline">Non défini</Badge>;
    return sources ? (
      <Badge className="border-blue-200 bg-blue-100 text-blue-800">
        Activées
      </Badge>
    ) : (
      <Badge className="border-gray-200 bg-gray-100 text-gray-800">
        Désactivées
      </Badge>
    );
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return <Badge variant="outline">Non défini</Badge>;

    switch (source.toLowerCase()) {
      case 'web':
        return (
          <Badge className="border-blue-200 bg-blue-100 text-blue-800">
            Web
          </Badge>
        );
      case 'mobile':
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
            Mobile
          </Badge>
        );
      case 'api':
        return (
          <Badge className="border-purple-200 bg-purple-100 text-purple-800">
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
        <Badge className="border-green-200 bg-green-100 text-green-800">
          Très actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 60) {
      return (
        <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
          Actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 20) {
      return (
        <Badge className="border-orange-200 bg-orange-100 text-orange-800">
          Modéré ({frequency}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="border-red-200 bg-red-100 text-red-800">
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
                <ChevronLeft className="mr-2 h-4 w-4" />
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
      <div className="container mx-auto py-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <User className="h-6 w-6" />
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h1
                        className="hover:text-primary/80 cursor-pointer text-3xl font-bold tracking-tight transition-colors"
                        onClick={handleCopyUserId}
                      >
                        {gregUser.name}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2">
                      <Copy className="h-3 w-3" />
                      <span>ID: {gregUser.user_id}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-muted-foreground mt-1">{gregUser.mail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6">
          {/* User Information Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Informations de l&apos;utilisateur
                </h2>
                <div className="flex items-center gap-2">
                  {getActivityBadge(gregUser.frequence_utilisation)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Two column layout for information */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="text-sm text-gray-900">{gregUser.mail}</p>
                  </div>

                  {/* Source préférée */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4" />
                      Source préférée
                    </div>
                    {getSourceBadge(gregUser.source_prefere)}
                  </div>

                  {/* Mode verbose */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Settings className="h-4 w-4" />
                      Mode verbose
                    </div>
                    {getVerboseBadge(gregUser.verbose)}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Sources */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Settings className="h-4 w-4" />
                      Sources
                    </div>
                    {getSourcesBadge(gregUser.sources)}
                  </div>

                  {/* Numéro de ligne */}
                  {gregUser.rn !== undefined && (
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Hash className="h-4 w-4" />
                        Numéro de ligne
                      </div>
                      <p className="text-sm text-gray-900">{gregUser.rn}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Instructions Card */}
          {gregUser.custom_instruction && (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">
                    Instructions personnalisées
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {gregUser.custom_instruction}
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Information Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold">Informations système</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gregUser.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Créé le :</span>
                    <span className="text-gray-900">
                      {formatDateTime(gregUser.created_at)}
                    </span>
                  </div>
                )}
                {gregUser.updated_at &&
                  gregUser.updated_at !== gregUser.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">
                        Dernière modification :
                      </span>
                      <span className="text-gray-900">
                        {formatDateTime(gregUser.updated_at)}
                      </span>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

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
