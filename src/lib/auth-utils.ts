import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';
import {
  ALLOWED_EMAIL_DOMAINS,
  AuthErrorCode,
  type AuthUser,
  type EmailValidationResult,
  type SessionCookieConfig,
  type CreateSessionCookieOptions,
  type SessionValidationResult,
} from '@/types/auth';

/**
 * Configuration par défaut des cookies de session
 */
const DEFAULT_SESSION_COOKIE_CONFIG: SessionCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
};

/**
 * Configuration pour la suppression des cookies
 */
const CLEAR_COOKIE_CONFIG: SessionCookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 0,
  path: '/',
};

/**
 * Vérifie si l'email appartient aux domaines autorisés
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return {
      isValid: false,
      reason: 'Email is required',
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Vérifier qu'il n'y a pas juste un @ au début
  if (normalizedEmail.startsWith('@')) {
    return {
      isValid: false,
      reason: 'Email cannot start with @',
    };
  }

  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      reason: 'Invalid email format',
    };
  }

  const [localPart, domain] = parts;

  // Vérifier que la partie locale n'est pas vide
  if (!localPart || localPart.length === 0) {
    return {
      isValid: false,
      reason: 'Email local part cannot be empty',
    };
  }

  // Vérifier le domaine
  const isAllowedDomain = ALLOWED_EMAIL_DOMAINS.includes(domain as never);
  if (!isAllowedDomain) {
    return {
      isValid: false,
      normalizedEmail,
      reason: `Domain ${domain} is not allowed`,
    };
  }

  return {
    isValid: true,
    normalizedEmail,
  };
}

/**
 * Transforme un token décodé Firebase en objet AuthUser
 */
export async function createAuthUserFromToken(
  decodedToken: Record<string, unknown>
): Promise<AuthUser> {
  // Récupérer les custom claims si Firebase Admin est disponible
  let customClaims = {};
  if (adminAuth && decodedToken.uid) {
    try {
      const userRecord = await adminAuth.getUser(decodedToken.uid as string);
      customClaims = userRecord.customClaims ?? {};
    } catch (error) {
      console.warn('Failed to fetch custom claims:', error);
    }
  }

  return {
    uid: decodedToken.uid as string,
    email: (decodedToken.email as string) ?? '',
    displayName: (decodedToken.name as string) ?? '',
    photoURL: (decodedToken.picture as string) ?? '',
    emailVerified: (decodedToken.email_verified as boolean) ?? false,
    customClaims,
  };
}

/**
 * Crée un cookie de session sécurisé
 */
export async function createSessionCookie(
  options: CreateSessionCookieOptions
): Promise<void> {
  const cookieStore = await cookies();

  const config: SessionCookieConfig = {
    ...DEFAULT_SESSION_COOKIE_CONFIG,
    maxAge: options.maxAge ?? DEFAULT_SESSION_COOKIE_CONFIG.maxAge,
    secure: options.forceSecure ?? DEFAULT_SESSION_COOKIE_CONFIG.secure,
  };

  cookieStore.set('session', options.idToken, config);
}

/**
 * Supprime le cookie de session
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('session', '', CLEAR_COOKIE_CONFIG);
}

/**
 * Valide une session à partir du cookie
 */
export async function validateSession(): Promise<SessionValidationResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return {
        isValid: false,
        errorCode: AuthErrorCode.TOKEN_INVALID,
        errorMessage: 'No session cookie found',
      };
    }

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      return {
        isValid: false,
        errorCode: AuthErrorCode.AUTH_UNAVAILABLE,
        errorMessage: 'Authentication service unavailable',
      };
    }

    // Vérifier le token de session
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie.value);

    // Créer l'objet utilisateur
    const user = await createAuthUserFromToken(decodedToken);

    return {
      isValid: true,
      user,
    };
  } catch (error) {
    console.error('Session validation error:', error);

    // Supprimer le cookie invalide
    await clearSessionCookie();

    // Vérifier si c'est une erreur d'expiration de token Firebase
    const isTokenExpired =
      (error instanceof Error &&
        error.message.includes('Firebase ID token has expired')) ||
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'auth/id-token-expired');

    if (isTokenExpired) {
      return {
        isValid: false,
        errorCode: AuthErrorCode.TOKEN_EXPIRED,
        errorMessage: 'Session expired',
      };
    }

    return {
      isValid: false,
      errorCode: AuthErrorCode.TOKEN_INVALID,
      errorMessage: 'Invalid session token',
    };
  }
}

/**
 * Supprime un utilisateur Firebase (cleanup)
 */
export async function deleteFirebaseUser(uid: string): Promise<boolean> {
  if (!adminAuth) {
    console.warn('Cannot delete Firebase user: Admin auth not available');
    return false;
  }

  try {
    await adminAuth.deleteUser(uid);
    console.warn('[Auth] Firebase profile deleted:', uid);
    return true;
  } catch (error) {
    console.error('[Auth] Error deleting Firebase profile:', error);
    return false;
  }
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createAuthErrorResponse(
  error: string,
  code?: AuthErrorCode | string,
  details?: Record<string, unknown>,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    { status }
  );
}

/**
 * Crée une réponse de succès standardisée pour l'authentification
 */
export function createAuthSuccessResponse(user: AuthUser): NextResponse {
  return NextResponse.json({
    success: true,
    user,
  });
}

/**
 * Crée une réponse de succès simple
 */
export function createSuccessResponse(data: unknown): NextResponse {
  return NextResponse.json(data);
}

/**
 * Utilitaire pour loguer les événements d'authentification de manière cohérente
 */
export function logAuthEvent(
  event:
    | 'login_attempt'
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'session_validation',
  email?: string,
  uid?: string,
  reason?: string
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event,
    email: email ? email.toLowerCase() : undefined,
    uid,
    reason,
  };

  if (event === 'login_failure' || reason) {
    console.warn('[Auth Event]', logData);
  } else {
    console.warn('[Auth Event]', logData);
  }
}
