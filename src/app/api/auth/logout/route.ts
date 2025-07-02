import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Supprimer le cookie de session avec attributs de sécurité
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 