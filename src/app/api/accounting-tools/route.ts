import { NextResponse } from 'next/server';

import type {
  AccountingToolAPIResponse,
  AccountingToolsApiResponse,
  AccountingToolsApiError,
} from '@/app/home/accounting/types';

/**
 * Données mock pour les outils comptables
 * TODO: Remplacer par un appel à une vraie API quand disponible
 */
const MOCK_ACCOUNTING_TOOLS: AccountingToolAPIResponse[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: "Vue d'ensemble des performances financières",
    icon: 'BarChart3',
    href: '/home/accounting/dashboard',
    category: 'analytics',
  },
];

/**
 * GET /api/accounting-tools
 * Récupère la liste des outils comptables disponibles
 */
export async function GET(): Promise<
  NextResponse<AccountingToolsApiResponse | AccountingToolsApiError>
> {
  try {
    // Simulation d'un délai réseau pour mimiser une vraie API
    await new Promise(resolve => setTimeout(resolve, 100));

    const response: AccountingToolsApiResponse = {
      success: true,
      data: MOCK_ACCOUNTING_TOOLS,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching accounting tools:', error);

    const errorResponse: AccountingToolsApiError = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch accounting tools',
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
