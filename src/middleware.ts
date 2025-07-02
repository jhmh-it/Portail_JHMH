import { NextResponse, type NextRequest } from 'next/server';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Les routes publiques sont gérées par les conditions spécifiques ci-dessous

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de login
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Rediriger la page d'accueil vers le dashboard si connecté, sinon vers login
  if (pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

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
