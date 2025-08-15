import { checkJhmhApiHealth } from '@/app/home/greg/services/health.service';
import {
  validateEmail,
  createAuthUserFromToken,
  createSessionCookie,
  clearSessionCookie,
  validateSession,
  deleteFirebaseUser,
  logAuthEvent,
} from '@/lib/auth-utils';
import { adminAuth } from '@/lib/firebase-admin';
import {
  AuthErrorCode,
  type LoginRequest,
  type AuthResponse,
  type LogoutResponse,
  type ApiHealthResult,
  type SessionValidationResult,
} from '@/types/auth';

/**
 * Service d'authentification centralisé
 * Gère toute la logique métier d'authentification
 */

/**
 * Vérifie que les services requis sont disponibles
 */
async function validateServices(): Promise<{
  isValid: boolean;
  error?: string;
  code?: AuthErrorCode;
}> {
  // Vérifier l'API externe d'abord
  logAuthEvent('login_attempt');
  console.warn("[Auth] Vérification de la santé de l'API externe...");

  const healthCheck: ApiHealthResult = await checkJhmhApiHealth();

  if (!healthCheck.success || !healthCheck.healthy) {
    console.error(
      '[Auth] API externe non disponible:',
      healthCheck.error ?? 'Status not healthy'
    );

    return {
      isValid: false,
      error: 'Service temporairement indisponible',
      code: AuthErrorCode.API_UNAVAILABLE,
    };
  }

  console.warn(
    "[Auth] API externe disponible, poursuite de l'authentification"
  );

  // Vérifier Firebase Admin
  if (!adminAuth) {
    console.error('[Auth] Firebase Admin non initialisé');
    return {
      isValid: false,
      error: 'Service temporairement indisponible',
      code: AuthErrorCode.AUTH_UNAVAILABLE,
    };
  }

  return { isValid: true };
}

/**
 * Traite une demande de connexion
 */
export async function handleLogin(
  request: LoginRequest
): Promise<AuthResponse> {
  try {
    // Validation des services
    const serviceValidation = await validateServices();
    if (!serviceValidation.isValid) {
      return {
        success: false,
        error: serviceValidation.error ?? 'Service validation failed',
        code: serviceValidation.code,
        ...(serviceValidation.code === AuthErrorCode.API_UNAVAILABLE && {
          details: {
            message:
              "L'API externe n'est pas disponible. Veuillez réessayer plus tard.",
            apiStatus: 'unreachable',
          },
        }),
      };
    }

    const { idToken } = request;

    if (!idToken) {
      logAuthEvent('login_failure', undefined, undefined, 'Missing token');
      return {
        success: false,
        error: 'Token manquant',
      };
    }

    // Vérifier le token avec Firebase Admin SDK
    if (!adminAuth) {
      throw new Error('Firebase Admin not initialized');
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const uid = decodedToken.uid;

    // Validation de l'email
    if (!email) {
      console.error('[Auth] Tentative de connexion sans email pour UID:', uid);
      logAuthEvent('login_failure', undefined, uid, 'No email');

      // Cleanup
      await deleteFirebaseUser(uid);

      return {
        success: false,
        error: "Email requis pour l'authentification",
        code: AuthErrorCode.EMAIL_REQUIRED,
      };
    }

    // Validation stricte: domaine + allowlist temporaire
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.warn('[Auth] Tentative de connexion refusée:', email);
      logAuthEvent('login_failure', email, uid, emailValidation.reason);

      // Cleanup
      await deleteFirebaseUser(uid);

      return {
        success: false,
        error:
          'Accès temporairement restreint. Seules certaines adresses @jhmh.com sont autorisées.',
        code:
          emailValidation.reason === 'Email not in temporary allowlist'
            ? AuthErrorCode.NOT_IN_ALLOWLIST
            : AuthErrorCode.DOMAIN_NOT_ALLOWED,
        details: {
          attempted_email: email,
          allowed_domain: '@jhmh.com',
          policy: 'allowlist-temporarie',
        },
      };
    }

    console.warn('[Auth] Connexion autorisée pour:', email);
    logAuthEvent('login_success', email, uid);

    // Créer l'objet utilisateur
    const user = await createAuthUserFromToken(
      decodedToken as Record<string, unknown>
    );

    // Créer le cookie de session
    await createSessionCookie({ idToken });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);

    // Cleanup en cas d'erreur
    if (error && typeof error === 'object' && 'uid' in error) {
      const uid = error.uid as string;
      logAuthEvent(
        'login_failure',
        undefined,
        uid,
        'Token verification failed'
      );
      await deleteFirebaseUser(uid);
    } else {
      logAuthEvent('login_failure', undefined, undefined, 'Unknown error');
    }

    return {
      success: false,
      error: 'Token invalide',
    };
  }
}

/**
 * Traite une demande de déconnexion
 */
export async function handleLogout(): Promise<LogoutResponse> {
  try {
    logAuthEvent('logout');
    await clearSessionCookie();

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return {
      success: false,
      error: 'Erreur lors de la déconnexion',
    };
  }
}

/**
 * Récupère les informations de l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    logAuthEvent('session_validation');
    const validation: SessionValidationResult = await validateSession();

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errorMessage ?? 'Session invalide',
        code: validation.errorCode,
      };
    }

    if (!validation.user) {
      throw new Error('User validation succeeded but no user returned');
    }

    return {
      success: true,
      user: validation.user,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return {
      success: false,
      error: 'Erreur serveur',
    };
  }
}

/**
 * Utilitaire pour créer un middleware d'authentification
 * À utiliser dans les routes protégées
 */
export async function requireAuth(): Promise<AuthResponse> {
  const userResponse = await getCurrentUser();

  if (!userResponse.success) {
    // Le cookie a déjà été nettoyé par validateSession
    return userResponse;
  }

  return userResponse;
}

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * Basé sur les custom claims Firebase
 */
export function hasPermission(
  user: { customClaims: Record<string, unknown> },
  permission: string
): boolean {
  if (!user.customClaims) return false;

  // Logique de permissions basée sur les custom claims
  // Peut être étendue selon les besoins
  const roles = user.customClaims.roles as string[] | undefined;
  const permissions = user.customClaims.permissions as string[] | undefined;

  // Vérifier directement dans les permissions
  if (permissions?.includes(permission)) {
    return true;
  }

  // Vérifier les rôles (admin a toutes les permissions)
  if (roles?.includes('admin')) {
    return true;
  }

  return false;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(
  user: { customClaims: Record<string, unknown> },
  role: string
): boolean {
  if (!user.customClaims) return false;

  const roles = user.customClaims.roles as string[] | undefined;
  return roles?.includes(role) ?? false;
}
