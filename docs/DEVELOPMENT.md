# 🚀 Guide de Développement

## 📋 Processus de développement

### 1. Planification de la feature

Avant de coder, toujours :

1. **Définir clairement** le besoin et les critères d'acceptation
2. **Vérifier l'existant** : Y a-t-il déjà du code similaire ?
3. **Concevoir l'architecture** : Quels composants, hooks, API routes ?
4. **Identifier les impacts** : Sécurité, performance, UX

### 2. Setup de l'environnement

```bash
# 1. Cloner et installer
git clone [repo-url]
cd portail_jhmh
npm install

# 2. Configuration environnement
touch .env.local
# Éditer .env.local avec les bonnes valeurs (voir docs/ENVIRONMENT.md)

# 3. Lancer le dev server
npm run dev
```

### 3. Workflow Git

```bash
# 1. Créer une branche feature
git checkout -b feat/nom-de-la-feature

# 2. Développer avec des commits atomiques
git add .
git commit -m "feat: description claire"

# 3. Push et créer une PR
git push origin feat/nom-de-la-feature
```

## 🔄 Cycle de développement d'une feature

### Phase 1 : Analyse et Design

```markdown
□ Comprendre le besoin utilisateur □ Définir les user stories □ Créer les
maquettes/wireframes si nécessaire □ Identifier les composants à créer/modifier
□ Planifier la structure des données
```

### Phase 2 : Implementation

```markdown
□ Créer la branche Git □ Implémenter en suivant l'ordre :

1. Types/Interfaces TypeScript
2. Composants UI (mobile-first)
3. Logique métier (hooks/stores)
4. Intégration API
5. Tests manuels □ Commiter régulièrement (commits atomiques)
```

### Phase 3 : Qualité et Tests

```markdown
□ Vérifier le responsive (mobile, tablet, desktop) □ Tester les cas d'erreur □
Vérifier l'accessibilité (keyboard nav, screen reader) □ Lancer les commandes de
qualité :

- npm run lint:fix
- npm run type-check
- npm run build □ Revoir son propre code
```

### Phase 4 : Review et Merge

```markdown
□ Créer la Pull Request avec description détaillée □ S'assurer que la CI passe
(GitHub Actions) □ Demander une review □ Corriger les feedbacks □ Merger une
fois approuvé
```

## 🛠️ Commandes essentielles

```bash
# Développement
npm run dev              # Serveur de développement (http://localhost:3000)

# Qualité du code
npm run lint             # Vérifier les erreurs de linting
npm run lint:fix         # Corriger automatiquement
npm run format           # Formater avec Prettier
npm run format:check     # Vérifier le formatage
npm run type-check       # Vérifier les types TypeScript

# Build et production
npm run build            # Build de production
npm run start            # Lancer la version production

# Git hooks (automatique)
npm run pre-commit       # Lancé automatiquement avant commit
```

## 📁 Organisation du code

### Créer un nouveau composant

```bash
# Structure recommandée pour un composant
src/components/user/
├── UserCard.tsx         # Composant principal
├── UserCardSkeleton.tsx # Loading state
├── index.ts            # Barrel export
└── types.ts           # Types spécifiques
```

### Créer un nouveau hook

```typescript
// src/hooks/useCustomHook.ts
import { useState, useEffect } from 'react';

export function useCustomHook(param: string) {
  // Logique du hook
  return { data, loading, error };
}
```

### Créer une route API

```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  // Validation schema
});

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getAuthenticatedUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Validation
    const body = await request.json();
    const data = schema.parse(body);

    // 3. Business logic

    // 4. Response
    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling
  }
}
```

## 🐛 Debugging

### Outils recommandés

1. **React DevTools** : Inspector les composants React
2. **Redux DevTools** : Pour TanStack Query cache
3. **Network Tab** : Analyser les requêtes API
4. **Console Firebase** : Vérifier l'auth et les données

