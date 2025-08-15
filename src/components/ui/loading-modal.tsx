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
      <div className="bg-background border-border relative mx-4 max-w-sm min-w-[300px] rounded-lg border p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Spinner animation */}
          <div
            className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            role="status"
            aria-label="Chargement en cours"
          />

          {/* Text content */}
          <div className="space-y-2">
            <h3
              id="loading-modal-title"
              className="text-foreground font-medium"
            >
              {title}
            </h3>
            <p
              id="loading-modal-description"
              className="text-muted-foreground text-sm"
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
