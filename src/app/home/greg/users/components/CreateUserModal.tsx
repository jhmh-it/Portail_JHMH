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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  mail: z.string().email("Format d'email invalide"),
  custom_instruction: z.string().optional(),
  frequence_utilisation: z.number().int().min(0).max(100).optional(),
  rn: z.number().int().optional(),
  source_prefere: z.string().optional(),
  sources: z.boolean().optional(),
  verbose: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateUserModal({ open, onOpenChange, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mail: '',
      custom_instruction: '',
      frequence_utilisation: 0,
      rn: 0,
      source_prefere: 'none',
      sources: false,
      verbose: false,
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

      // Clean up undefined values and convert "none" to empty string
      const cleanedData = { ...data };
      if (cleanedData.source_prefere === 'none') {
        cleanedData.source_prefere = '';
      }

      const payload = Object.fromEntries(
        Object.entries(cleanedData).filter(
          ([_, v]) => v !== undefined && v !== '' && v !== null
        )
      );

      const response = await fetch('/api/greg/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      toast.success('Utilisateur créé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel utilisateur au système Greg
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="custom_instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions personnalisées</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instructions spéciales pour cet utilisateur..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions ou notes spéciales pour cet utilisateur
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source_prefere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source préférée</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Sélectionner une source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="cursor-pointer">
                          Aucune
                        </SelectItem>
                        <SelectItem value="web" className="cursor-pointer">
                          Web
                        </SelectItem>
                        <SelectItem value="mobile" className="cursor-pointer">
                          Mobile
                        </SelectItem>
                        <SelectItem value="api" className="cursor-pointer">
                          API
                        </SelectItem>
                        <SelectItem value="desktop" className="cursor-pointer">
                          Desktop
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Plateforme préférée de l&apos;utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequence_utilisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fréquence d&apos;utilisation (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={e =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Pourcentage d&apos;activité (0-100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de ligne</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Numéro de référence interne</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Sources activées</FormLabel>
                      <FormDescription className="text-xs">
                        Activer les sources pour cet utilisateur
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verbose"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Mode verbose</FormLabel>
                      <FormDescription className="text-xs">
                        Activer les logs détaillés
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
                {isSubmitting ? 'Création...' : "Créer l'utilisateur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
