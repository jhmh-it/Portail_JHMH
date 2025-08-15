'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { useGregCategories } from '../../hooks/useGregCategories';

const formSchema = z.object({
  sheet_name: z.string().min(1, 'Le titre est requis'),
  categories: z.array(z.string()).optional(),
  sql_request: z.boolean().optional(),
  summary: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    document_id: string;
    sheet_name?: string;
    spreadsheet_name?: string;
    categories?: string;
    sql_request?: boolean;
    summary?: string;
  };
  onSuccess: () => void;
}

export function EditDocumentModal({
  open,
  onOpenChange,
  document,
  onSuccess,
}: EditDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);

  const { categories } = useGregCategories();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheet_name: '',
      categories: [],
      sql_request: false,
      summary: '',
    },
  });

  // Fetch document details when modal opens
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      if (!open || !document?.document_id) return;

      setIsLoading(true);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          toast.error('Vous devez être connecté');
          return;
        }

        const idToken = await currentUser.getIdToken();

        // Clean document ID (remove documents/ prefix if present)
        const cleanDocumentId = document.document_id.replace(
          /^documents\//,
          ''
        );

        const response = await fetch(`/api/greg/documents/${cleanDocumentId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du document');
        }

        const data = await response.json();

        // Reset form with fetched data
        form.reset({
          sheet_name: data.sheet_name ?? data.title ?? '',
          categories: (() => {
            if (Array.isArray(data.categories)) return data.categories;
            if (typeof data.categories === 'string' && data.categories) {
              return data.categories
                .split(',')
                .map((cat: string) => cat.trim())
                .filter(Boolean);
            }
            return [] as string[];
          })(),
          sql_request:
            data.sql_request === true ? true : data.sql_request === 'true',
          summary: data.summary ?? '',
        });
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger les détails du document');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [open, document?.document_id, form]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error('Vous devez être connecté pour modifier un document');
        setIsSubmitting(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      // Clean document ID (remove documents/ prefix if present)
      const cleanDocumentId = document.document_id.replace(/^documents\//, '');

      const response = await fetch(`/api/greg/documents/${cleanDocumentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          sheet_name: values.sheet_name,
          categories:
            values.categories && values.categories.length > 0
              ? values.categories
              : undefined,
          sql_request: values.sql_request === true ? 'true' : 'false',
          summary: values.summary ?? undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ?? 'Erreur lors de la modification du document'
        );
      }

      toast.success('Document modifié avec succès');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la modification du document'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le document</DialogTitle>
          <DialogDescription>
            Modifiez les informations du document. Les champs marqués d&apos;un
            astérisque sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sheet_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titre <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre du document"
                        {...field}
                        disabled={isSubmitting}
                      />
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
                            disabled={isSubmitting}
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
                            <CommandEmpty>
                              Aucune catégorie trouvée.
                            </CommandEmpty>
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
                        disabled={isSubmitting}
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
                name="sql_request"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>En attente de révision</FormLabel>
                      <FormDescription>
                        Marquer ce document comme nécessitant une révision
                        humaine
                      </FormDescription>
                    </div>
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    'Modifier le document'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
