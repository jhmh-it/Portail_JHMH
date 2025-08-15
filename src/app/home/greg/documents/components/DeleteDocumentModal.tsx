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
          </div>
          <AlertDialogDescription>
            Supprimer le document « {documentData.spreadsheet_name} » ?
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
