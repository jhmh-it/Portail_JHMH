import {
  createAuthErrorResponse,
  createSuccessResponse,
} from '@/lib/auth-utils';
import { handleLogout } from '@/services/auth.service';

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant le cookie de session
 */
export async function POST() {
  try {
    const result = await handleLogout();

    if (result.success) {
      return createSuccessResponse(result);
    } else {
      return createAuthErrorResponse(result.error, undefined, undefined, 500);
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la déconnexion:', error);
    return createAuthErrorResponse('Erreur serveur', undefined, undefined, 500);
  }
}
