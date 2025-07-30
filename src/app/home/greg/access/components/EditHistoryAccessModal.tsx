'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: {
    space_id: string;
    space_target_id: string;
    note?: string;
  };
  spaces: Array<{
    space_id: string;
    space_name: string;
  }>;
  onSuccess: () => void;
}

const formSchema = z.object({
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditHistoryAccessModal({
  open,
  onOpenChange,
  access,
  spaces,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceSpace = spaces.find(s => s.space_id === access.space_id);
  const targetSpace = spaces.find(s => s.space_id === access.space_target_id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: access.note ?? '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsSubmitting(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/greg/space-history-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          space_id: access.space_id,
          space_target_id: access.space_target_id,
          note: data.note ?? '',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      toast.success('Note mise à jour avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification de la note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la note</DialogTitle>
          <DialogDescription>
            Modifiez la note pour l&apos;accès historique entre{' '}
            {sourceSpace?.space_name ?? 'Inconnu'} et{' '}
            {targetSpace?.space_name ?? 'Inconnu'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajouter une note expliquant la raison de cet accès..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Une note pour expliquer pourquoi cet accès historique a été
                    accordé
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
                className="cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
