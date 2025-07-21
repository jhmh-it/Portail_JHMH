# 📚 Documentation du Portail JHMH

## Vue d'ensemble

Cette documentation est conçue pour faciliter la collaboration entre développeurs et agents IA (comme Cursor) en fournissant un contexte complet sur l'architecture, les conventions et les processus du projet.

## 🔒 Sécurité et Authentification

### Cloud Function de Restriction de Domaine

Le projet inclut une **Cloud Function Firebase** qui restreint l'authentification Google exclusivement aux utilisateurs avec des emails `@jhmh.com`.

📁 **Localisation** : `functions/`

- `main.py` - Fonction de restriction et validation
- `README.md` - Documentation complète
- `QUICK_START.md` - Guide de déploiement rapide
- `deploy.sh` - Script de déploiement automatisé

🚀 **Déploiement rapide** :

```bash
cd functions
firebase deploy --only functions
```

⚠️ **Important** : Activez d'abord **Identity Platform** dans la console Firebase.

## 📖 Table des matières

### 🏗️ Architecture et Structure

- [Architecture du projet](./docs/ARCHITECTURE.md) - Vue d'ensemble de l'architecture technique
- [Structure des dossiers](./docs/FOLDER_STRUCTURE.md) - Organisation détaillée du code
- [Flux de données](./docs/DATA_FLOW.md) - Diagrammes et explications des flux

### 💻 Développement

- [Guide de développement](./docs/DEVELOPMENT.md) - Processus et méthodologie
- [Guide de style](./docs/STYLE_GUIDE.md) - Conventions de code et formatage
- [Conventions de commits](./docs/COMMITS.md) - Standards pour les messages de commit
- [Tests et qualité](./docs/TESTING.md) - Stratégie de tests et assurance qualité

### 🤖 Collaboration IA

- [Guide pour agents IA](./docs/AI_AGENT_GUIDE.md) - Instructions spécifiques pour Cursor et autres LLMs
- [Contexte du projet](./docs/PROJECT_CONTEXT.md) - Informations essentielles pour comprendre le projet

### 🔧 Configuration

- [Variables d'environnement](./docs/ENVIRONMENT.md) - Configuration requise
- [Secrets GitHub Actions](./docs/GITHUB_SECRETS_CONFIG.md) - Configuration Firebase CI/CD
- [Dépendances](./docs/DEPENDENCIES.md) - Packages et leurs rôles

### 📋 Processus

- [Workflow Git](./docs/GIT_WORKFLOW.md) - Branches, merge requests, etc.
- [Déploiement](./docs/DEPLOYMENT.md) - Processus de mise en production

## 🚀 Démarrage rapide

1. **Pour les nouveaux développeurs** : Commencez par [ARCHITECTURE.md](./docs/ARCHITECTURE.md) et [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. **Pour les agents IA** : Lisez d'abord [AI_AGENT_GUIDE.md](./docs/AI_AGENT_GUIDE.md) et [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)
3. **Pour la contribution** : Consultez [STYLE_GUIDE.md](./docs/STYLE_GUIDE.md) et [COMMITS.md](./docs/COMMITS.md)
4. **Pour la sécurité** : Déployez les Cloud Functions de restriction avec [functions/QUICK_START.md](./functions/QUICK_START.md)

## 📌 Principes clés

- **Documentation vivante** : Mise à jour à chaque changement significatif
- **Contexte complet** : Toute information nécessaire pour comprendre et modifier le code
- **Orientée IA** : Structurée pour être facilement comprise par les LLMs
- **Pratique** : Exemples concrets et commandes prêtes à l'emploi
- **Sécurité** : Contrôle d'accès strict avec validation de domaine

## 🔄 Maintenance

Cette documentation doit être maintenue activement. Lors de tout changement majeur :

1. Mettez à jour les fichiers pertinents
2. Vérifiez la cohérence avec le code actuel
3. Ajoutez des exemples si nécessaire
4. Testez les Cloud Functions après modification
