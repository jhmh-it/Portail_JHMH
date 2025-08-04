import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware d'authentification et de redirection
 * Utilise les cookies de session pour déterminer l'état d'authentification
 */

/**
 * Routes protégées qui nécessitent une authentification
 */
const PROTECTED_ROUTES = ['/home'] as const;

/**
 * Routes publiques qui n'ont pas besoin d'authentification
 */
const PUBLIC_ROUTES = ['/login', '/signup'] as const;

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
 * Vérifie si l'utilisateur est authentifié basé sur la présence du cookie de session
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('session');
  return Boolean(sessionCookie?.value);
}

/**
 * Crée une URL de redirection vers login avec le chemin de retour
 */
function createLoginRedirectUrl(request: NextRequest, returnPath: string): URL {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', returnPath);
  return loginUrl;
}

/**
 * Crée une URL de redirection vers home
 */
function createHomeRedirectUrl(request: NextRequest): URL {
  return new URL('/home', request.url);
}

/**
 * Logge les événements de middleware de manière cohérente
 */
function logMiddlewareEvent(
  event:
    | 'redirect_to_login'
    | 'redirect_to_home'
    | 'access_granted'
    | 'redirect_root',
  pathname: string,
  authenticated: boolean
): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Middleware] ${event}: ${pathname} (auth: ${authenticated})`);
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  // Gestion de la page d'accueil
  if (pathname === '/') {
    if (authenticated) {
      logMiddlewareEvent('redirect_root', pathname, authenticated);
      return NextResponse.redirect(createHomeRedirectUrl(request));
    } else {
      logMiddlewareEvent('redirect_root', pathname, authenticated);
      return NextResponse.redirect(createLoginRedirectUrl(request, '/'));
    }
  }

  // Redirection des utilisateurs authentifiés tentant d'accéder aux pages publiques
  if (isPublicRoute(pathname) && authenticated) {
    logMiddlewareEvent('redirect_to_home', pathname, authenticated);
    return NextResponse.redirect(createHomeRedirectUrl(request));
  }

  // Protection des routes nécessitant une authentification
  if (isProtectedRoute(pathname) && !authenticated) {
    logMiddlewareEvent('redirect_to_login', pathname, authenticated);
    return NextResponse.redirect(createLoginRedirectUrl(request, pathname));
  }

  // Accès autorisé
  logMiddlewareEvent('access_granted', pathname, authenticated);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
