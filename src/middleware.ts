import { NextResponse, type NextRequest } from 'next/server';

import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  REDIRECT_URLS,
  SESSION_COOKIE_NAME,
  DEBUG_MODE,
} from '@/lib/middleware/constants';

/**
 * Middleware d'authentification et de redirection
 * Gère la protection des routes et les redirections selon l'état d'authentification
 */

/**
 * Vérifie si l'utilisateur est authentifié
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  return Boolean(sessionCookie?.value);
}

/**
 * Vérifie si une route est protégée
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Crée une URL de redirection avec paramètre de retour optionnel
 */
function createRedirectUrl(
  request: NextRequest,
  target: string,
  returnPath?: string
): URL {
  const url = new URL(target, request.url);
  if (returnPath && returnPath !== '/') {
    url.searchParams.set('redirect', returnPath);
  }
  return url;
}

/**
 * Log les événements du middleware en développement
 */
function logMiddlewareEvent(
  event: string,
  pathname: string,
  authenticated: boolean
): void {
  if (DEBUG_MODE) {
    console.warn(`[Middleware] ${event}: ${pathname} (auth: ${authenticated})`);
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  // Gestion de la page d'accueil
  if (pathname === '/') {
    const redirectTo = authenticated ? REDIRECT_URLS.home : REDIRECT_URLS.login;
    logMiddlewareEvent('redirect_root', pathname, authenticated);
    return NextResponse.redirect(createRedirectUrl(request, redirectTo));
  }

  // Redirection des utilisateurs authentifiés tentant d'accéder aux pages publiques
  if (isPublicRoute(pathname) && authenticated) {
    logMiddlewareEvent('redirect_to_home', pathname, authenticated);
    return NextResponse.redirect(
      createRedirectUrl(request, REDIRECT_URLS.home)
    );
  }

  // Protection des routes nécessitant une authentification
  if (isProtectedRoute(pathname) && !authenticated) {
    logMiddlewareEvent('redirect_to_login', pathname, authenticated);
    return NextResponse.redirect(
      createRedirectUrl(request, REDIRECT_URLS.login, pathname)
    );
  }

  // Accès autorisé - Ajouter les headers de sécurité
  const response = NextResponse.next();

  // Headers de sécurité basiques
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache-Control pour les contenus authentifiés
  if (authenticated) {
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    );
  }

  logMiddlewareEvent('access_granted', pathname, authenticated);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - fichiers statiques (.png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