### Techniques de debug

```typescript
// 1. Console logging structuré
console.log('[ComponentName]', { state, props, error });

// 2. Breakpoints VS Code
// Cliquer dans la marge gauche pour ajouter un breakpoint

// 3. Debug TanStack Query
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log(queryClient.getQueryData(['key']));

// 4. Debug Zustand stores
import { useStore } from '@/stores/store';
const state = useStore.getState();
console.log('Store state:', state);
```

## 🔍 Bonnes pratiques de développement

### 1. Code Review Checklist

- [ ] Le code suit les conventions du projet
- [ ] Les types TypeScript sont corrects
- [ ] Pas de `console.log` oubliés
- [ ] Les erreurs sont gérées proprement
- [ ] Le code est testé manuellement
- [ ] La documentation est à jour

### 2. Performance

- Utiliser `React.memo` pour les composants coûteux
- Optimiser les images avec `next/image`
- Lazy load les composants non critiques
- Éviter les re-renders inutiles

### 3. Sécurité

- Toujours valider les inputs (Zod)
- Ne jamais exposer de secrets côté client
- Utiliser HTTPS en production
- Implémenter le rate limiting sur les APIs

### 4. Accessibilité

- Utiliser les balises sémantiques HTML
- Ajouter les attributs ARIA nécessaires
- Tester la navigation au clavier
- Contraste suffisant (WCAG AA minimum)

## 📊 Monitoring et Métriques

### Métriques à surveiller

1. **Performance** : Core Web Vitals (LCP, FID, CLS)
2. **Erreurs** : Taux d'erreur, types d'erreurs
3. **Usage** : Pages vues, actions utilisateur
4. **API** : Temps de réponse, taux d'erreur

### Outils (à implémenter)

- Sentry pour le monitoring d'erreurs
- Google Analytics pour l'usage
- Datadog/New Relic pour l'APM

## 🚨 Gestion des erreurs

### Pattern recommandé

```typescript
// 1. Error Boundary pour les erreurs React
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Implementation
}

// 2. Try-catch pour les async operations
try {
  const data = await fetchData();
} catch (error) {
  // Log to monitoring
  console.error('[Context]', error);

  // User-friendly message
  toast.error('Une erreur est survenue');
}

// 3. Error states dans les composants
if (error) {
  return <ErrorMessage message="Impossible de charger les données" />;
}
```

## 🔄 Refactoring

### Quand refactorer

- Code dupliqué (DRY principle)
- Fonction/composant trop complexe (>100 lignes)
- Performance dégradée
- Nouvelle feature qui nécessite une restructuration

### Process de refactoring

1. **Identifier** le code à refactorer
2. **Tester** le comportement actuel
3. **Refactorer** par petites étapes
4. **Vérifier** que tout fonctionne encore
5. **Commiter** avec message clair : `refactor: ...`

## 📝 Documentation du code

### JSDoc pour les fonctions complexes

```typescript
/**
 * Calcule le score de pertinence d'un utilisateur
 * @param user - L'objet utilisateur
 * @param criteria - Les critères de scoring
 * @returns Score entre 0 et 100
 */
export function calculateUserScore(
  user: User,
  criteria: ScoringCriteria
): number {
  // Implementation
}
```

### Commentaires utiles

```typescript
// TODO: Implémenter la pagination
// FIXME: Gérer le cas où user.email est null
// NOTE: Cette API a une limite de 100 req/min
// HACK: Workaround temporaire pour le bug Firebase
```

## ⚡ Tips de productivité

1. **Snippets VS Code** : Créer des snippets pour les patterns répétitifs
2. **Copilot/Cursor** : Utiliser l'IA pour le boilerplate
3. **Aliases imports** : Utiliser `@/` au lieu de `../../../`
4. **Hot keys** : Apprendre les raccourcis VS Code
5. **Multi-curseurs** : Pour éditer plusieurs lignes simultanément
