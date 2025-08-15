# 📝 Conventions de Commits

## 🎯 Pourquoi des conventions ?

Des messages de commit standardisés permettent :

- 📖 Un historique Git lisible et compréhensible
- 🔄 La génération automatique du CHANGELOG
- 🔍 Une recherche facilitée dans l'historique
- 🤖 L'automatisation (semantic release, CI/CD)
- 👥 Une meilleure collaboration en équipe

## 📋 Format des commits

Nous suivons la convention **Conventional Commits** :

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Structure détaillée

```
type(scope): description courte (max 72 caractères)
       │          │
       │          └─⫸ Description impérative au présent: "change" pas "changed" ni "changes"
       │
       └─⫸ Scope optionnel: auth|api|ui|db|config|...

[body optionnel]
Plus de détails sur les changements, la motivation, etc.
Peut contenir plusieurs paragraphes.

[footer optionnel]
BREAKING CHANGE: description
Closes #123, #456
```

## 🏷️ Types de commits

### Commits principaux

| Type       | Description                          | Emoji | Exemple                                    |
| ---------- | ------------------------------------ | ----- | ------------------------------------------ |
| `feat`     | Nouvelle fonctionnalité              | ✨    | `feat(auth): ajout connexion Google OAuth` |
| `fix`      | Correction de bug                    | 🐛    | `fix(api): correction timeout sur /users`  |
| `docs`     | Documentation uniquement             | 📚    | `docs: mise à jour guide installation`     |
| `style`    | Formatage, pas de changement de code | 💄    | `style: correction indentation`            |
| `refactor` | Refactoring sans ajout/fix           | ♻️    | `refactor(hooks): simplification useAuth`  |
| `perf`     | Amélioration performance             | ⚡    | `perf: optimisation chargement images`     |
| `test`     | Ajout/modification tests             | ✅    | `test: ajout tests unitaires UserService`  |
| `build`    | Build system, dépendances            | 📦    | `build: mise à jour Next.js 15.3.4`        |
| `ci`       | Configuration CI/CD                  | 👷    | `ci: ajout workflow GitHub Actions`        |
| `chore`    | Maintenance, tâches diverses         | 🔧    | `chore: mise à jour .gitignore`            |
| `revert`   | Revert un commit précédent           | ⏪    | `revert: revert "feat: ajout feature X"`   |

### Types spéciaux

| Type   | Description           | Utilisation                      |
| ------ | --------------------- | -------------------------------- |
| `wip`  | Work In Progress      | Branches personnelles uniquement |
| `init` | Initialisation projet | Premier commit uniquement        |

## 🎯 Scopes recommandés

Les scopes permettent de préciser la partie du code impactée :

```
feat(auth): ...      # Authentification
fix(api): ...        # Routes API
docs(readme): ...    # README spécifiquement
style(ui): ...       # Interface utilisateur
refactor(hooks): ... # Custom hooks React
test(e2e): ...       # Tests end-to-end
build(deps): ...     # Dépendances
```

### Scopes du projet

- **auth** : Authentification Firebase
- **api** : Routes API Next.js
- **ui** : Composants interface
- **db** : Base de données/Firebase
- **hooks** : Custom React hooks
- **middleware** : Middleware Next.js
- **config** : Configuration
- **types** : Types TypeScript
- **stores** : Stores Zustand

## 📝 Exemples de bons commits

### Feature complète

```bash
feat(dashboard): ajout widget statistiques utilisateurs

- Affichage nombre d'utilisateurs actifs
- Graphique d'évolution sur 30 jours
- Export des données en CSV
- Responsive mobile/desktop

Closes #45
```

### Fix avec contexte

```bash
fix(auth): correction boucle infinie redirection login

Le middleware redirige vers /login qui déclenche à nouveau
le middleware. Ajout d'une exception pour /login dans la
vérification d'authentification.

Fixes #89
```

### Breaking change

```bash
feat(api)!: restructuration endpoints API v2

BREAKING CHANGE: Les endpoints API ont été restructurés
- /api/user/:id → /api/v2/users/:id
- /api/posts → /api/v2/posts
- Ajout pagination obligatoire sur les listes

Migration:
- Mettre à jour tous les appels API côté client
- Adapter les paramètres de pagination
```

### Refactoring

