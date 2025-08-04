# Feature Accounting Tools

## Vue d'ensemble

Cette feature gère les outils comptables disponibles dans l'application. Elle suit l'architecture recommandée avec une séparation claire des responsabilités.

## Architecture

```
src/
├── types/accounting.ts              # Types TypeScript dédiés
├── services/accounting.service.ts   # Service HTTP centralisé
├── hooks/useAccountingTools.ts      # Hook TanStack Query
└── app/
    ├── api/accounting-tools/route.ts    # Route API
    └── home/accounting/page.tsx         # Page principale
```

## Composants

### Types (`src/types/accounting.ts`)

- `AccountingTool`: Structure côté client
- `AccountingToolAPIResponse`: Structure côté API
- `AccountingToolsApiResponse`: Réponse de succès
- `AccountingToolsApiError`: Réponse d'erreur

### Service (`src/services/accounting.service.ts`)

- `fetchAccountingTools()`: Fonction principale pour récupérer les outils
- `isSuccessResponse()`: Type guard pour la validation des réponses
- `transformAccountingTool()`: Transformation API → Client
- Cache intégré avec Next.js (300s par défaut)

### Hook (`src/hooks/useAccountingTools.ts`)

- Utilise TanStack Query pour la gestion d'état
- Cache intelligent (5min stale, 10min GC)
- Retry automatique avec backoff exponentiel
- Fonctions utilitaires : `prefetchAccountingTools()`, `invalidateAccountingTools()`

### API Route (`src/app/api/accounting-tools/route.ts`)

- Types stricts avec TypeScript
- Gestion d'erreurs standardisée
- Headers de cache optimisés
- Données mock (TODO: connecter à une vraie API)

## Utilisation

### Dans un composant

```tsx
import { useAccountingTools } from '@/hooks/useAccountingTools';

function AccountingComponent() {
  const { accountingTools, isLoading, error, refetch } = useAccountingTools();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {accountingTools.map(tool => (
        <div key={tool.id}>
          <h3>{tool.title}</h3>
          <p>{tool.description}</p>
          <a href={tool.url}>Accéder</a>
        </div>
      ))}
    </div>
  );
}
```

### Préchargement (Server Components)

```tsx
import { prefetchAccountingTools } from '@/hooks/useAccountingTools';
import { QueryClient } from '@tanstack/react-query';

async function ServerComponent() {
  const queryClient = new QueryClient();
  await prefetchAccountingTools(queryClient);

  // Le composant client aura les données immédiatement disponibles
}
```

## Configuration de cache

- **Client (TanStack Query)**: 5min stale, 10min GC
- **Serveur (Next.js)**: 300s revalidate avec stale-while-revalidate
- **Headers HTTP**: Cache public avec CDN-friendly

## Tests recommandés

1. **Service**: Mock `fetch`, test transformations, gestion d'erreurs
2. **Hook**: Test états loading/success/error, retry logic
3. **API Route**: Test réponses, types, headers
4. **Intégration**: Test du flux complet client → API → service

## Points d'amélioration futurs

1. Remplacer les données mock par une vraie API
2. Ajouter pagination si le nombre d'outils grandit
3. Ajouter filtrage/recherche
4. Implémenter des mutations (CREATE/UPDATE/DELETE)
5. Ajouter des tests automatisés

## Migration depuis l'ancienne version

L'API publique du hook `useAccountingTools` reste identique. Le changement principal :

- ✅ Avant : `useState` + `useEffect` + `fetch` manuel
- ✅ Après : TanStack Query + service centralisé + types stricts

Les composants existants fonctionnent sans modification.
