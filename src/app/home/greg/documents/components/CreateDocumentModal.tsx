'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { useGregCategories } from '../../hooks/useGregCategories';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  categories: z.array(z.string()).optional(),
  summary: z.string().optional(),
  is_pending_review: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateDocumentModal({ open, onOpenChange, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);

  const { categories } = useGregCategories();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categories: [],
      summary: '',
      is_pending_review: false,
    },
  });

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

      const response = await fetch('/api/greg/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          sheet_name: data.title,
          categories:
            data.categories && data.categories.length > 0
              ? data.categories
              : undefined,
          summary: data.summary ?? undefined,
          sql_request: data.is_pending_review ? 'true' : 'false',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      toast.success('Document créé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau document</DialogTitle>
          <DialogDescription>
            Créez un nouveau document dans Greg. Vous pourrez modifier ces
            informations plus tard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du document" {...field} />
                  </FormControl>
                  <FormDescription>
                    Un titre descriptif pour votre document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Catégories</FormLabel>
                  <Popover
                    open={openCategoryPopover}
                    onOpenChange={setOpenCategoryPopover}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCategoryPopover}
                          className={cn(
                            'w-full justify-between',
                            !field.value?.length && 'text-muted-foreground'
                          )}
                          disabled={isLoading}
                        >
                          {field.value?.length
                            ? `${field.value.length} catégorie${field.value.length > 1 ? 's' : ''} sélectionnée${field.value.length > 1 ? 's' : ''}`
                            : 'Sélectionner des catégories'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher une catégorie..." />
                        <CommandList>
                          <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                          <CommandGroup>
                            {categories.map(category => (
                              <CommandItem
                                key={category.name}
                                value={category.name}
                                onSelect={() => {
                                  const currentValues = field.value ?? [];
                                  const newValues = currentValues.includes(
                                    category.name
                                  )
                                    ? currentValues.filter(
                                        v => v !== category.name
                                      )
                                    : [...currentValues, category.name];
                                  field.onChange(newValues);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value?.includes(category.name)
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.value && field.value.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.value.map(cat => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>
                    Sélectionnez une ou plusieurs catégories pour ce document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Résumé du document..."
                      className="min-h-[80px] resize-y"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Un bref résumé du contenu du document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_pending_review"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      En attente de révision
                    </FormLabel>
                    <FormDescription>
                      Marquer ce document comme nécessitant une révision humaine
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
                {isLoading ? 'Création...' : 'Créer le document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
