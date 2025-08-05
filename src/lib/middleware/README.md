# Middleware d'authentification

## Vue d'ensemble

Le middleware gère l'authentification et les redirections pour l'application Next.js en vérifiant les cookies de session Firebase.

## Configuration

Les constantes de configuration sont dans `constants.ts` :

- **Routes protégées** : `/home`, `/dashboard`, `/profile`, `/settings`
- **Routes publiques** : `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Cookie de session** : `session`

## Comportement

1. **Page d'accueil (`/`)** :
   - Utilisateur authentifié → Redirige vers `/home`
   - Utilisateur non authentifié → Redirige vers `/login`

2. **Routes publiques** :
   - Utilisateur authentifié → Redirige vers `/home`
   - Utilisateur non authentifié → Accès autorisé

3. **Routes protégées** :
   - Utilisateur authentifié → Accès autorisé
   - Utilisateur non authentifié → Redirige vers `/login` avec paramètre de retour

## Headers de sécurité

Le middleware ajoute automatiquement des headers de sécurité sur toutes les réponses :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control` pour les contenus authentifiés

## Extension

Pour ajouter de nouvelles routes, modifiez les tableaux dans `constants.ts` :

```typescript
export const PROTECTED_ROUTES = [
  // ... routes existantes
  '/nouvelle-route-protegee',
];
```

## Logs

En développement, le middleware logge les événements avec le préfixe `[Middleware]`.