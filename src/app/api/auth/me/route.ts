import {
  createAuthErrorResponse,
  createAuthSuccessResponse,
} from '@/lib/auth-utils';
import { getCurrentUser } from '@/services/auth.service';

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté
 */
export async function GET() {
  try {
    const result = await getCurrentUser();

    if (result.success) {
      return createAuthSuccessResponse(result.user);
    } else {
      // Déterminer le status HTTP basé sur le code d'erreur
      let status = 401;
      if (result.code === 'AUTH_UNAVAILABLE') {
        status = 503;
      }

      return createAuthErrorResponse(
        result.error,
        result.code,
        undefined,
        status
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête me:', error);
    return createAuthErrorResponse('Erreur serveur', undefined, undefined, 500);
  }
}
