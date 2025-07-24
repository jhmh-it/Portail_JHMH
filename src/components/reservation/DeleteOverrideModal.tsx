import { AlertTriangle, Loader2 } from 'lucide-react';
import React from 'react';

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
import { Badge } from '@/components/ui/badge';

interface DeleteOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fieldDisplayName: string;
  overriddenValue: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteOverrideModal({
  open,
  onOpenChange,
  fieldName: _fieldName,
  fieldDisplayName,
  overriddenValue,
  onConfirm,
  isDeleting = false,
}: DeleteOverrideModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Supprimer la modification
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Êtes-vous sûr de vouloir supprimer la modification manuelle pour
              ce champ ?
            </p>

            <div className="bg-muted p-3 rounded-lg border-l-4 border-amber-500">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Champ :
                  </span>
                  <span className="font-semibold">{fieldDisplayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Valeur actuelle :
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {overriddenValue}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>⚠️ Attention :</strong> Cette action est irréversible. Le
              champ reviendra à sa valeur originale de la réservation.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
