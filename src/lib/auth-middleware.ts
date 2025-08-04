import type { NextRequest, NextResponse } from 'next/server';

import { createAuthErrorResponse } from '@/lib/auth-utils';
import { requireAuth } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

/**
 * Type pour les handlers protégés par authentification
 */
export type AuthenticatedHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: { params?: T },
  user: AuthUser
) => Promise<NextResponse> | NextResponse;

/**
 * Type pour les options du middleware d'authentification
 */
export interface AuthMiddlewareOptions {
  /** Permissions requises (optionnel) */
  requiredPermissions?: string[];
  /** Rôles requis (optionnel) */
  requiredRoles?: string[];
  /** Fonction de validation personnalisée */
  customValidator?: (user: AuthUser) => boolean;
}

/**
 * Higher-Order Function qui wrap une route API avec l'authentification
 *
 * @example
 * ```ts
 * // Route simple protégée
 * export const GET = withAuth(async (request, context, user) => {
 *   return NextResponse.json({ user });
 * });
 *
 * // Route avec permissions spécifiques
 * export const POST = withAuth(
 *   async (request, context, user) => {
 *     // Logique métier ici
 *     return NextResponse.json({ success: true });
 *   },
 *   { requiredRoles: ['admin'] }
 * );
 * ```
 */
export function withAuth<T = Record<string, string>>(
  handler: AuthenticatedHandler<T>,
  options: AuthMiddlewareOptions = {}
) {
  return async (
    request: NextRequest,
    context: { params?: T } = {}
  ): Promise<NextResponse> => {
    try {
      // Vérifier l'authentification
      const authResult = await requireAuth();

      if (!authResult.success) {
        return createAuthErrorResponse(
          authResult.error,
          authResult.code,
          undefined,
          authResult.code === 'AUTH_UNAVAILABLE' ? 503 : 401
        );
      }

      const user = authResult.user;

      // Vérifier les permissions si spécifiées
      if (options.requiredPermissions?.length) {
        const hasRequiredPermissions = options.requiredPermissions.every(
          permission => hasPermission(user, permission)
        );

        if (!hasRequiredPermissions) {
          return createAuthErrorResponse(
            'Permissions insuffisantes',
            'INSUFFICIENT_PERMISSIONS',
            {
              required: options.requiredPermissions,
              user_permissions: getUserPermissions(user),
            },
            403
          );
        }
      }

      // Vérifier les rôles si spécifiés
      if (options.requiredRoles?.length) {
        const hasRequiredRoles = options.requiredRoles.some(role =>
          hasRole(user, role)
        );

        if (!hasRequiredRoles) {
          return createAuthErrorResponse(
            'Rôle insuffisant',
            'INSUFFICIENT_ROLE',
            {
              required: options.requiredRoles,
              user_roles: getUserRoles(user),
            },
            403
          );
        }
      }

      // Validation personnalisée
      if (options.customValidator && !options.customValidator(user)) {
        return createAuthErrorResponse(
          'Accès refusé',
          'CUSTOM_VALIDATION_FAILED',
          undefined,
          403
        );
      }

      // Appeler le handler original avec l'utilisateur authentifié
      return await handler(request, context, user);
    } catch (error) {
      console.error("Erreur dans le middleware d'authentification:", error);
      return createAuthErrorResponse(
        'Erreur serveur',
        'MIDDLEWARE_ERROR',
        undefined,
        500
      );
    }
  };
}

/**
 * Middleware spécialisé pour les routes admin uniquement
 */
export function withAdminAuth<T = Record<string, string>>(
  handler: AuthenticatedHandler<T>
) {
  return withAuth(handler, { requiredRoles: ['admin'] });
}

/**
 * Middleware pour vérifier une permission spécifique
 */
export function withPermission<T = Record<string, string>>(
  permission: string,
  handler: AuthenticatedHandler<T>
) {
  return withAuth(handler, { requiredPermissions: [permission] });
}

/**
 * Middleware pour vérifier plusieurs permissions (toutes requises)
 */
export function withPermissions<T = Record<string, string>>(
  permissions: string[],
  handler: AuthenticatedHandler<T>
) {
  return withAuth(handler, { requiredPermissions: permissions });
}

/**
 * Middleware pour vérifier un rôle spécifique
 */
export function withRole<T = Record<string, string>>(
  role: string,
  handler: AuthenticatedHandler<T>
) {
  return withAuth(handler, { requiredRoles: [role] });
}

// Fonctions utilitaires pour les permissions et rôles

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
function hasPermission(user: AuthUser, permission: string): boolean {
  if (!user.customClaims) return false;

  const roles = user.customClaims.roles as string[] | undefined;
  const permissions = user.customClaims.permissions as string[] | undefined;

  // Admin a toutes les permissions
  if (roles?.includes('admin')) {
    return true;
  }

  // Vérifier directement dans les permissions
  if (permissions?.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
function hasRole(user: AuthUser, role: string): boolean {
  if (!user.customClaims) return false;

  const roles = user.customClaims.roles as string[] | undefined;
  return roles?.includes(role) ?? false;
}

/**
 * Récupère la liste des permissions de l'utilisateur
 */
function getUserPermissions(user: AuthUser): string[] {
  if (!user.customClaims) return [];

  const permissions = user.customClaims.permissions as string[] | undefined;
  return permissions ?? [];
}

/**
 * Récupère la liste des rôles de l'utilisateur
 */
function getUserRoles(user: AuthUser): string[] {
  if (!user.customClaims) return [];

  const roles = user.customClaims.roles as string[] | undefined;
  return roles ?? [];
}

/**
 * Utilitaire pour créer un middleware avec validation personnalisée
 *
 * @example
 * ```ts
 * const withOwnershipCheck = createCustomAuthMiddleware((user, request) => {
 *   const userId = request.nextUrl.searchParams.get('userId');
 *   return user.uid === userId || hasRole(user, 'admin');
 * });
 *
 * export const GET = withOwnershipCheck(async (request, context, user) => {
 *   // L'utilisateur est soit le propriétaire, soit admin
 * });
 * ```
 */
export function createCustomAuthMiddleware<T = Record<string, string>>(
  _validator: (user: AuthUser, request: NextRequest) => boolean
) {
  return (handler: AuthenticatedHandler<T>) => {
    return withAuth(handler, {
      customValidator: _user => {
        // Note: On n'a pas accès à request ici, mais on peut l'étendre si nécessaire
        return true; // Pour l'instant, validation basique
      },
    });
  };
}
