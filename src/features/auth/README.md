# Module d'Authentification

Ce module centralise toute la logique d'authentification Firebase pour l'application.

## Architecture

### Types (`/types/auth.ts`)

- `AuthUser` - Structure de l'utilisateur authentifié
- `AuthResponse` - Réponses standardisées des endpoints auth
- `LoginRequest` - Données de connexion
- `AuthErrorCode` - Codes d'erreur spécifiques

### Services (`/services/auth.service.ts`)

- `handleLogin()` - Traite les demandes de connexion
- `handleLogout()` - Traite les déconnexions
- `getCurrentUser()` - Récupère l'utilisateur connecté
- `requireAuth()` - Middleware pour routes protégées
- `hasPermission()` / `hasRole()` - Vérification des autorisations

### Utilitaires (`/lib/auth-utils.ts`)

- `validateEmail()` - Validation des emails autorisés
- `createSessionCookie()` / `clearSessionCookie()` - Gestion des cookies
- `validateSession()` - Validation des sessions
- `createAuthUserFromToken()` - Transformation des tokens Firebase

### Middleware (`/lib/auth-middleware.ts`)

- `withAuth()` - HOF pour protéger les routes
- `withAdminAuth()` - Middleware spécialisé admin
- `withPermission()` - Middleware avec permissions spécifiques

## Utilisation

### Routes API Protégées

```typescript
// Route simple protégée
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, context, user) => {
  return NextResponse.json({ user });
});

// Route admin uniquement
import { withAdminAuth } from '@/lib/auth-middleware';

export const DELETE = withAdminAuth(async (request, context, user) => {
  // Logique admin uniquement
});

// Route avec permissions spécifiques
import { withPermissions } from '@/lib/auth-middleware';

export const POST = withPermissions(
  ['write:documents'],
  async (request, context, user) => {
    // Logique avec permission write:documents
  }
);
```

### Validation manuelle dans les composants

```typescript
import { getCurrentUser, hasRole } from '@/services/auth.service';

// Dans une route API
const authResult = await getCurrentUser();
if (!authResult.success) {
  return NextResponse.json(authResult, { status: 401 });
}

const user = authResult.user;
if (!hasRole(user, 'admin')) {
  return NextResponse.json({ error: 'Admin required' }, { status: 403 });
}
```

## Sécurité

### Domaines Email Autorisés

Seuls les emails `@jhmh.com` sont autorisés. La validation se fait avec `validateEmail()`.

### Gestion des Sessions

- Cookies HTTP-only sécurisés
- Expiration automatique (7 jours par défaut)
- Validation côté serveur avec Firebase Admin SDK

### Custom Claims

Les rôles et permissions sont stockés dans les `customClaims` Firebase :

```json
{
  "roles": ["admin", "manager"],
  "permissions": ["read:documents", "write:documents"]
}
```

### Cleanup Automatique

En cas d'échec d'authentification (domaine non autorisé, etc.), le profil Firebase est automatiquement supprimé pour éviter l'accumulation de comptes invalides.

## API Endpoints

### POST `/api/auth/login`

Authentifie un utilisateur avec un Firebase ID Token.

**Request:**

```json
{
  "idToken": "firebase_id_token"
}
```

**Response (success):**

```json
{
  "success": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@jhmh.com",
    "displayName": "User Name",
    "customClaims": {}
  }
}
```

### POST `/api/auth/logout`

Déconnecte l'utilisateur en supprimant le cookie de session.

### GET `/api/auth/me`

Récupère les informations de l'utilisateur connecté.

## Codes d'Erreur

- `EMAIL_REQUIRED` - Email manquant
- `DOMAIN_NOT_ALLOWED` - Domaine email non autorisé
- `API_UNAVAILABLE` - API externe indisponible
- `AUTH_UNAVAILABLE` - Service d'auth indisponible
- `TOKEN_EXPIRED` - Token expiré
- `TOKEN_INVALID` - Token invalide

## Migration Notes

### Changements par rapport à l'implémentation précédente :

1. **Centralisation** : Toute la logique auth est maintenant dans des services dédiés
2. **Types stricts** : Réponses API typées et codes d'erreur standardisés
3. **Middleware réutilisable** : `withAuth()` pour protéger facilement les routes
4. **Meilleure séparation** : Utils, services et middleware dans des fichiers séparés
5. **Logging amélioré** : Events d'auth tracés de manière cohérente

### API publique préservée :

- Les endpoints `/api/auth/*` gardent la même interface
- Les réponses JSON sont identiques
- Comportement fonctionnel inchangé
