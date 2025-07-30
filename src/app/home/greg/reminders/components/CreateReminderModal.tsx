'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: Array<{
    space_id: string;
    space_name: string;
    type: string;
  }>;
  currentUserId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  message: z.string().min(1, 'Le message est requis'),
  target_space_id: z.string().min(1, "L'espace cible est requis"),
  source_space_id: z.string().optional(),
  status: z.string().min(1, 'Le statut est requis'),
  date: z.date({
    required_error: 'La date est requise',
  }),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format invalide (HH:MM)'),
});

type FormData = z.infer<typeof formSchema>;

export function CreateReminderModal({
  open,
  onOpenChange,
  spaces,
  currentUserId,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      target_space_id: '',
      source_space_id: '',
      status: 'PENDING',
      time: '09:00',
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

      const dateStr = format(data.date, 'yyyy-MM-dd');
      const remind_at = `${dateStr}T${data.time}:00.000Z`;

      const payload: {
        message: string;
        user_id: string;
        target_space_id: string;
        status: string;
        remind_at: string;
        source_space_id?: string;
      } = {
        message: data.message,
        user_id: currentUserId,
        target_space_id: data.target_space_id,
        status: data.status,
        remind_at,
      };

      if (data.source_space_id) {
        payload.source_space_id = data.source_space_id;
      }

      const response = await fetch('/api/greg/reminders', {
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

      toast.success('Rappel créé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du rappel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau rappel</DialogTitle>
          <DialogDescription>
            Configurez un rappel pour vous ou votre équipe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Message du rappel..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Le message qui sera affiché dans le rappel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_space_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espace cible</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Sélectionner l'espace cible" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {spaces.map(space => (
                        <SelectItem
                          key={space.space_id}
                          value={space.space_id}
                          className="cursor-pointer"
                        >
                          {space.space_name} (
                          {space.type === 'ROOM' ? 'Groupe' : 'DM'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    L&apos;espace où le rappel sera affiché
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_space_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espace source (optionnel)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Sélectionner l'espace source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="" className="cursor-pointer">
                        Aucun
                      </SelectItem>
                      {spaces.map(space => (
                        <SelectItem
                          key={space.space_id}
                          value={space.space_id}
                          className="cursor-pointer"
                        >
                          {space.space_name} (
                          {space.type === 'ROOM' ? 'Groupe' : 'DM'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    L&apos;espace d&apos;origine du rappel (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING" className="cursor-pointer">
                        En attente
                      </SelectItem>
                      <SelectItem value="COMPLETED" className="cursor-pointer">
                        Terminé
                      </SelectItem>
                      <SelectItem value="CANCELLED" className="cursor-pointer">
                        Annulé
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Le statut initial du rappel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal cursor-pointer',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd MMMM yyyy')
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
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
                {isSubmitting ? 'Création...' : 'Créer le rappel'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
