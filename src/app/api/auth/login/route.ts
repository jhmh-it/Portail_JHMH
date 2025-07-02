import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Vérifier le token avec Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Récupérer les custom claims (rôles)
    const userRecord = await adminAuth.getUser(decodedToken.uid);

    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      displayName: decodedToken.name ?? '',
      photoURL: decodedToken.picture ?? '',
      emailVerified: decodedToken.email_verified ?? false,
      customClaims: userRecord.customClaims ?? {},
    };

    // Créer un cookie de session sécurisé
    const cookieStore = await cookies();
    cookieStore.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { success: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}
