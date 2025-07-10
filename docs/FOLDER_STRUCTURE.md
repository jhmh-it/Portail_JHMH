# 📁 Structure des Dossiers

## 🗂️ Vue d'ensemble

```
portail_jhmh/
├── .husky/                 # Git hooks (pre-commit, commit-msg)
├── .next/                  # Build Next.js (généré, ignoré par Git)
├── docs/                   # 📚 Documentation complète du projet
├── node_modules/           # Dépendances npm (ignoré par Git)
├── public/                 # Assets statiques publics
├── src/                    # 📦 Code source principal
│   ├── app/               # Routes et pages Next.js (App Router)
│   ├── components/        # Composants React réutilisables
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitaires et configurations
│   ├── stores/           # Stores Zustand (état global)
│   └── types/            # Types TypeScript globaux
├── .env.local             # Variables d'environnement locales
├── .eslintrc.json         # Configuration ESLint
├── .gitignore            # Fichiers ignorés par Git
├── .prettierrc           # Configuration Prettier
├── CHANGELOG.md          # Historique des versions
├── components.json       # Configuration Shadcn UI
├── next.config.ts        # Configuration Next.js
├── package.json          # Dépendances et scripts
├── README.md             # Documentation principale
└── tsconfig.json         # Configuration TypeScript
```

## 📂 Détail par dossier

### `/src/app` - Routes et Pages (App Router)

```
app/
├── (auth)/                # Groupe de routes authentifiées
│   └── dashboard/        # Page dashboard protégée
│       └── page.tsx
├── api/                  # API Routes handlers
│   ├── auth/            # Endpoints authentification
│   │   ├── login/       # POST /api/auth/login
│   │   ├── logout/      # POST /api/auth/logout
│   │   └── me/          # GET /api/auth/me
│   ├── reservations/    # Endpoints réservations
│   │   └── [confirmationCode]/ # GET /api/reservations/[code]
│   ├── actifs/          # GET /api/actifs
│   └── dashboard/       # Dashboard APIs
│       └── metrics/     # GET /api/dashboard/metrics
├── login/               # Page de connexion publique
│   └── page.tsx
├── favicon.ico          # Icône du site
├── globals.css          # Styles globaux et variables CSS
├── layout.tsx           # Layout racine de l'application
└── page.tsx            # Page d'accueil

**Conventions App Router:**
- `page.tsx` : Définit une route
- `layout.tsx` : Layout partagé
- `loading.tsx` : État de chargement
- `error.tsx` : Gestion d'erreur
- `not-found.tsx` : Page 404
- `(groupe)` : Groupe logique sans impact URL
```

### `/src/components` - Composants React

```
components/
├── ui/                   # 🎨 Composants Shadcn UI (NE PAS MODIFIER)
│   ├── button.tsx       # Composant bouton de base
│   ├── card.tsx         # Composant carte
│   ├── form.tsx         # Composants formulaire
│   ├── input.tsx        # Champs de saisie
│   ├── label.tsx        # Labels de formulaire
│   ├── skeleton.tsx     # États de chargement
│   ├── sonner.tsx       # Composant toast/notification
│   └── ...              # Autres primitives UI
├── auth/                # Composants d'authentification
│   ├── LoginForm.tsx    # Formulaire de connexion
│   └── UserMenu.tsx     # Menu utilisateur connecté
├── layout/              # Composants de mise en page
│   ├── Header.tsx       # En-tête de l'application
│   ├── Sidebar.tsx      # Barre latérale navigation
│   └── Footer.tsx       # Pied de page
└── shared/              # Composants partagés
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx

**Conventions composants:**
- PascalCase pour les noms de fichiers
- Un composant par fichier
- Props typées avec interface
- Exports nommés (pas default)
```

### `/src/hooks` - Custom React Hooks

```
hooks/
├── useAuth.ts           # Hook authentification Firebase
├── useUser.ts           # Hook données utilisateur
├── useToast.ts          # Hook notifications (si custom)
└── useMediaQuery.ts     # Hook responsive

**Conventions hooks:**
- Préfixe `use` obligatoire
- Un hook = une responsabilité
- Retour typé explicitement
- Gestion d'erreur incluse
```

### `/src/lib` - Utilitaires et Configurations

```
lib/
├── firebase-client.ts   # Config Firebase côté client
├── firebase-admin.ts    # Config Firebase Admin SDK
├── api-client.ts        # Client API avec Axios
├── utils.ts            # Fonctions utilitaires (cn, formatters)
├── constants.ts        # Constantes globales
└── validations/        # Schémas Zod
    ├── auth.ts         # Validation formulaires auth
    └── user.ts         # Validation données user

**Conventions lib:**
- Fonctions pures si possible
- Pas de side effects
- Documentation JSDoc
- Tests unitaires recommandés
```

