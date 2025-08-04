import type { NextRequest } from 'next/server';

import {
  createAuthErrorResponse,
  createAuthSuccessResponse,
} from '@/lib/auth-utils';
import { handleLogin } from '@/services/auth.service';
import type { LoginRequest } from '@/types/auth';

/**
 * POST /api/auth/login
 * Authentifie un utilisateur avec Firebase ID Token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse et valide la requête
    const body: LoginRequest = await request.json();

    if (!body.idToken) {
      return createAuthErrorResponse(
        'Token manquant',
        undefined,
        undefined,
        400
      );
    }

    // Déléguer la logique au service
    const result = await handleLogin(body);

    if (result.success) {
      return createAuthSuccessResponse(result.user);
    } else {
      // Déterminer le status HTTP basé sur le code d'erreur
      let status = 401;
      if (
        result.code === 'API_UNAVAILABLE' ||
        result.code === 'AUTH_UNAVAILABLE'
      ) {
        status = 503;
      } else if (
        result.code === 'EMAIL_REQUIRED' ||
        result.code === 'DOMAIN_NOT_ALLOWED'
      ) {
        status = 403;
      }

      return createAuthErrorResponse(
        result.error,
        result.code,
        result.details,
        status
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête de login:', error);
    return createAuthErrorResponse('Erreur serveur', undefined, undefined, 500);
  }
}
