# 🎨 Guide de Style - Portail JHMH

## 📐 Principes fondamentaux

1. **Lisibilité > Concision** : Un code clair vaut mieux qu'un code court
2. **Cohérence** : Suivre les patterns existants
3. **Simplicité** : KISS (Keep It Simple, Stupid)
4. **Maintenabilité** : Penser au futur développeur (vous dans 6 mois)

## 🔤 Conventions de nommage

### Fichiers et dossiers

```bash
# Composants React - PascalCase
UserProfile.tsx
AuthProvider.tsx

# Hooks - camelCase avec préfixe 'use'
useAuth.ts
useUserData.ts

# Utilitaires - camelCase
formatDate.ts
validateEmail.ts

# Types - PascalCase avec suffixe si nécessaire
User.ts
ApiResponse.types.ts

# Stores Zustand - camelCase avec suffixe '-store'
auth-store.ts
toast-store.ts

# Dossiers - kebab-case
user-management/
api-handlers/
```

### Variables et fonctions

```typescript
// ✅ BON : Noms descriptifs
const isUserAuthenticated = true;
const fetchUserProfile = async (userId: string) => {};
const MAX_RETRY_ATTEMPTS = 3;

// ❌ MAUVAIS : Noms vagues ou abrégés
const flag = true;
const getData = async (id: string) => {};
const MAX = 3;
```

### Types et Interfaces

```typescript
// ✅ BON : PascalCase, noms clairs
interface UserProfile {
  id: string;
  email: string;
  roles: UserRole[];
}

type UserRole = 'admin' | 'user' | 'guest';

// ❌ MAUVAIS : Préfixes I, noms génériques
interface IData {
  x: string;
  y: string;
}
```

## 📝 TypeScript

### Configuration stricte

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Types explicites

```typescript
// ✅ BON : Types explicites
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ MAUVAIS : Types implicites
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Éviter `any`

```typescript
// ✅ BON : Types spécifiques ou génériques
function processData<T>(data: T): ProcessedData<T> {
  // ...
}

// Si vraiment nécessaire, utiliser unknown
function handleUnknownError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ MAUVAIS : any
function processData(data: any): any {
  // ...
}
```

## ⚛️ React et composants

### Structure des composants

```typescript
// ✅ BON : Structure claire et organisée
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfileProps } from './types';

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 1. Hooks
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effets
  useEffect(() => {
    // ...
  }, [userId]);

  // 3. Handlers
  const handleUpdate = async () => {
    // ...
  };

  // 4. Render helpers
  if (isLoading) {
    return <Skeleton />;
  }

  // 5. Render principal
  return (
    <div className="space-y-4">
      {/* ... */}
    </div>
  );
}
```

### Props et types

```typescript
// ✅ BON : Interface séparée, props destructurées
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
}: ButtonProps) {
  // ...
}

// ❌ MAUVAIS : Props inline, pas de valeurs par défaut
export function Button(props: {
  variant: string;
  onClick: Function;
  children: any;
}) {
  // ...
}
```

### Hooks personnalisés

```typescript
// ✅ BON : Hook bien structuré avec types
interface UseUserDataReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserData(userId: string): UseUserDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    // ...
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return { user, isLoading, error, refetch: fetchUser };
}
```

## 🎨 CSS et Styling

### TailwindCSS uniquement

```typescript
// ✅ BON : Classes Tailwind, responsive
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 lg:p-8">
  <Button className="w-full md:w-auto">
    Cliquez-moi
  </Button>
</div>

// ❌ MAUVAIS : Styles inline, CSS modules
<div style={{ display: 'flex', gap: '1rem' }}>
  <Button style={{ width: '100%' }}>
    Cliquez-moi
  </Button>
</div>
```

### Classes conditionnelles

```typescript
// ✅ BON : Utiliser clsx/cn pour les conditions
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  {
    'active-class': isActive,
    'error-class': hasError,
  },
  customClassName
)}>

// ❌ MAUVAIS : Concaténation manuelle
<div className={`base-classes ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`}>
```

### Variables de thème

```typescript
// ✅ BON : Utiliser les variables CSS du thème
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Titre</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ MAUVAIS : Couleurs hardcodées
<div className="bg-white text-black border-gray-200">
  <h1 className="text-blue-600">Titre</h1>
  <p className="text-gray-500">Description</p>
