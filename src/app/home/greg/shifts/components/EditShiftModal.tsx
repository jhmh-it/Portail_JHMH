'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

const formSchema = z.object({
  space_id: z.string().min(1, "L'espace est requis"),
  content: z.string().min(1, 'Le contenu est requis'),
  date: z.date().optional(),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
});

type FormData = z.infer<typeof formSchema>;

interface Shift {
  id: string;
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
}

interface GregSpace {
  space_id: string;
  space_name: string;
  type: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  spaces: GregSpace[];
  onSuccess: () => void;
}

export function EditShiftModal({
  open,
  onOpenChange,
  shift,
  spaces,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      space_id: '',
      content: '',
      date: undefined,
      start_time: '',
      end_time: '',
    },
  });

  useEffect(() => {
    if (open && shift) {
      try {
        // Parser les dates ISO pour extraire date et heures
        const startDate = shift.start_time ? new Date(shift.start_time) : null;
        const endDate = shift.end_time ? new Date(shift.end_time) : null;

        const response = {
          space_id: shift.space_id ?? '',
          content: shift.content ?? '',
          date: startDate ?? undefined,
          start_time: startDate ? format(startDate, 'HH:mm') : '',
          end_time: endDate ? format(endDate, 'HH:mm') : '',
        };

        form.reset(response);
      } catch (error) {
        console.error('Erreur lors du parsing des données du shift:', error);
      }
    }
  }, [open, shift, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        setIsLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      // Reconstituer les datetime ISO
      if (!data.date) {
        toast.error('La date est requise');
        setIsLoading(false);
        return;
      }

      const dateStr = format(data.date, 'yyyy-MM-dd');
      const start_time = `${dateStr}T${data.start_time}:00.000Z`;
      const end_time = `${dateStr}T${data.end_time}:00.000Z`;

      const payload = {
        space_id: data.space_id,
        content: data.content,
        start_time,
        end_time,
      };

      const response = await fetch(`/api/greg/shifts/${shift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      toast.success('Shift modifié avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification du shift');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le shift</DialogTitle>
          <DialogDescription>
            Modifiez les informations du shift ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="space_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espace</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un espace" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {spaces.map(space => (
                        <SelectItem key={space.space_id} value={space.space_id}>
                          {space.space_name}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du shift"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                            'w-full cursor-pointer pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd MMMM yyyy', { locale: fr })
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>La date du shift</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
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
                disabled={isLoading}
                className="cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
