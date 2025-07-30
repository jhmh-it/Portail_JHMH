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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: {
    space_id: string;
    space_target_id: string;
  };
  sourceSpaceName: string;
  targetSpaceName: string;
  onSuccess: () => void;
}

export function DeleteHistoryAccessModal({
  open,
  onOpenChange,
  access,
  sourceSpaceName,
  targetSpaceName,
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

      const response = await fetch('/api/greg/space-history-access', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          space_id: access.space_id,
          space_target_id: access.space_target_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Accès historique supprimé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>
              Supprimer cet accès historique ?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l&apos;accès permettant à{' '}
            <strong>{sourceSpaceName}</strong> d&apos;accéder à
            l&apos;historique de <strong>{targetSpaceName}</strong> ? Cette
            action est définitive et ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 cursor-pointer"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
