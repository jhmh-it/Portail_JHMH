'use client';

import { LoadingModal } from '@/components/ui/loading-modal';
import { useLoadingStore } from '@/stores/loading-store';

export function LoadingProvider() {
  const { isOpen, title, description } = useLoadingStore();

  return <LoadingModal open={isOpen} title={title} description={description} />;
}
