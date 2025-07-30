'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';
import { FileText, History } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useGregDocuments, useGregSpaces } from '@/hooks/useGregApi';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessType: string;
}

const documentAccessSchema = z.object({
  space_id: z.string().min(1, 'Veuillez sélectionner un espace'),
  document_id: z.string().min(1, 'Veuillez sélectionner un document'),
});

const historyAccessSchema = z.object({
  space_id: z.string().min(1, 'Veuillez sélectionner un espace demandeur'),
  space_target_id: z.string().min(1, 'Veuillez sélectionner un espace cible'),
  note: z.string().optional(),
});

type DocumentAccessFormData = z.infer<typeof documentAccessSchema>;
type HistoryAccessFormData = z.infer<typeof historyAccessSchema>;

export function CreateAccessModal({ open, onOpenChange, accessType }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(accessType);

  // Fetch documents and spaces
  const { data: documentsData } = useGregDocuments({ page: 1, page_size: 100 });
  const { data: spacesData } = useGregSpaces({ page: 1, page_size: 100 });

  const documentForm = useForm<DocumentAccessFormData>({
    resolver: zodResolver(documentAccessSchema),
    defaultValues: {
      space_id: '',
      document_id: '',
    },
  });

  const historyForm = useForm<HistoryAccessFormData>({
    resolver: zodResolver(historyAccessSchema),
    defaultValues: {
      space_id: '',
      space_target_id: '',
      note: '',
    },
  });

  const handleDocumentAccessSubmit = async (data: DocumentAccessFormData) => {
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

      const response = await fetch('/api/greg/space-document-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      toast.success('Accès créé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      documentForm.reset();
      onOpenChange(false);
      // Force page refresh to show new access
      window.location.reload();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l&apos;accès');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistoryAccessSubmit = async (data: HistoryAccessFormData) => {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      toast.success('Accès historique créé avec succès', {
        style: { color: 'green' },
        icon: '✓',
      });

      historyForm.reset();
      onOpenChange(false);
      // Force page refresh to show new access
      window.location.reload();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l&apos;accès historique');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel accès</DialogTitle>
          <DialogDescription>
            Définissez les permissions d&apos;accès entre espaces et documents
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 gap-3 mb-6 bg-gray-100 p-1">
            <TabsTrigger
              value="document-access"
              className="gap-2 hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger
              value="history-access"
              className="gap-2 hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document-access" className="mt-4">
            <Form {...documentForm}>
              <form
                onSubmit={documentForm.handleSubmit(handleDocumentAccessSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={documentForm.control}
                  name="document_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un document" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentsData?.data?.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.spreadsheet_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le document auquel l&apos;espace aura accès
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={documentForm.control}
                  name="space_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espace</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un espace" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {spacesData?.data?.map(space => (
                            <SelectItem
                              key={space.space_id}
                              value={space.space_id}
                            >
                              {space.space_name} (
                              {space.type === 'ROOM' ? 'Groupe' : 'DM'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        L&apos;espace qui aura accès au document
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
                    className="cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    {isSubmitting ? 'Création...' : "Créer l'accès"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="history-access" className="mt-4">
            <Form {...historyForm}>
              <form
                onSubmit={historyForm.handleSubmit(handleHistoryAccessSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={historyForm.control}
                  name="space_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espace demandeur</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'espace demandeur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {spacesData?.data?.map(space => (
                            <SelectItem
                              key={space.space_id}
                              value={space.space_id}
                            >
                              {space.space_name} (
                              {space.type === 'ROOM' ? 'Groupe' : 'DM'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        L&apos;espace qui pourra accéder à l&apos;historique
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={historyForm.control}
                  name="space_target_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espace cible</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'espace cible" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {spacesData?.data
                            ?.filter(
                              space =>
                                space.space_id !== historyForm.watch('space_id')
                            )
                            .map(space => (
                              <SelectItem
                                key={space.space_id}
                                value={space.space_id}
                              >
                                {space.space_name} (
                                {space.type === 'ROOM' ? 'Groupe' : 'DM'})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        L&apos;espace dont l&apos;historique sera accessible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={historyForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optionnelle)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajouter une note sur cet accès..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Une note pour expliquer la raison de cet accès
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
                    className="cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    {isSubmitting ? 'Création...' : 'Créer l&apos;accès'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
