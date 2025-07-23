import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { checkJhmhApiHealth } from '@/lib/external-api';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * Vérifie si l'email appartient au domaine autorisé @jhmh.com
 */
function isEmailAllowed(email: string): boolean {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  // Vérifier qu'il n'y a pas juste un @ au début
  if (normalizedEmail.startsWith('@')) return false;

  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;

  // Vérifier que la partie locale n'est pas vide
  if (!localPart || localPart.length === 0) return false;

  return domain === 'jhmh.com';
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      );
    }

    // VÉRIFICATION DE LA SANTÉ DE L'API EXTERNE AVANT TOUT
    console.warn("[Auth] Vérification de la santé de l'API externe...");
    const healthCheck = await checkJhmhApiHealth();

    if (!healthCheck.success || !healthCheck.healthy) {
      console.error(
        '[Auth] API externe non disponible:',
        healthCheck.error ?? 'Status not healthy'
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Service temporairement indisponible',
          code: 'API_UNAVAILABLE',
          details: {
            message:
              "L'API externe n'est pas disponible. Veuillez réessayer plus tard.",
            apiStatus: healthCheck.healthy ? 'unhealthy' : 'unreachable',
            apiMessage: healthCheck.message ?? healthCheck.error,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    console.warn(
      "[Auth] API externe disponible, poursuite de l'authentification"
    );

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      console.error('[Auth] Firebase Admin non initialisé');
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporairement indisponible',
          code: 'AUTH_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Vérifier le token avec Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const uid = decodedToken.uid;

    // VÉRIFICATION DU DOMAINE EMAIL
    if (!email) {
      console.error('[Auth] Tentative de connexion sans email pour UID:', uid);

      // Supprimer le profil Firebase créé
      try {
        if (adminAuth) {
          await adminAuth.deleteUser(uid);
          console.warn("[Auth] Profil Firebase supprimé (pas d'email):", uid);
        }
      } catch (deleteError) {
        console.error('[Auth] Erreur suppression profil:', deleteError);
      }

      return NextResponse.json(
        {
          success: false,
          error: "Email requis pour l'authentification",
          code: 'EMAIL_REQUIRED',
        },
        { status: 403 }
      );
    }

    // Vérifier si l'email appartient au domaine @jhmh.com
    if (!isEmailAllowed(email)) {
      console.warn(
        '[Auth] Tentative de connexion domaine non autorisé:',
        email
      );

      // Supprimer le profil Firebase créé
      try {
        if (adminAuth) {
          await adminAuth.deleteUser(uid);
          console.warn(
            '[Auth] Profil Firebase supprimé (domaine non autorisé):',
            email,
            uid
          );
        }
      } catch (deleteError) {
        console.error('[Auth] Erreur suppression profil:', deleteError);
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Accès refusé. Seuls les emails @jhmh.com sont autorisés.',
          code: 'DOMAIN_NOT_ALLOWED',
          details: {
            attempted_email: email,
            allowed_domain: '@jhmh.com',
          },
        },
        { status: 403 }
      );
    }

    console.warn('[Auth] Connexion autorisée pour:', email);

    // Récupérer les custom claims (rôles) - seulement si adminAuth est disponible
    const userRecord = adminAuth ? await adminAuth.getUser(uid) : null;

    const user = {
      uid: uid,
      email: email,
      displayName: decodedToken.name ?? '',
      photoURL: decodedToken.picture ?? '',
      emailVerified: decodedToken.email_verified ?? false,
      customClaims: userRecord?.customClaims ?? {},
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

    // En cas d'erreur, essayer de nettoyer si on a des infos sur l'utilisateur
    if (error && typeof error === 'object' && 'uid' in error && adminAuth) {
      try {
        await adminAuth.deleteUser(error.uid as string);
        console.warn('[Auth] Profil Firebase nettoyé après erreur:', error.uid);
      } catch (cleanupError) {
        console.error('[Auth] Erreur nettoyage après échec:', cleanupError);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}
