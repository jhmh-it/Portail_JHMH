import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporairement indisponible',
          code: 'AUTH_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Vérifier le token de session
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie.value);

    // Récupérer les informations utilisateur avec les custom claims
    const userRecord = await adminAuth.getUser(decodedToken.uid);

    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      displayName: decodedToken.name ?? '',
      photoURL: decodedToken.picture ?? '',
      emailVerified: decodedToken.email_verified ?? false,
      customClaims: userRecord.customClaims ?? {},
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);

    // Supprimer le cookie invalide
    const cookieStore = await cookies();
    cookieStore.delete('session');

    // Vérifier si c'est une erreur d'expiration de token Firebase
    const isTokenExpired =
      (error instanceof Error &&
        error.message.includes('Firebase ID token has expired')) ||
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'auth/id-token-expired');

    if (isTokenExpired) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token expiré',
          code: 'TOKEN_EXPIRED',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Session expirée' },
      { status: 401 }
    );
  }
}
