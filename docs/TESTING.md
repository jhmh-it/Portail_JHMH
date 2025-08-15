# 🧪 Guide de Tests et Assurance Qualité

## 🎯 Philosophie de test

### Principes fondamentaux

1. **Test Pyramid** : Beaucoup de tests unitaires, moins d'intégration, peu
   d'E2E
2. **TDD encouragé** : Écrire les tests avant le code quand possible
3. **Coverage raisonnable** : Viser 80% de couverture, 100% sur le code critique
4. **Tests maintenables** : Préférer la clarté à la concision

## 🛠️ Stack de test (À implémenter)

### Outils recommandés

- **Vitest** : Tests unitaires (rapide, compatible Vite)
- **React Testing Library** : Tests composants
- **MSW** : Mocking des API
- **Playwright** : Tests E2E
- **Storybook** : Tests visuels et documentation

## 📋 Types de tests

### 1. Tests unitaires

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, calculatePrice } from './utils';

describe('formatDate', () => {
  it('should format date in French locale', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15 janvier 2024');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Date invalide');
  });
});

describe('calculatePrice', () => {
  it('should calculate price with tax', () => {
    expect(calculatePrice(100, 0.2)).toBe(120);
  });

  it('should handle negative values', () => {
    expect(() => calculatePrice(-100, 0.2)).toThrow('Price cannot be negative');
  });
});
```

### 2. Tests de composants

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
  });
});
```

### 3. Tests de hooks

```typescript
// src/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

### 4. Tests d'intégration

```typescript
// src/features/auth/auth.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/app/login/page';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Authentication Flow', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('logs in user successfully', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    // Verify redirect
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

### 5. Tests E2E

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('complete login flow', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Fill credentials
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('text=Bienvenue')).toBeVisible();
  });

  test('handles invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Identifiants invalides')).toBeVisible();
  });
});
```

## 🔧 Configuration des tests

### Vitest config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Setup de test

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock des APIs browser
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## 📝 Patterns de test

### 1. Arrange-Act-Assert (AAA)

```typescript
it('should calculate total with discount', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 50 }];
  const discount = 0.1;

  // Act
  const total = calculateTotal(items, discount);

  // Assert
  expect(total).toBe(135); // 150 - 10%
});
```

### 2. Test IDs pour E2E

```typescript
// Composant
<button data-testid="submit-button">Submit</button>

// Test E2E
await page.click('[data-testid="submit-button"]');
```

### 3. Mocking stratégique

```typescript
// Mock seulement ce qui est nécessaire
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(() => Promise.resolve({ data: mockUser })),
  },
}));
```

### 4. Tests de snapshot (avec parcimonie)

```typescript
it('renders correctly', () => {
  const { container } = render(<Header title="Test" />);
  expect(container).toMatchSnapshot();
});
```

## 🎯 Stratégie de test par type de code

### Composants UI

- Props rendering
- Event handlers
- États conditionnels
- Accessibilité

### Hooks

- Valeurs initiales
- Updates d'état
- Side effects
- Cleanup

### Utils/Helpers

- Cas nominaux
- Cas limites
- Gestion d'erreurs
- Types de retour

### API Routes

- Auth vérification
- Validation input
- Réponses succès/erreur
- Status codes

## 📊 Métriques de qualité

### Coverage cibles

- **Statements** : 80%
- **Branches** : 75%
- **Functions** : 80%
- **Lines** : 80%

### Code critique (100% coverage)

- Authentication
- Permissions/Authorization
- Payment processing
- Data validation

## 🚀 Commandes de test

```bash
# Tests unitaires
npm run test              # Mode watch
npm run test:ci          # Single run (CI)
npm run test:coverage    # Avec coverage

# Tests E2E
npm run test:e2e         # Headless
npm run test:e2e:ui      # Avec UI Playwright

# Linting et types
npm run lint             # ESLint
npm run type-check       # TypeScript

# Tout vérifier
npm run test:all         # Lint + Types + Tests + E2E
```

## 🐛 Debugging des tests

### Tips de debug

```typescript
// 1. Debug visuel
screen.debug(); // Affiche le DOM

// 2. Queries détaillées
const button = screen.getByRole('button', {
  name: /submit/i,
  hidden: true, // Inclure éléments cachés
});

// 3. Attendre les updates
await waitFor(
  () => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  },
  { timeout: 3000 }
);

// 4. User events réalistes
const user = userEvent.setup({ delay: 100 });
await user.type(input, 'Hello');
```

## ✅ Checklist avant commit

### Tests obligatoires

- [ ] Nouveaux composants ont des tests
- [ ] Nouveaux utils ont des tests unitaires
- [ ] Coverage reste > 80%
- [ ] Tous les tests passent localement
- [ ] Pas de `console.log` dans les tests
- [ ] Pas de `.only` ou `.skip` oubliés

### Tests recommandés

- [ ] Cas d'erreur testés
- [ ] Accessibilité vérifiée
- [ ] Performance acceptable
- [ ] Comportement responsive testé

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
      - run: npm run build
```

## 📚 Ressources

### Documentation

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [MSW Docs](https://mswjs.io/)

### Best Practices

- [Kent C. Dodds Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

---

**Note** : Les tests sont un investissement. Écrivez des tests qui vous donnent
confiance sans ralentir le développement.
