'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SPACE_TYPES = [
  { value: 'ROOM', label: 'Groupe' },
  { value: 'DM', label: 'DM' },
];

const editSpaceSchema = z.object({
  space_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  type: z.string().min(1, 'Le type est requis'),
  notes: z
    .string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional(),
});

type EditSpaceFormData = z.infer<typeof editSpaceSchema>;

interface EditSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: {
    space_id: string;
    space_name: string;
    type: string;
    notes?: string;
  };
  onSuccess: () => void;
}

export function EditSpaceModal({
  open,
  onOpenChange,
  space,
  onSuccess,
}: EditSpaceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditSpaceFormData>({
    resolver: zodResolver(editSpaceSchema),
    defaultValues: {
      space_name: space.space_name,
      type: space.type,
      notes: space.notes ?? '',
    },
  });

  const onSubmit = async (data: EditSpaceFormData) => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Token non disponible');

      // Extraire l'ID sans le préfixe
      const spaceId = space.space_id.replace('spaces/', '');

      const response = await fetch(`/api/greg/spaces/${spaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier l'espace");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error("Erreur lors de la modification de l'espace");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;espace</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;espace
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="space_id">ID de l&apos;espace</Label>
              <Input
                id="space_id"
                value={space.space_id}
                disabled
                className="text-muted-foreground"
              />
              <p className="text-muted-foreground text-xs">
                L&apos;ID ne peut pas être modifié
              </p>
            </div>

            <FormField
              control={form.control}
              name="space_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;espace</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Type d&apos;espace</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
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
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ajoutez des notes sur cet espace..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Description ou informations supplémentaires
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
