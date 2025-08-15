# архитектура README_ARCHITECTURE.md

Ce document fusionne les informations existantes (`ARCHITECTURE.md`,
`FOLDER_STRUCTURE.md`, etc.) et les enrichit pour servir de guide architectural
de référence.

### Table des matières

1.  [Aperçu du projet](#aperçu-du-projet)
2.  [Stack Technique](#stack-technique)
3.  [Structure des Fichiers Recommandée](#structure-des-fichiers-recommandée)
4.  [Conventions de Code](#conventions-de-code)
5.  [Flux de Données & Fetching](#flux-de-données--fetching)
6.  [UI & Styles](#ui--styles)
7.  [Performance](#performance)
8.  [Sécurité](#sécurité)
9.  [Qualité & Outils](#qualité--outils)
10. [Scripts NPM Utiles](#scripts-npm-utiles)
11. [Règles de Refactorisation](#règles-de-refactorisation)
12. [Checklist d’Acceptation](#checklist-dacceptation)

---

### Aperçu du projet

- **Nom** : Portail JHMH
- **Objectif** : Application web d'entreprise centralisant l'accès aux services
  internes, avec authentification sécurisée et gestion des rôles.
- **Versions Clés** :
  - **Node.js** : >=18.0.0
  - **Next.js** : 15.3.4 (App Router)
  - **React** : 19
  - **TypeScript** : ^5

### Stack Technique

- **Framework Core** : Next.js 15.3.4 (App Router)
- **UI** : React 19, TailwindCSS v4, Shadcn UI, Framer Motion
- **State Management** : TanStack Query v5 (Server State), Zustand (Client
  State)
- **Formulaires** : React Hook Form + Zod
- **Authentification** : Firebase Auth (via Admin SDK dans les API Routes)
- **API** : Next.js Route Handlers agissant comme proxy pour une API externe
  (JHMH API).

### Structure des Fichiers Recommandée

La structure actuelle est bonne. L'ajout d'une couche `/services` est recommandé
pour mieux isoler la logique d'accès aux données externes et simplifier les
Route Handlers.

```
/src
├── app/                  # Routes (App Router)
├── components/           # Composants React (globaux ou par feature)
├── features/             # (Optionnel) Regroupement par fonctionnalité majeure
│   └── <featureName>/
│       ├── components/
│       ├── hooks/
│       └── services.ts
├── hooks/                # Hooks React globaux
├── lib/                  # Utilitaires purs, config (Firebase, etc.)
├── services/             # **NOUVEAU**: Couche d'accès aux données (API externes)
├── stores/               # Stores Zustand
├── types/                # Types TypeScript globaux
└── styles/               # Styles globaux (si nécessaire)
```

### Conventions de Code

- **Nommage** : `PascalCase` pour les composants, `camelCase` pour les
  fonctions/hooks.
- **Exports** : Toujours utiliser des **exports nommés**
  (`export function MyComponent`) pour éviter les conflits et améliorer la
  recherche.
- **Imports** : Utiliser les chemins absolus configurés dans `tsconfig.json`
  (`@/components/...`).

### Flux de Données & Fetching

- **App Router** : Le projet utilise l'App Router.
  - **Server Components** : À privilégier pour le fetching de données initial.
    Ils peuvent appeler directement la couche de services.
  - **Route Handlers (`/api`)** : Servent de proxy sécurisé entre le client et
    l'API externe JHMH. Toute la logique d'authentification et de validation
    doit y résider.
  - **Client Components** : Utilisent TanStack Query (`useQuery`, `useMutation`)
    pour appeler les Route Handlers.

### UI & Styles

- **TailwindCSS** : Le styling est exclusivement géré par TailwindCSS et les
  composants Shadcn UI. Pas de CSS personnalisé.
- **Accessibilité** : L'utilisation de Shadcn UI fournit une bonne base. Il est
  impératif de continuer à utiliser les attributs ARIA et de tester la
  navigation au clavier.

### Performance

- **Code-Splitting** : Automatique par route avec l'App Router. Utiliser
  `next/dynamic` pour les composants lourds chargés conditionnellement.
- **Images** : Utiliser `next/image` pour l'optimisation automatique.
- **Memoization** : `useMemo` et `useCallback` doivent être utilisés avec
  parcimonie, uniquement pour des calculs coûteux ou pour éviter des re-renders
  de composants lourds.

### Sécurité

- **Variables d'environnement** : Les secrets (clés API, etc.) ne doivent JAMAIS
  être exposés côté client. Utiliser `NEXT_PUBLIC_` uniquement pour les
  variables non sensibles.
- **Authentification** : La validation des sessions se fait côté serveur dans
  les Route Handlers en vérifiant le cookie de session avec Firebase Admin SDK.
  Ce pattern est bon mais doit être factorisé.

### Qualité & Outils

- **Linting/Formatting** : ESLint et Prettier sont configurés et s'exécutent via
  un hook pre-commit (Husky). C'est une excellente pratique.
- **TypeScript** : Le mode `strict` est activé. Il faut maintenir une couverture
  de types forte et éviter `any`.
- **Tests** : Actuellement absents. La mise en place de Vitest (unitaire) et
  Playwright (E2E) est une priorité critique (voir `TODO_REFACTOR.md`).
- **Commits** : Le projet suit les
  [Conventional Commits](https://www.conventionalcommits.org/), ce qui est
  excellent pour la maintenabilité de l'historique Git.

### Scripts NPM Utiles

- `npm run dev`: Lance le serveur de développement.
- `npm run build`: Construit l'application pour la production.
- `npm run lint`: Vérifie la qualité du code avec ESLint.
- `npm run lint:fix`: Corrige automatiquement les erreurs ESLint.
- `npm run format`: Formate le code avec Prettier.
- `npm run type-check`: Valide les types TypeScript sans compiler.
- `npm run test`: Exécute les vérifications de base (linting, type-checking).
  **À mettre à jour avec un vrai test runner.**

### Règles de Refactorisation

1.  **Ordre des Imports** : Standardiser l'ordre (Libs externes > Next.js >
    Alias internes > Types > Styles). Un plugin Prettier peut automatiser cela.
2.  **Découpage des Composants** : Un composant ne doit pas dépasser ~200
    lignes. Scinder en sous-composants si nécessaire.
3.  **Extraction de Hooks** : Toute logique d'état ou d'effet réutilisable doit
    être extraite dans un custom hook (`use...`).
4.  **Création de Services** : La logique d'appel aux API externes (`fetch`)
    doit être centralisée dans la couche `/services` pour être réutilisée par
    les Route Handlers.
5.  **Barrel Exports (`index.ts`)** : Utiliser pour simplifier les imports
    depuis un dossier (`@/components/ui` au lieu de `@/components/ui/button`).
6.  **Gestion d'Erreurs** : Standardiser la gestion des erreurs dans les API
    (try/catch, `NextResponse.json` avec statut 500) et côté client
    (ErrorBoundary, état d'erreur dans `useQuery`).
7.  **UX & Notifications** : Utiliser le système de `sonner` (toasts) pour tout
    feedback utilisateur (succès, erreur).

### Checklist d’Acceptation

Pour chaque Pull Request avant fusion :

- [ ] ✅ `npm run lint` passe sans erreur.
- [ ] ✅ `npm run type-check` passe sans erreur.
- [ ] ✅ `npm run build` se termine avec succès.
- [ ] ✅ Pas de `console.log` ou de code commenté laissé inutilement.
- [ ] ✅ La console du navigateur est propre (pas d'avertissements React, pas
      d'erreurs 404).
- [ ] 🧪 (Futur) Les tests unitaires et E2E passent avec succès.
- [ ] 📖 La documentation pertinente (JSDoc, READMEs) est mise à jour.
