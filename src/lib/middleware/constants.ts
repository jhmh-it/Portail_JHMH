/**
 * Configuration du middleware d'authentification
 */

/**
 * Routes protégées qui nécessitent une authentification
 */
export const PROTECTED_ROUTES = [
  '/home',
  '/dashboard',
  '/profile',
  '/settings',
] as const;

/**
 * Routes publiques accessibles sans authentification
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Configuration des redirections
 */
export const REDIRECT_URLS = {
  login: '/login',
  home: '/home',
  afterLogin: '/home',
} as const;

/**
 * Nom du cookie de session
 */
export const SESSION_COOKIE_NAME = 'session';

/**
 * Mode debug (logs en développement uniquement)
 */
export const DEBUG_MODE = process.env.NODE_ENV === 'development';
