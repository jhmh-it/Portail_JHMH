'use client';

import { getAuth } from 'firebase/auth';
import { AlertTriangle, Loader2 } from 'lucide-react';
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

interface Shift {
  id: string;
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  spaceName: string;
  onSuccess: () => void;
}

export function DeleteShiftModal({
  open,
  onOpenChange,
  shift,
  spaceName,
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

      const response = await fetch(`/api/greg/shifts/${shift.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Shift supprimé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du shift');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="mt-4 space-y-2">
            Êtes-vous sûr de vouloir supprimer le shift{' '}
            <span className="font-semibold">&quot;{shift.content}&quot;</span>
            {spaceName ? (
              <>
                {' '}
                dans l&apos;espace{' '}
                <span className="font-semibold">{spaceName}</span>
              </>
            ) : null}
            ? Cette action est définitive et ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
