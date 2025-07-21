# 🧪 Guide de Configuration des Tests

## 📋 État Actuel

Actuellement, le projet utilise un **script de test basique** qui exécute :

- ✅ Linting (ESLint)
- ✅ Vérifications TypeScript
- ✅ Build de validation

```bash
npm run test      # Tests basiques (lint + type-check)
npm run test:ci   # Tests CI complets (test + build)
```

## 🎯 Objectifs Futurs

### **1. Tests Unitaires**

**Recommandé : Vitest + Testing Library**

```bash
# Installation
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D jsdom
```

**Configuration vitest.config.ts** :

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

### **2. Tests d'Intégration**

**Recommandé : Playwright**

```bash
# Installation
npm install -D @playwright/test
npx playwright install
```

### **3. Scripts package.json à Mettre à Jour**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:ci": "npm run test && npm run test:e2e && npm run build"
  }
}
```

## 📁 Structure Recommandée

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx          # Tests unitaires
│   └── features/
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   └── LoginForm.test.tsx
├── test/
│   ├── setup.ts                     # Configuration tests
│   ├── mocks/                       # Mocks globaux
│   └── utils/                       # Helpers de test
└── e2e/
    ├── auth.spec.ts                 # Tests E2E
    └── dashboard.spec.ts
```

## 🧪 Exemples de Tests

### **Test Unitaire (Vitest + Testing Library)**

```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### **Test E2E (Playwright)**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');

  // Vérifier que la page de login est affichée
  await expect(page.getByText('Se connecter')).toBeVisible();

  // Simuler la connexion
  await page.getByRole('button', { name: /google/i }).click();

  // Vérifier la redirection vers dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔧 Configuration Firebase Auth dans les Tests

### **Mocks Firebase Auth**

```typescript
// src/test/mocks/firebase.ts
import { vi } from 'vitest';

export const mockAuth = {
  currentUser: null,
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
};

vi.mock('@/lib/firebase-client', () => ({
  auth: mockAuth,
}));
```

### **Test Provider Wrapper**

```typescript
// src/test/utils/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## 🚀 Migration Étape par Étape

### **Étape 1 : Configuration de Base**

1. Installer Vitest et Testing Library
2. Configurer vitest.config.ts
3. Mettre à jour le script test dans package.json
4. Créer src/test/setup.ts

### **Étape 2 : Premiers Tests**

1. Tester les composants UI simples (Button, Input)
2. Tester les hooks personnalisés (useAuth, useUser)
3. Tester les utilitaires/helpers

### **Étape 3 : Tests d'Intégration**

1. Installer Playwright
2. Configurer playwright.config.ts
3. Créer les premiers tests E2E (login, navigation)

### **Étape 4 : Coverage et CI**

1. Configurer le coverage avec c8
2. Mettre à jour les workflows GitHub Actions
3. Définir les seuils de coverage minimum

## 📊 Métriques Recommandées

- **Coverage minimum** : 80% pour les utils, 60% pour les composants
- **Tests E2E** : Couvrir les user journeys critiques
- **Performance** : Tests de performance sur les pages principales

## 🔄 Workflow de Développement avec Tests

```bash
# Développement
npm run test:watch        # Tests en mode watch
npm run dev              # Dev server

# Avant commit
npm run test:ci          # Tests complets
npm run lint:fix         # Fix automatique

# CI/CD
# Les workflows GitHub Actions exécutent automatiquement tous les tests
```

## 📞 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)

---

**📝 Statut** : Configuration basique prête, tests unitaires et E2E à implémenter  
**🎯 Priorité** : Moyenne (après les features principales)  
**⏱️ Estimation** : 2-3 jours pour configuration complète
