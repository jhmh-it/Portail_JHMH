'use client';

import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useGregCategories, type Category } from '@/hooks/useGregCategories';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const { categories, isLoading, createCategory, deleteCategory, isCreating } =
    useGregCategories();

  const handleSelect = (categoryName: string) => {
    if (value.includes(categoryName)) {
      onChange(value.filter(v => v !== categoryName));
    } else {
      onChange([...value, categoryName]);
    }
  };

  const handleCreateClick = () => {
    setNewCategoryName(search);
    setNewCategoryDescription('');
    setShowCreateDialog(true);
  };

  const handleCreateConfirm = () => {
    if (newCategoryName.trim() && newCategoryDescription.trim()) {
      createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });
      setShowCreateDialog(false);
      setSearch('');
      setNewCategoryName('');
      setNewCategoryDescription('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      // Remove from selection if selected
      if (value.includes(categoryToDelete.name)) {
        onChange(value.filter(v => v !== categoryToDelete.name));
      }
      setCategoryToDelete(null);
    }
  };

  const categoryExists = categories.some(
    cat => cat.name.toLowerCase() === search.toLowerCase()
  );
  const showCreateOption = search.trim() && !categoryExists;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {(() => {
              if (value.length === 0) {
                return 'Sélectionner des catégories...';
              }
              if (value.length === 1) {
                return value[0];
              }
              return `${value.length} catégories sélectionnées`;
            })()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command className="max-h-[500px]">
            <CommandInput
              placeholder="Rechercher ou créer une catégorie..."
              value={search}
              onValueChange={setSearch}
              className="h-12"
            />
            <CommandList className="max-h-[400px]">
              {showCreateOption && (
                <CommandGroup heading="Créer">
                  <CommandItem
                    value={search}
                    onSelect={handleCreateClick}
                    disabled={isCreating}
                    className="cursor-pointer py-3"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer &quot;{search}&quot;
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandEmpty className="py-6 text-center text-sm">
                {!showCreateOption && 'Aucune catégorie trouvée.'}
              </CommandEmpty>

              {!isLoading && categories.length > 0 && (
                <CommandGroup heading="Catégories existantes">
                  {categories.map(category => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => handleSelect(category.name)}
                      className="cursor-pointer justify-between group py-3"
                    >
                      <div className="flex items-center flex-1">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value.includes(category.name)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => handleDeleteClick(e, category)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle catégorie pour organiser vos documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Ex: Finances, Marketing..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCategoryDescription}
                onChange={e => setNewCategoryDescription(e.target.value)}
                placeholder="Décrivez l'utilité de cette catégorie..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateConfirm}
              disabled={
                !newCategoryName.trim() ||
                !newCategoryDescription.trim() ||
                isCreating
              }
            >
              {isCreating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie &quot;
              {categoryToDelete?.name}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
