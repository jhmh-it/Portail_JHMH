import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

import { createGregErrorResponse } from '../services/greg.service';
import type { GregErrorCode } from '../types/greg';

/**
 * Résultat de la vérification d'authentification
 */
export interface AuthResult {
  success: boolean;
  error?: GregErrorCode;
  response?: NextResponse;
}

/**
 * Vérifie l'authentification Firebase via le cookie de session
 * Fonction centralisée pour toutes les routes API Greg
 */
export async function verifyAuthentication(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return {
        success: false,
        error: 'ACCESS_DENIED',
        response: NextResponse.json(
          createGregErrorResponse('Unauthorized', 'ACCESS_DENIED'),
          { status: 401 }
        ),
      };
    }

    if (!adminAuth) {
      return {
        success: false,
        error: 'API_CONFIG_MISSING',
        response: NextResponse.json(
          createGregErrorResponse('API_CONFIG_MISSING', 'SERVICE_UNAVAILABLE'),
          { status: 503 }
        ),
      };
    }

    await adminAuth.verifyIdToken(sessionCookie.value);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'ACCESS_DENIED',
      response: NextResponse.json(
        createGregErrorResponse('Invalid session', 'ACCESS_DENIED'),
        { status: 401 }
      ),
    };
  }
}

/**
 * Wrapper pour simplifier l'utilisation dans les routes API
 */
export async function withAuthentication<T>(
  handler: () => Promise<T>
): Promise<NextResponse | T> {
  const authResult = await verifyAuthentication();

  if (!authResult.success) {
    return authResult.response as NextResponse;
  }

  return handler();
}
