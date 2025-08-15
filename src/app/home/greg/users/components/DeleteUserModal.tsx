'use client';

import { getAuth } from 'firebase/auth';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GregUser {
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: GregUser;
  onSuccess: () => void;
}

export function DeleteUserModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsDeleting(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      // Clean user_id (remove users/ prefix if present)
      const cleanUserId = user.user_id.replace(/^users\//, '');

      const response = await fetch(`/api/greg/users/${cleanUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Utilisateur supprimé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur{' '}
            <strong>{user.name}</strong> ({user.mail}) ? Cette action est
            définitive et ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 cursor-pointer"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
