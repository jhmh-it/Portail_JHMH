import { toast } from 'sonner';
import { create } from 'zustand';

interface ToastStore {
  // Actions pour les toasts d'authentification
  showAuthSuccess: (message: string) => void;
  showAuthError: (message: string) => void;

  // Actions pour les toasts de réservation
  showReservationLoading: (message?: string, description?: string) => string;
  showReservationSuccess: (message: string, description?: string) => void;
  showReservationError: (message: string, description?: string) => void;
  showReservationInfo: (message: string, description?: string) => void;
  showReservationWarning: (message: string, description?: string) => void;
  dismissToast: (id: string) => void;
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

  // Toasts pour les réservations
  showReservationLoading: (message = 'Chargement en cours...', description) => {
    const toastId = toast.loading(message, {
      description,
    });
    return String(toastId);
  },

  showReservationSuccess: (message: string, description) => {
    toast.success(message, {
      description,
      duration: 5000,
      style: {
        color: '#16a34a', // text-green-600
        borderColor: '#16a34a',
      },
    });
  },

  showReservationError: (message: string, description) => {
    toast.error(message, {
      description,
      duration: 8000,
      style: {
        color: '#dc2626', // text-red-600
        borderColor: '#dc2626',
      },
    });
  },

  showReservationInfo: (message: string, description) => {
    toast.info(message, {
      description,
      duration: 4000,
      style: {
        color: '#2563eb', // text-blue-600
        borderColor: '#2563eb',
      },
    });
  },

  showReservationWarning: (message: string, description) => {
    toast.warning(message, {
      description,
      duration: 6000,
      style: {
        color: '#ea580c', // text-orange-600
        borderColor: '#ea580c',
      },
    });
  },

  dismissToast: (id: string) => {
    toast.dismiss(id);
  },
}));
