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
        color: 'var(--toast-success)',
        border: '1px solid var(--toast-success-border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
        color: 'var(--toast-error)',
        border: '1px solid var(--toast-error-border)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    });
  },
}));