</div>
```

## 📦 Imports et organisation

### Ordre des imports

```typescript
// 1. React et dépendances externes
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 2. Imports Next.js
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 3. Composants UI (Shadcn)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Composants custom
import { UserAvatar } from '@/components/UserAvatar';

// 5. Hooks
import { useAuth } from '@/hooks/useAuth';

// 6. Utils et lib
import { cn } from '@/lib/utils';

// 7. Types
import type { User } from '@/types/user';

// 8. Styles (si nécessaire)
import styles from './Component.module.css';
```

### Barrel exports

```typescript
// components/user/index.ts
export { UserCard } from './UserCard';
export { UserList } from './UserList';
export { UserAvatar } from './UserAvatar';
export type { UserCardProps, UserListProps } from './types';
```

## 🔒 Gestion d'erreurs

### Try-catch avec contexte

```typescript
// ✅ BON : Gestion d'erreur complète
async function updateUserProfile(data: UpdateProfileData) {
  try {
    const response = await api.updateProfile(data);
    toast.success('Profil mis à jour avec succès');
    return response;
  } catch (error) {
    console.error('[updateUserProfile]', error);

    if (error instanceof ValidationError) {
      toast.error('Données invalides: ' + error.message);
    } else if (error instanceof NetworkError) {
      toast.error('Erreur réseau. Veuillez réessayer.');
    } else {
      toast.error('Une erreur inattendue est survenue');
    }

    throw error; // Re-throw pour que le composant puisse gérer
  }
}
```

### Error boundaries

```typescript
// ✅ BON : Error boundary pour sections critiques
<ErrorBoundary fallback={<ErrorFallback />}>
  <CriticalFeature />
</ErrorBoundary>
```

## 🚀 Performance

### Mémoïsation appropriée

```typescript
// ✅ BON : Mémoïsation justifiée
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(
    () => expensiveCalculation(data),
    [data]
  );

  return <div>{processedData}</div>;
});

// ❌ MAUVAIS : Sur-optimisation
const SimpleComponent = React.memo(({ text }) => {
  return <span>{text}</span>; // Pas besoin de memo ici
});
```

### Lazy loading

```typescript
// ✅ BON : Lazy load pour routes et gros composants
const Dashboard = lazy(() => import('@/components/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

## 🧪 Code testable

### Séparation des préoccupations

```typescript
// ✅ BON : Logique séparée, testable
// utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// components/LoginForm.tsx
import { validateEmail } from '@/utils/validation';

function LoginForm() {
  const handleSubmit = (email: string) => {
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }
    // ...
  };
}
```

## 📚 Documentation dans le code

### JSDoc pour fonctions complexes

```typescript
/**
 * Calcule le prix total avec taxes et réductions
 * @param items - Liste des articles du panier
 * @param taxRate - Taux de taxe (ex: 0.20 pour 20%)
 * @param discount - Montant de réduction à appliquer
 * @returns Prix total formaté en euros
 */
export function calculateTotalPrice(
  items: CartItem[],
  taxRate: number,
  discount: number = 0
): string {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount - discount;

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(total);
}
```

### Commentaires utiles

```typescript
// ✅ BON : Explique le "pourquoi"
// Utilisation de setTimeout pour éviter le conflit avec l'animation de fermeture
setTimeout(() => {
  closeModal();
}, 300);

// ❌ MAUVAIS : Explique le "quoi" (évident)
// Incrémente le compteur de 1
counter = counter + 1;
```

## ✅ Checklist de code review

Avant de créer une PR, vérifier :

- [ ] Pas de `console.log` de debug
- [ ] Pas de code commenté
- [ ] Pas de `any` TypeScript
- [ ] Gestion d'erreurs appropriée
- [ ] Noms de variables/fonctions clairs
- [ ] Composants responsive (mobile-first)
- [ ] Accessibilité (ARIA labels, keyboard nav)
- [ ] Performance (pas de re-renders inutiles)
- [ ] Sécurité (validation, sanitization)
- [ ] Tests manuels effectués

## 🔧 Configuration automatique

Les outils suivants appliquent automatiquement ce guide :

- **ESLint** : Règles de code
- **Prettier** : Formatage
- **TypeScript** : Types stricts
- **Husky** : Pre-commit hooks

```bash
# Vérifier et corriger automatiquement
npm run lint:fix
npm run format
```

---

**Note** : Ce guide évolue avec le projet. Proposez des améliorations via PR si nécessaire.
