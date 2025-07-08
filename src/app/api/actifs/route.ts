import { NextResponse } from 'next/server';

export interface Actif {
  id: string;
  label: string;
  description: string;
  type: 'global' | 'property' | 'zone';
  isActive: boolean;
}

const mockActifs: Actif[] = [
  {
    id: 'global',
    label: 'Global',
    description: "Vue d'ensemble de tous les actifs",
    type: 'global',
    isActive: true,
  },
  {
    id: '14M',
    label: '14M - Résidence Montparnasse',
    description: 'Résidence située à Montparnasse, Paris 14e',
    type: 'property',
    isActive: true,
  },
  {
    id: '17C',
    label: '17C - Complexe Clichy',
    description: 'Complexe résidentiel à Clichy, Paris 17e',
    type: 'property',
    isActive: true,
  },
  {
    id: '23A',
    label: '23A - Appartements Austerlitz',
    description: "Appartements premium près de la gare d'Austerlitz",
    type: 'property',
    isActive: true,
  },
  {
    id: '45B',
    label: '45B - Villa Bercy',
    description: 'Villa de standing dans le quartier de Bercy',
    type: 'property',
    isActive: true,
  },
  {
    id: 'Z01',
    label: 'Zone Centre',
    description: 'Regroupement des actifs du centre de Paris',
    type: 'zone',
    isActive: false,
  },
];

export async function GET() {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 200));

    // Filtrer seulement les actifs actifs
    const activeActifs = mockActifs.filter(actif => actif.isActive);

    return NextResponse.json({
      success: true,
      data: activeActifs,
      meta: {
        total: activeActifs.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching actifs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Erreur lors de la récupération des actifs',
      },
      { status: 500 }
    );
  }
}
