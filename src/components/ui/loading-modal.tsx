'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LoadingModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

// Default values as constants for better maintainability
const DEFAULT_TITLE = 'Chargement...';
const DEFAULT_DESCRIPTION =
  'Veuillez patienter pendant le chargement des données.';

export function LoadingModal({
  open,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: LoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return for better readability
  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
    >
      {/* Overlay with subtle backdrop blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* Loading card */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg p-8 mx-4 min-w-[300px] max-w-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Spinner animation */}
          <div
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Chargement en cours"
          />

          {/* Text content */}
          <div className="space-y-2">
            <h3
              id="loading-modal-title"
              className="font-medium text-foreground"
            >
              {title}
            </h3>
            <p
              id="loading-modal-description"
              className="text-sm text-muted-foreground"
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
