# 🤖 Guide pour Agents IA (Cursor, GitHub Copilot, etc.)

## 🎯 Objectif de ce guide

Ce document fournit le contexte essentiel pour permettre aux agents IA de comprendre rapidement le projet et de générer du code de qualité conforme aux standards établis.

## 📋 Contexte du projet

### Vue d'ensemble

- **Nom** : Portail JHMH
- **Type** : Application web Next.js 15 avec authentification Firebase
- **Stack principal** : Next.js 15 (App Router), TypeScript, TailwindCSS, Firebase Auth, TanStack Query v5
- **Objectif** : Portail d'entreprise avec authentification sécurisée et gestion des rôles

### Architecture technique

```
- Frontend : Next.js 15 avec App Router
- Styling : TailwindCSS + Shadcn UI
- Auth : Firebase Authentication avec middleware Next.js
- State : TanStack Query + Zustand
- Validation : Zod + React Hook Form
- API : Routes handlers Next.js
```

## 🚨 Points d'attention critiques

### 1. Authentification (Firebase)

```typescript
// ✅ TOUJOURS utiliser le pattern singleton pour Firebase
// Fichiers : src/lib/firebase-client.ts et firebase-admin.ts
// NE JAMAIS initialiser Firebase directement dans les composants
```

### 2. Middleware de sécurité

```typescript
// Le middleware dans src/middleware.ts protège automatiquement :
// - /dashboard/*
// - /api/* (sauf /api/auth/*)
// Toute nouvelle route protégée doit être ajoutée dans middleware.ts
```

### 3. Gestion d'état

```typescript
// TanStack Query pour les données serveur (users, posts, etc.)
// Zustand pour l'état UI local (modals, toasts, etc.)
// NE PAS mélanger les deux responsabilités
```

## 📁 Structure des fichiers - Conventions STRICTES

```
src/
├── app/                   # Routes Next.js (App Router)
│   ├── (auth)/            # Groupe de routes authentifiées
│   ├── api/               # API Routes handlers
│   └── globals.css        # Styles globaux (variables CSS)
├── components/
│   ├── ui/                # Composants Shadcn UI (NE PAS MODIFIER)
│   └── [feature]/         # Composants par fonctionnalité
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et configurations
├── stores/                # Stores Zustand
└── types/                 # Types TypeScript globaux
```

## ✅ Checklist avant génération de code

### Avant de créer un nouveau composant/feature :

1. **Vérifier l'existant** : Un composant similaire existe-t-il déjà ?
2. **Respecter les patterns** : Suivre les exemples existants (ex: `useAuth`, `useUser`)
3. **Types stricts** : Toujours définir les types TypeScript
4. **Validation** : Utiliser Zod pour toute donnée externe
5. **Error boundaries** : Gérer les erreurs gracieusement avec null safety
6. **Null safety** : Vérifier systématiquement les valeurs null/undefined avant utilisation

### Commandes à connaître :

```bash
# Développement
npm run dev          # Serveur de dev
npm run build        # Build production
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
npm run type-check   # Vérifier les types

# Git hooks automatiques (Husky)
# Le linting et formatting sont automatiques au commit
```

## 🎨 Standards de code

### TypeScript

```typescript
// ✅ BON : Types explicites, pas de any
interface UserData {
  id: string;
  email: string;
  roles: string[];
}

// ❌ MAUVAIS : any, types implicites
const user: any = getData();
```

### Composants React

```typescript
// ✅ BON : Composant fonctionnel typé
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ MAUVAIS : Pas de types, export default
export default function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### Gestion d'erreurs

```typescript
// ✅ BON : Gestion explicite avec messages clairs
try {
  const result = await fetchData();
  return result;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw new Error('Unable to load data. Please try again.');
}

// ❌ MAUVAIS : Catch vide ou re-throw sans contexte
try {
  return await fetchData();
} catch (e) {
  throw e;
}
```

## 🔒 Sécurité

### Variables d'environnement

```bash
# TOUJOURS dans .env.local, JAMAIS commitées
NEXT_PUBLIC_* # Variables publiques (côté client)
FIREBASE_*    # Variables privées (côté serveur uniquement)
```

### Authentication Flow

1. Login → Firebase Auth → Cookie httpOnly
2. Middleware vérifie le cookie à chaque requête
3. API routes utilisent `getAuthenticatedUser()`
4. Client utilise `useAuth()` hook

## 💡 Patterns recommandés

### 1. Data Fetching

```typescript
// Utiliser TanStack Query pour toute donnée serveur
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
```

### 2. Form Handling

```typescript
// React Hook Form + Zod pour tous les formulaires
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '' },
});
```

### 3. Styling

```typescript
// TailwindCSS uniquement, pas de CSS modules
<div className="flex items-center gap-4 p-4 bg-card rounded-lg">
  {/* Utiliser les variables de theme (bg-card, text-primary, etc.) */}
</div>
```

## 🚀 Workflow de développement

1. **Créer une branche** : `feat/nouvelle-fonctionnalite`
2. **Développer** : Suivre les conventions ci-dessus
3. **Tester** : Vérifier dans le navigateur
4. **Lint** : `npm run lint:fix`
5. **Commit** : Messages conventionnels (voir COMMITS.md)
6. **Push** : Les hooks Git valident automatiquement

## ⚠️ Pièges courants à éviter

1. **NE PAS** créer de nouveaux fichiers de configuration sans nécessité
2. **NE PAS** utiliser `localStorage` pour des données sensibles
3. **NE PAS** faire d'appels API dans les composants (utiliser les hooks)
4. **NE PAS** ignorer les erreurs TypeScript

## 📚 Ressources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Shadcn UI Docs](https://ui.shadcn.com)

## 🔄 Mise à jour de ce guide

Ce guide doit être mis à jour lorsque :

- De nouvelles conventions sont adoptées
- De nouveaux patterns émergent
- Des problèmes récurrents sont identifiés

**Dernière mise à jour** : Juillet 2025
