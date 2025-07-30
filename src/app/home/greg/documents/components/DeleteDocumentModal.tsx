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

interface DeleteDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentData: {
    id: string;
    spreadsheet_name: string;
  };
  onSuccess?: () => void;
}

export function DeleteDocumentModal({
  open,
  onOpenChange,
  documentData,
  onSuccess,
}: DeleteDocumentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/greg/documents/${documentData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ?? 'Erreur lors de la suppression du document'
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error ?? 'Erreur lors de la suppression du document'
        );
      }

      // Succès
      toast.success('Le document a été supprimé avec succès.', {
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
      console.error('Erreur lors de la suppression du document:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la suppression du document.'
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
            <div className="text-xs text-muted-foreground font-mono">
              ID: {documentData.id}
            </div>
          </div>
          <AlertDialogDescription className="mt-4 space-y-4">
            Êtes-vous sûr de vouloir supprimer le document{' '}
            <span className="font-semibold">
              &quot;{documentData.spreadsheet_name}&quot;
            </span>{' '}
            ?
          </AlertDialogDescription>

          <div className="mt-4">
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Cette action est définitive et ne peut pas être annulée.
              </p>
            </div>
          </div>
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
