import { toast } from 'sonner';
import { create } from 'zustand';

interface ToastStore {
  // Actions pour les toasts d'authentification
  showAuthSuccess: (message: string) => void;
  showAuthError: (message: string) => void;
}

export const useToastStore = create<ToastStore>(() => ({
  showAuthSuccess: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: 'var(--popover)',
        color: 'var(--primary)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 8px var(--ring)',
      },
      description: 'Vous êtes maintenant connecté',
    });
  },

  showAuthError: (message: string) => {
    toast.error(message, {
      duration: 6000,
      position: 'bottom-right',
      style: {
        background: 'var(--popover)',
        color: 'var(--destructive)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px var(--ring)',
      },
    });
  },
}));
