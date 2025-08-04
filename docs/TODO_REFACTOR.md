# TODO_REFACTOR.md: Plan d'Amélioration Priorisé

Ce document liste les actions de refactorisation concrètes pour améliorer la qualité, la maintenabilité et la performance du projet.

---

### P0 - Critique (Actions immédiates pour la sécurité et la performance)

#### 1. Factoriser la Logique des API Routes

- **Problème** : La logique d'authentification (vérification du cookie de session Firebase) et de configuration de l'API externe (récupération des clés API) est dupliquée dans **plus de 20 fichiers** de routes API (`/api/greg/...`, `/api/reservations/...`). C'est une faille de sécurité potentielle si un développeur oublie cette vérification, et un cauchemar de maintenance.
- **Action** :
  1.  Créer une fonction d'ordre supérieur (Higher-Order Function) ou un wrapper `withAuth(handler)` qui prend en charge :
      - La lecture et la vérification du cookie de session.
      - Le renvoi d'une erreur 401/403 si l'authentification échoue.
      - L'injection de l'utilisateur authentifié et de la configuration API dans le `handler` final.
  2.  Appliquer ce wrapper à toutes les routes API protégées.
- **Fichiers concernés** : Tous les fichiers dans `src/app/api/greg/` et `src/app/api/reservations/`.
- **Impact** : **Élevé**. Réduction de ~30 lignes de code dupliqué par fichier, centralisation de la sécurité.

#### 2. Corriger la Pagination et le Filtrage Inefficaces

- **Problème** : Les routes `GET /api/greg/documents`, `GET /api/greg/spaces` et `GET /api/listings-actifs` récupèrent **toutes les données** de l'API externe avant d'appliquer les filtres et la pagination. Cela va entraîner des temps de réponse très lents et une consommation mémoire excessive.
- **Action** :
  1.  Modifier ces routes pour qu'elles passent les paramètres de requête (`q`, `page`, `page_size`, etc.) directement à l'API externe lors de l'appel `fetch`.
  2.  Cela suppose que l'API externe supporte ces paramètres. Si ce n'est pas le cas, c'est une alerte architecturale majeure à remonter à l'équipe en charge de cette API.
- **Fichiers concernés** :
  - `src/app/api/greg/documents/route.ts`
  - `src/app/api/greg/spaces/route.ts`
  - `src/app/api/listings-actifs/route.ts`
- **Impact** : **Critique**. Amélioration drastique des performances.

#### 3. Ajouter les Headers de Sécurité Manquants

- **Problème** : Le fichier `next.config.ts` ne configure pas les headers de sécurité HTTP essentiels (CSP, X-Frame-Options, etc.), ce qui expose l'application à des attaques courantes (XSS, clickjacking).
- **Action** : Ajouter une fonction `headers()` dans `next.config.ts` pour définir des headers de sécurité stricts, comme recommandé dans le document `docs/CODEBASE_ANALYSIS.md`.
- **Fichiers concernés** : `next.config.ts`.
- **Impact** : **Élevé**. Amélioration de la posture de sécurité de l'application.

---

### P1 - Important (Maintenabilité et bonnes pratiques)

#### 1. Créer une Couche de Services dédiée

- **Problème** : Les appels `fetch` à l'API externe sont disséminés dans les fichiers de routes. Cela rend le code difficile à tester et à maintenir.
- **Action** :
  1.  Créer un dossier `src/services`.
  2.  Créer des fichiers par domaine (ex: `greg.service.ts`, `reservations.service.ts`).
  3.  Centraliser tous les appels `fetch` vers l'API externe dans ces services. Les Route Handlers appelleront ensuite ces services.
- **Impact** : **Élevé**. Meilleure séparation des responsabilités, code plus testable.

#### 2. Mettre en place une Stratégie de Cache

- **Problème** : Les données de l'API externe sont récupérées à chaque requête, même si elles changent peu.
- **Action** : Utiliser les options de `fetch` de Next.js pour mettre en cache les requêtes GET qui peuvent l'être (ex: liste des catégories, liste des utilisateurs).
  ```typescript
  // Exemple dans un service
  await fetch(url, { next: { revalidate: 3600 } }); // Cache pendant 1 heure
  ```
- **Impact** : **Moyen à Élevé**. Réduction du temps de chargement et du nombre d'appels à l'API externe.

#### 3. Mettre en Place les Tests

- **Problème** : Couverture de tests de 0%.
- **Action** :
  1.  Suivre le guide `docs/TESTING_SETUP.md` pour installer et configurer **Vitest** et **React Testing Library**.
  2.  Écrire les premiers tests unitaires pour les fonctions critiques dans `src/lib/utils.ts`.
  3.  Écrire des tests pour les nouveaux services d'API (en mockant `fetch`).
- **Impact** : **Élevé**. Sécurise les futurs développements et refactorisations.

---

### P2 - Recommandé (Qualité de vie et optimisations)

#### 1. Factoriser les Composants UI Dupliqués

- **Problème** : Le document `docs/CODEBASE_ANALYSIS.md` identifie de la duplication dans les composants (tables, logiques de suppression).
- **Action** :
  1.  Créer un composant générique `DataTable` réutilisable.
  2.  Créer un hook générique `useDeleteMutation` pour factoriser la logique de suppression et d'affichage des toasts.
- **Impact** : **Moyen**. Réduction du code dupliqué côté front-end.

#### 2. Optimiser le "Bundle Size" avec le Code Splitting

- **Problème** : Les modules et composants lourds sont probablement chargés au démarrage de l'application.
- **Action** : Identifier les composants les plus lourds (ex: dashboards complexes) et les charger dynamiquement avec `next/dynamic`.
  ```tsx
  import dynamic from 'next/dynamic';
  const HeavyDashboard = dynamic(
    () => import('@/features/dashboard/HeavyDashboard'),
    { ssr: false }
  );
  ```
- **Impact** : **Moyen**. Amélioration du temps de chargement initial perçu.
