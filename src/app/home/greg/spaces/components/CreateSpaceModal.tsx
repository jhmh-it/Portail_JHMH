'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Schema de validation Zod
const createSpaceSchema = z.object({
  space_name: z
    .string()
    .min(1, "Le nom de l'espace est requis")
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  space_id: z
    .string()
    .min(1, "L'ID de l'espace est requis")
    .regex(
      /^spaces\/[a-zA-Z0-9]{11}$/,
      "L'ID doit suivre le format: spaces/ suivi de 11 caractères alphanumériques"
    ),
  type: z.string().min(1, "Le type d'espace est requis"),
  notes: z
    .string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
});

type CreateSpaceFormData = z.infer<typeof createSpaceSchema>;

interface CreateSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    space_id: string;
    space_name: string;
    type: string;
    notes?: string;
  };
  mode?: 'create' | 'edit';
}

const SPACE_TYPES = [
  { value: 'ROOM', label: 'Groupe' },
  { value: 'DM', label: 'DM' },
];

export function CreateSpaceModal({
  open,
  onOpenChange,
  onSuccess,
  editData,
  mode = 'create',
}: CreateSpaceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSpaceFormData>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      space_name: editData?.space_name ?? '',
      space_id: editData?.space_id ?? '',
      type: editData?.type ?? 'ROOM',
      notes: editData?.notes ?? '',
    },
  });

  const onSubmit = async (data: CreateSpaceFormData) => {
    setIsSubmitting(true);

    try {
      // Appel à l'API pour créer ou modifier l'espace
      const isEdit = mode === 'edit';
      const url = isEdit
        ? `/api/greg/spaces/${editData?.space_id}`
        : '/api/greg/spaces';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ??
            `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de l\'espace`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error ??
            `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de l\'espace`
        );
      }

      // Succès
      toast.success(
        `L\'espace a été ${isEdit ? 'modifié' : 'créé'} avec succès.`,
        {
          style: {
            color: '#16a34a', // text-green-600
            borderColor: '#16a34a',
          },
        }
      );

      // Réinitialiser le formulaire
      form.reset();

      // Fermer la modale
      onOpenChange(false);

      // Callback de succès (pour rafraîchir la liste)
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la création de l'espace:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : `Une erreur est survenue lors de ${mode === 'edit' ? 'la modification' : 'la création'} de l\'espace.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? "Modifier l'espace" : 'Créer un nouvel espace'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Modifiez les informations de cet espace.'
              : 'Ajoutez un nouvel espace à votre système de gestion Greg.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="space_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;espace *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Salle de conférence A"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="space_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de l&apos;espace *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: spaces/AAAAH3GGmH4"
                      {...field}
                      disabled={isSubmitting || mode === 'edit'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d&apos;espace *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPACE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes additionnelles (optionnel)"
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Modification...' : 'Création...'}
                  </>
                )}
                {!isSubmitting && mode === 'edit' && "Modifier l'espace"}
                {!isSubmitting && mode !== 'edit' && "Créer l'espace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
