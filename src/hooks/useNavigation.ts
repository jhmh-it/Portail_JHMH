import { useRouter } from 'next/navigation';

import { useLoadingStore } from '@/stores/loading-store';

interface NavigationOptions {
  loadingTitle?: string;
  loadingDescription?: string;
  delay?: number;
}

export function useNavigation() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingStore();

  const navigateWithLoading = async (
    href: string,
    options: NavigationOptions = {}
  ) => {
    const {
      loadingTitle = 'Chargement...',
      loadingDescription = 'Veuillez patienter pendant le chargement de la page.',
      delay = 800,
    } = options;

    showLoading(loadingTitle, loadingDescription);

    try {
      // Délai pour montrer la modale
      await new Promise(resolve => setTimeout(resolve, delay));

      // Navigation
      router.push(href);
    } catch (error) {
      hideLoading();
      console.error('Erreur lors de la navigation:', error);
      throw error;
    }
  };

  return {
    navigateWithLoading,
    hideLoading,
  };
}
