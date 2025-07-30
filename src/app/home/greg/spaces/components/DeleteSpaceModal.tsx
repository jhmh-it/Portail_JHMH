'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
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

interface DeleteSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceData: {
    space_id: string;
    space_name: string;
  };
  onSuccess?: () => void;
}

export function DeleteSpaceModal({
  open,
  onOpenChange,
  spaceData,
  onSuccess,
}: DeleteSpaceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/greg/spaces/${spaceData.space_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ?? "Erreur lors de la suppression de l'espace"
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error ?? "Erreur lors de la suppression de l'espace"
        );
      }

      // Succès
      toast.success("L'espace a été supprimé avec succès.", {
        style: {
          color: '#16a34a', // text-green-600
          borderColor: '#16a34a',
        },
      });

      // Fermer la modale
      onOpenChange(false);

      // Callback de succès (pour rafraîchir la liste)
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'espace:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression de l'espace."
      );
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
          <AlertDialogDescription className="mt-4 space-y-4">
            Êtes-vous sûr de vouloir supprimer l&apos;espace{' '}
            <span className="font-semibold">
              &quot;{spaceData.space_name}&quot;
            </span>{' '}
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
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
