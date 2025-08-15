'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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

interface Reminder {
  id: string;
  message: string;
  user_id: string;
  source_space_id?: string;
  target_space_id: string;
  status: string;
  remind_at: string;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: string;
  name: string;
}

interface Space {
  space_id: string;
  space_name?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder;
  onSuccess: () => void;
}

const formSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
  remind_at: z.string().optional(),
  user_id: z.string().optional(),
  source_space_id: z.string().optional(),
  target_space_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditReminderModal({
  open,
  onOpenChange,
  reminder,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [openUserCombobox, setOpenUserCombobox] = useState(false);
  const [openSourceSpaceCombobox, setOpenSourceSpaceCombobox] = useState(false);
  const [openTargetSpaceCombobox, setOpenTargetSpaceCombobox] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      status: '',
      remind_at: '',
      user_id: '',
      source_space_id: '',
      target_space_id: '',
    },
  });

  // Fetch users and spaces for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('Utilisateur non connecté');
          return;
        }

        const idToken = await currentUser.getIdToken();

        // Fetch users
        const usersResponse = await fetch('/api/greg/users', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          let usersList: unknown[] = [];
          if (Array.isArray(usersData?.data)) {
            usersList = usersData.data;
          } else if (Array.isArray(usersData)) {
            usersList = usersData;
          }
          setUsers(
            usersList.filter(u => {
              const user = u as { user_id?: string; name?: string };
              return user?.user_id && user?.name;
            }) as User[]
          );
        }

        // Fetch spaces
        const spacesResponse = await fetch('/api/greg/spaces', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (spacesResponse.ok) {
          const spacesData = await spacesResponse.json();
          let spacesList: unknown[] = [];
          if (Array.isArray(spacesData?.data)) {
            spacesList = spacesData.data;
          } else if (Array.isArray(spacesData)) {
            spacesList = spacesData;
          }
          setSpaces(
            spacesList.filter(s => {
              const space = s as { space_id?: string };
              return typeof space?.space_id === 'string';
            }) as Space[]
          );
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchData();
  }, [open]);

  // Fetch reminder details
  useEffect(() => {
    const fetchReminderDetails = async () => {
      if (!open || !reminder.id) return;

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('Utilisateur non connecté');
          return;
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/greg/reminders/${reminder.id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails');
        }

        const result = await response.json();
        // Handle both formats: { data: {...} } and direct {...}
        const data = result?.data ?? result;

        // Update form with fetched data - map to API expected fields
        // Normalize IDs to include prefix if not present
        const normalizeStatus = (s: string | undefined) => {
          const v = (s ?? '').toLowerCase();
          if (v === 'done' || v === 'completed') return 'COMPLETED';
          if (v === 'cancelled' || v === 'canceled') return 'CANCELLED';
          if (v === 'in_progress' || v === 'in-progress') return 'IN_PROGRESS';
          if (v === 'pending' || v === 'todo') return 'PENDING';
          return (s ?? '').toUpperCase();
        };
        const normalizeUserId = (id: string) => {
          if (!id) return '';
          return id.startsWith('users/') ? id : `users/${id}`;
        };

        const normalizeSpaceId = (id: string) => {
          if (!id) return '';
          return id.startsWith('spaces/') ? id : `spaces/${id}`;
        };

        form.reset({
          message: data.message ?? data.description ?? data.title ?? '',
          status: normalizeStatus(data.status),
          remind_at: data.remind_at ?? data.due_date ?? '',
          user_id: normalizeUserId(data.user_id ?? data.assigned_to ?? ''),
          source_space_id: normalizeSpaceId(data.source_space_id ?? ''),
          target_space_id: normalizeSpaceId(data.target_space_id ?? ''),
        });
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la récupération des détails du rappel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderDetails();
  }, [open, reminder.id, form]);

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

      // Only send fields that have values - using API expected field names
      const updateData: {
        message?: string;
        status?: string;
        remind_at?: string;
        user_id?: string;
        source_space_id?: string;
        target_space_id?: string;
      } = {};
      if (data.message) updateData.message = data.message;
      if (data.status) updateData.status = data.status;
      if (data.remind_at) updateData.remind_at = data.remind_at;
      if (data.user_id) updateData.user_id = data.user_id;
      if (data.source_space_id)
        updateData.source_space_id = data.source_space_id;
      if (data.target_space_id)
        updateData.target_space_id = data.target_space_id;

      const response = await fetch(`/api/greg/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      toast.success('Rappel modifié avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification du rappel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le rappel</DialogTitle>
          <DialogDescription>
            Modifiez les informations du rappel
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
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remind_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de rappel</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={e =>
                        field.onChange(new Date(e.target.value).toISOString())
                      }
                    />
                  </FormControl>
                  <FormDescription>Date et heure du rappel</FormDescription>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING" className="cursor-pointer">
                        En attente
                      </SelectItem>
                      <SelectItem
                        value="IN_PROGRESS"
                        className="cursor-pointer"
                      >
                        En cours
                      </SelectItem>
                      <SelectItem value="COMPLETED" className="cursor-pointer">
                        Terminé
                      </SelectItem>
                      <SelectItem value="CANCELLED" className="cursor-pointer">
                        Annulé
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Utilisateur</FormLabel>
                  <Popover
                    open={openUserCombobox}
                    onOpenChange={setOpenUserCombobox}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openUserCombobox}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {(() => {
                            if (!field.value)
                              return 'Sélectionner un utilisateur';
                            const found = users.find(
                              user =>
                                `users/${user.user_id}` === field.value ||
                                user.user_id === field.value ||
                                `users/${user.user_id}` ===
                                  `users/${field.value}`
                            );
                            if (found?.name) return found.name;
                            return field.value.startsWith('users/')
                              ? 'Chargement...'
                              : field.value;
                          })()}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un utilisateur..." />
                        <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {users.map(user => (
                            <CommandItem
                              key={user.user_id}
                              value={user.name}
                              onSelect={() => {
                                form.setValue(
                                  'user_id',
                                  `users/${user.user_id}`
                                );
                                setOpenUserCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === `users/${user.user_id}`
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {user.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    L&apos;utilisateur responsable de ce rappel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source_space_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Espace source</FormLabel>
                    <Popover
                      open={openSourceSpaceCombobox}
                      onOpenChange={setOpenSourceSpaceCombobox}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSourceSpaceCombobox}
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {(() => {
                              if (!field.value) return 'Sélectionner un espace';
                              const match = spaces.find(
                                space =>
                                  `spaces/${space.space_id}` === field.value ||
                                  space.space_id === field.value ||
                                  `spaces/${space.space_id}` ===
                                    `spaces/${field.value}`
                              );
                              if (!match) return field.value; // fallback to ID
                              return (
                                match.space_name ?? `spaces/${match.space_id}`
                              );
                            })()}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher un espace..." />
                          <CommandEmpty>Aucun espace trouvé.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {spaces.map(space => (
                              <CommandItem
                                key={space.space_id}
                                value={space.space_name}
                                onSelect={() => {
                                  form.setValue(
                                    'source_space_id',
                                    `spaces/${space.space_id}`
                                  );
                                  setOpenSourceSpaceCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === `spaces/${space.space_id}`
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {space.space_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_space_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Espace cible</FormLabel>
                    <Popover
                      open={openTargetSpaceCombobox}
                      onOpenChange={setOpenTargetSpaceCombobox}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTargetSpaceCombobox}
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {(() => {
                              if (!field.value) return 'Sélectionner un espace';
                              const match = spaces.find(
                                space =>
                                  `spaces/${space.space_id}` === field.value ||
                                  space.space_id === field.value ||
                                  `spaces/${space.space_id}` ===
                                    `spaces/${field.value}`
                              );
                              if (!match) return field.value; // fallback to ID
                              return (
                                match.space_name ?? `spaces/${match.space_id}`
                              );
                            })()}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher un espace..." />
                          <CommandEmpty>Aucun espace trouvé.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {spaces.map(space => (
                              <CommandItem
                                key={space.space_id}
                                value={space.space_name}
                                onSelect={() => {
                                  form.setValue(
                                    'target_space_id',
                                    `spaces/${space.space_id}`
                                  );
                                  setOpenTargetSpaceCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === `spaces/${space.space_id}`
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {space.space_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                disabled={isSubmitting || isLoading}
                className="cursor-pointer"
              >
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
