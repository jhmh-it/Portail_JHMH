import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  error?: string;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/greg/categories');

  if (!response.ok) {
    throw new Error('Impossible de charger les catégories');
  }

  const data: CategoriesResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error ?? 'Erreur lors du chargement des catégories');
  }

  return data.data;
}

async function createCategory({
  name,
  description,
}: {
  name: string;
  description: string;
}): Promise<Category> {
  const response = await fetch('/api/greg/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Impossible de créer la catégorie');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error ?? 'Erreur lors de la création de la catégorie');
  }

  return data.data;
}

async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetch(`/api/greg/categories/${categoryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Impossible de supprimer la catégorie');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      data.error ?? 'Erreur lors de la suppression de la catégorie'
    );
  }
}

export function useGregCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['greg', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: newCategory => {
      queryClient.invalidateQueries({ queryKey: ['greg', 'categories'] });
      toast.success(`Catégorie "${newCategory.name}" créée avec succès`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greg', 'categories'] });
      toast.success('Catégorie supprimée avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
