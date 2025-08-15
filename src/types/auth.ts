/**
 * Types pour l'authentification Firebase et sessions utilisateur
 */

/**
 * Structure d'un utilisateur authentifié
 */
export interface AuthUser {
  /** Identifiant unique Firebase */
  uid: string;
  /** Adresse email de l'utilisateur */
  email: string;
  /** Nom d'affichage de l'utilisateur */
  displayName: string;
  /** URL de la photo de profil */
  photoURL: string;
  /** Indique si l'email est vérifié */
  emailVerified: boolean;
  /** Rôles et permissions personnalisés */
  customClaims: Record<string, unknown>;
}

/**
 * Réponse standard de succès pour l'authentification
 */
export interface AuthSuccessResponse {
  /** Indicateur de succès */
  success: true;
  /** Données utilisateur */
  user: AuthUser;
}

/**
 * Réponse standard d'erreur pour l'authentification
 */
export interface AuthErrorResponse {
  /** Indicateur d'échec */
  success: false;
  /** Message d'erreur utilisateur */
  error: string;
  /** Code d'erreur spécifique */
  code?: string;
  /** Détails supplémentaires sur l'erreur */
  details?: Record<string, unknown>;
}

/**
 * Réponse unifiée pour les endpoints d'authentification
 */
export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

/**
 * Réponse standard de succès pour la déconnexion
 */
export interface LogoutSuccessResponse {
  /** Indicateur de succès */
  success: true;
  /** Message de confirmation */
  message: string;
}

/**
 * Réponse unifiée pour la déconnexion
 */
export type LogoutResponse = LogoutSuccessResponse | AuthErrorResponse;

/**
 * Données de connexion envoyées par le client
 */
export interface LoginRequest {
  /** Token ID Firebase du client */
  idToken: string;
}

/**
 * Codes d'erreur spécifiques à l'authentification
 */
export enum AuthErrorCode {
  /** Email requis pour l'authentification */
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  /** Domaine email non autorisé */
  DOMAIN_NOT_ALLOWED = 'DOMAIN_NOT_ALLOWED',
  /** Email non présent dans la liste d'autorisation temporaire */
  NOT_IN_ALLOWLIST = 'NOT_IN_ALLOWLIST',
  /** API externe non disponible */
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  /** Service d'authentification non disponible */
  AUTH_UNAVAILABLE = 'AUTH_UNAVAILABLE',
  /** Token expiré */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Token invalide */
  TOKEN_INVALID = 'TOKEN_INVALID',
}

/**
 * Configuration des cookies de session
 */
export interface SessionCookieConfig {
  /** HTTP Only pour sécurité */
  httpOnly: boolean;
  /** HTTPS uniquement en production */
  secure: boolean;
  /** Politique SameSite */
  sameSite: 'strict' | 'lax' | 'none';
  /** Durée de vie en secondes */
  maxAge: number;
  /** Chemin du cookie */
  path: string;
}

/**
 * Résultat de vérification d'email
 */
export interface EmailValidationResult {
  /** Email est valide */
  isValid: boolean;
  /** Email normalisé */
  normalizedEmail?: string;
  /** Raison du rejet si invalide */
  reason?: string;
}

/**
 * Résultat de vérification de santé API
 */
export interface ApiHealthResult {
  /** API est accessible */
  success: boolean;
  /** API est en bonne santé */
  healthy: boolean;
  /** Message de statut */
  message?: string;
  /** Message d'erreur si problème */
  error?: string;
}

/**
 * Options pour la création de cookies de session
 */
export interface CreateSessionCookieOptions {
  /** Token Firebase à stocker */
  idToken: string;
  /** Durée de vie custom (défaut: 7 jours) */
  maxAge?: number;
  /** Forcer HTTPS même en dev */
  forceSecure?: boolean;
}

/**
 * Résultat de validation de session
 */
export interface SessionValidationResult {
  /** Session est valide */
  isValid: boolean;
  /** Utilisateur authentifié si valide */
  user?: AuthUser;
  /** Code d'erreur si invalide */
  errorCode?: AuthErrorCode;
  /** Message d'erreur si invalide */
  errorMessage?: string;
}

/**
 * Domaines email autorisés
 */
export const ALLOWED_EMAIL_DOMAINS = ['jhmh.com'] as const;

/**
 * Type pour les domaines autorisés
 */
export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number];

/**
 * Liste temporaire d'emails explicitement autorisés à se connecter/créer un compte
 * Tant que le site est instable, seules ces adresses sont acceptées.
 */
export const ALLOWED_EMAILS: readonly string[] = [
  'michael@jhmh.com',
  'jonathan@jhmh.com',
  'rene@jhmh.com',
  'ethan@jhmh.com',
  'dan@jhmh.com',
  'matt@jhmh.com',
] as const;

// Types de compatibilité pour les hooks existants
/** @deprecated Utiliser AuthResponse à la place */
export type LoginResponse = AuthResponse;

/** @deprecated Utiliser AuthUser à la place */
export type User = AuthUser;