```bash
refactor(components): extraction logique commune UserCard

- Création hook useUserCard pour logique partagée
- Simplification du composant de 150 à 80 lignes
- Amélioration testabilité
```

## ❌ Mauvais exemples

```bash
# ❌ Trop vague
fix: correction bug

# ❌ Pas impératif
feat: added new feature

# ❌ Trop long
feat: ajout d'une nouvelle fonctionnalité permettant aux utilisateurs de se connecter avec Google OAuth et également avec Facebook et Twitter

# ❌ Plusieurs changements
fix: correction auth et mise à jour UI et ajout tests

# ❌ Pas de type
Update components

# ❌ Type incorrect
style: ajout nouvelle page dashboard
```

## ✅ Bons exemples équivalents

```bash
# ✅ Précis
fix(auth): correction validation email format

# ✅ Impératif
feat: add user profile page

# ✅ Concis avec body si nécessaire
feat(auth): ajout connexion réseaux sociaux

Support pour Google, Facebook et Twitter OAuth.
Configuration dans .env.local requise.

# ✅ Un commit par changement
fix(auth): correction validation token
feat(ui): mise à jour design boutons
test(auth): ajout tests validation

# ✅ Type correct
feat: ajout page dashboard utilisateur
```

## 🔄 Workflow Git avec les commits

### 1. Pendant le développement

```bash
# Commits fréquents et atomiques
git add src/components/UserCard.tsx
git commit -m "feat(ui): création composant UserCard"

git add src/hooks/useUser.ts
git commit -m "feat(hooks): ajout hook useUser"

git add src/api/users/route.ts
git commit -m "feat(api): endpoint GET /api/users"
```

### 2. Avant la PR

```bash
# Optionnel: Squash des commits WIP
git rebase -i HEAD~3

# Vérifier l'historique
git log --oneline -10
```

### 3. Merge de PR

```bash
# Squash merge pour feature branches
git merge --squash feat/user-profile

# Merge commit pour hotfixes
git merge --no-ff hotfix/critical-bug
```

## 🤖 Automatisation

### Commitizen (optionnel)

```bash
# Installation globale
npm install -g commitizen
npm install -g cz-conventional-changelog

# Utilisation
git cz
# Suivre les prompts interactifs
```

### Husky + Commitlint (déjà configuré)

```bash
# Les commits sont automatiquement validés
git commit -m "bad message"  # ❌ Rejeté
git commit -m "feat: good message"  # ✅ Accepté
```

## 📊 Impact sur le CHANGELOG

Les commits bien formatés génèrent automatiquement :

```markdown
## [1.2.0] - 2024-12-10

### ✨ Features

- **auth**: ajout connexion Google OAuth (#45)
- **dashboard**: nouveau widget statistiques (#48)

### 🐛 Bug Fixes

- **api**: correction timeout sur /users (#52)
- **auth**: correction boucle redirection (#89)

### ⚡ Performance

- optimisation chargement images (-50% temps) (#67)
```

## 💡 Conseils pratiques

### 1. Pensez au futur vous

Un bon message de commit répond à : "Si j'applique ce commit, il va..."

### 2. Atomicité

Un commit = un changement logique. Si vous devez utiliser "et" dans la
description, faites deux commits.

### 3. Contexte dans le body

```bash
# ✅ Bon: Contexte utile
fix(auth): augmentation timeout JWT à 7 jours

Les utilisateurs se plaignaient de devoir se reconnecter
trop souvent. Passage de 24h à 7 jours suite aux retours.
```

### 4. Références

Toujours référencer les issues/tickets :

```bash
feat(payment): intégration Stripe

Implements #123
See also #120, #121
```

### 5. Revue avant push

```bash
# Vérifier ses commits avant push
git log --oneline origin/main..HEAD

# Amender le dernier commit si nécessaire
git commit --amend
```

## 🚀 Quick Reference

```bash
# Feature
feat(scope): add amazing feature

# Fix
fix(scope): resolve issue with X

# BREAKING CHANGE
feat(scope)!: change API structure

# Avec issue
fix(scope): resolve memory leak

Closes #42

# Multiple issues
feat(scope): add new dashboard

Implements #10, #11
Fixes #12
```

---

**Note** : Ce guide est appliqué automatiquement via Husky. Les commits non
conformes seront rejetés avec un message d'aide.
