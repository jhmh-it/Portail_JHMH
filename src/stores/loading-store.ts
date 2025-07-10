import { create } from 'zustand';

interface LoadingState {
  isOpen: boolean;
  title: string;
  description: string;
  showLoading: (title?: string, description?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>(set => ({
  isOpen: false,
  title: 'Chargement...',
  description: 'Veuillez patienter pendant le chargement des données.',

  showLoading: (
    title = 'Chargement...',
    description = 'Veuillez patienter pendant le chargement des données.'
  ) => {
    set({
      isOpen: true,
      title,
      description,
    });
  },

  hideLoading: () => {
    set({ isOpen: false });
  },
}));
