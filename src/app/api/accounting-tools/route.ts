import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulation d'une API avec données mock
    const accountingTools = [
      {
        id: 'dashboard',
        name: 'Tableau de bord',
        description: "Vue d'ensemble des performances financières",
        icon: 'BarChart3',
        href: '/dashboard/accounting/dashboard',
        category: 'analytics',
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Analyses détaillées et rapports financiers',
        icon: 'TrendingUp',
        href: '/dashboard/accounting/analytics',
        category: 'analytics',
      },
      {
        id: 'booking',
        name: 'Booking',
        description: 'Gestion des réservations et calendrier',
        icon: 'Calendar',
        href: '/dashboard/accounting/booking',
        category: 'management',
      },
    ];

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: accountingTools,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching accounting tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accounting tools',
      },
      { status: 500 }
    );
  }
}
