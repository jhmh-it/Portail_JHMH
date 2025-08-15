# 📚 Documentation du Portail JHMH

## Vue d'ensemble

Cette documentation est conçue pour faciliter la collaboration entre
développeurs et agents IA (comme Cursor) en fournissant un contexte complet sur
l'architecture, les conventions et les processus du projet.

## 🚀 Déploiement

Le projet est déployé automatiquement sur **Vercel** :

- **Production** : Push sur la branche `main`
- **Preview** : Automatique pour chaque Pull Request
- **Documentation** : [Guide de déploiement](./DEPLOYMENT.md)

## 🔒 Sécurité et Authentification

### Restriction de domaine

L'authentification Google est restreinte exclusivement aux utilisateurs avec des
emails `@jhmh.com`. Cette restriction est gérée par l'API Next.js dans
`/api/auth/login`.

## 📖 Table des matières

### 🏗️ Architecture et Structure

- [Architecture du projet](./docs/ARCHITECTURE.md) - Vue d'ensemble de
  l'architecture technique
- [Structure des dossiers](./docs/FOLDER_STRUCTURE.md) - Organisation détaillée
  du code

### 💻 Développement

- [Guide de développement](./docs/DEVELOPMENT.md) - Processus et méthodologie
- [Guide de style](./docs/STYLE_GUIDE.md) - Conventions de code et formatage
- [Conventions de commits](./docs/COMMITS.md) - Standards pour les messages de
  commit
- [Guide de Tests](./docs/TESTING_SETUP.md) - Configuration et stratégie de
  tests

### 🤖 Collaboration IA

- [Guide pour agents IA](./docs/AI_AGENT_GUIDE.md) - Instructions spécifiques
  pour Cursor et autres LLMs
- [Contexte du projet](./docs/PROJECT_CONTEXT.md) - Informations essentielles
  pour comprendre le projet

### 🔧 Configuration

- [Variables d'environnement](./docs/ENVIRONMENT.md) - Configuration requise
- [Secrets GitHub Actions](./docs/GITHUB_SECRETS_CONFIG.md) - Configuration
  CI/CD

## 🚀 Démarrage rapide

1. **Installation**

   ```bash
   git clone [repo-url]
   cd portail_jhmh
   npm install
   ```

2. **Configuration**
   - Créer `.env.local` avec les variables nécessaires
   - Voir [ENVIRONMENT.md](./docs/ENVIRONMENT.md) pour la liste complète

3. **Développement**

   ```bash
   npm run dev
   ```

4. **Tests et qualité**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

## 🛠️ Stack technique

- **Frontend** : Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend** : Next.js API Routes
- **Base de données** : Firebase Firestore
- **Authentification** : Firebase Auth (Google OAuth)
- **Stockage** : Firebase Storage
- **Déploiement** : Vercel
- **CI/CD** : GitHub Actions

## 📌 Principes clés

- **Documentation vivante** : Mise à jour à chaque changement significatif
- **Contexte complet** : Toute information nécessaire pour comprendre et
  modifier le code
- **Orientée IA** : Structurée pour être facilement comprise par les LLMs
- **Pratique** : Exemples concrets et commandes prêtes à l'emploi
- **Sécurité** : Contrôle d'accès strict avec validation de domaine

## 🔄 Maintenance

Cette documentation doit être maintenue activement. Lors de tout changement
majeur :

1. Mettez à jour les fichiers pertinents
2. Vérifiez la cohérence avec le code actuel
3. Ajoutez des exemples si nécessaire
4. Testez les changements localement avant de pousser

