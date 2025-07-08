'use client';

import { useEffect, useState } from 'react';

interface AccountingTool {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface AccountingToolAPIResponse {
  id: string;
  name: string;
  href: string;
  description: string;
  icon: string;
  category: string;
}

interface UseAccountingToolsReturn {
  accountingTools: AccountingTool[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAccountingTools(): UseAccountingToolsReturn {
  const [accountingTools, setAccountingTools] = useState<AccountingTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountingTools = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/accounting-tools');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const accountingToolsData = await response.json();

      // L'API retourne un objet avec {success, data, timestamp}
      if (
        accountingToolsData.success &&
        Array.isArray(accountingToolsData.data)
      ) {
        // Mapper les données de l'API vers le format attendu par la sidebar
        const mappedTools = accountingToolsData.data.map(
          (tool: AccountingToolAPIResponse) => ({
            id: tool.id,
            title: tool.name, // name -> title
            url: tool.href, // href -> url
            description: tool.description,
          })
        );
        setAccountingTools(mappedTools);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching accounting tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingTools();
  }, []);

  return {
    accountingTools,
    isLoading,
    error,
    refetch: fetchAccountingTools,
  };
}