### `/src/stores` - État Global (Zustand)

```
stores/
├── auth-store.ts       # État authentification (deprecated?)
├── toast-store.ts      # État des notifications
├── ui-store.ts         # État UI (modals, sidebar, etc.)
└── index.ts           # Barrel export

**Conventions stores:**
- Un store par domaine
- Pas de logique métier
- Actions atomiques
- État sérialisable
```

### `/src/types` - Types TypeScript

```
types/
├── api.ts             # Types pour les réponses API
├── auth.ts            # Types authentification
├── user.ts            # Types modèle utilisateur
└── index.ts           # Exports centralisés

**Conventions types:**
- Interfaces pour les objets
- Types pour les unions/alias
- Éviter les enums (utiliser as const)
- Commentaires JSDoc si complexe
```

### `/docs` - Documentation

```
docs/
├── README.md              # Index de la documentation
├── AI_AGENT_GUIDE.md     # Guide pour Cursor/Copilot
├── ARCHITECTURE.md       # Architecture technique
├── COMMITS.md           # Conventions de commits
├── DEVELOPMENT.md       # Guide de développement
├── FOLDER_STRUCTURE.md  # Ce fichier
├── PROJECT_CONTEXT.md   # Contexte métier
├── STYLE_GUIDE.md       # Guide de style code
└── [autres].md          # Docs additionnelles

**Conventions docs:**
- Markdown avec emojis pour la lisibilité
- Exemples de code concrets
- Mise à jour régulière
- Liens inter-documents
```

### `/public` - Assets Statiques

```
public/
├── images/              # Images optimisées
│   ├── logo.svg        # Logo de l'entreprise
│   └── ...
├── fonts/              # Polices custom (si nécessaire)
└── favicon.ico         # Icône navigateur

**Conventions public:**
- Images optimisées (WebP si possible)
- Nommage kebab-case
- Pas de données sensibles
- Préférer next/image pour le chargement
```

## 🔍 Patterns d'organisation

### Organisation par Feature (recommandé)

```
components/
├── user/
│   ├── UserCard.tsx
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   ├── hooks/
│   │   └── useUserData.ts
│   ├── types.ts
│   └── index.ts        # Barrel export
```

### Colocation

Garder les fichiers liés proches :

- Composant + ses types
- Composant + son hook dédié
- Route + ses composants spécifiques

### Barrel Exports

```typescript
// components/user/index.ts
export { UserCard } from './UserCard';
export { UserList } from './UserList';
export type { UserCardProps } from './types';

// Usage simplifié
import { UserCard, UserList } from '@/components/user';
```

## ⚠️ À éviter

### ❌ Ne pas faire

```
src/
├── components/
│   ├── ComponentOne.js     # ❌ Pas de .js
│   ├── component-two.tsx   # ❌ Incohérent (kebab vs Pascal)
│   ├── utils.tsx          # ❌ Utils dans components
│   └── CONSTANTS.ts       # ❌ Mauvais casing
```

### ✅ Faire à la place

```
src/
├── components/
│   ├── ComponentOne.tsx    # ✅ .tsx pour React
│   └── ComponentTwo.tsx    # ✅ PascalCase cohérent
├── lib/
│   ├── utils.ts           # ✅ Utils dans lib
│   └── constants.ts       # ✅ camelCase pour fichiers
```

## 🔄 Imports aliases

Le projet utilise des alias TypeScript pour des imports plus propres :

```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}

// Usage
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
```

## 📏 Règles et limites

1. **Profondeur max** : 4 niveaux depuis `src/`
2. **Fichiers par dossier** : Max ~10-15 (sinon subdiviser)
3. **Taille composant** : Max ~200 lignes (sinon découper)
4. **Barrel exports** : Pour tous les dossiers de composants

## 🚀 Création de nouveaux fichiers

### Nouveau composant

```bash
# 1. Créer le fichier
touch src/components/feature/NewComponent.tsx

# 2. Ajouter au barrel export
echo "export { NewComponent } from './NewComponent';" >> src/components/feature/index.ts
```

### Nouvelle route

```bash
# Créer une nouvelle page
mkdir -p src/app/new-feature
touch src/app/new-feature/page.tsx
```

### Nouveau hook

```bash
# Créer le hook
touch src/hooks/useNewFeature.ts
```

---

**Note** : Cette structure est évolutive. Adaptez-la selon les besoins du projet tout en maintenant la cohérence.
