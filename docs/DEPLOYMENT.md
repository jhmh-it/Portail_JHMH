# 🚀 Déploiement avec Vercel

## Vue d'ensemble

Le Portail JHMH est maintenant déployé automatiquement sur **Vercel** avec
plusieurs environnements :

## 🔄 Workflow de déploiement

### Production (Automatique)

- **Branche** : `main`
- **URL** : Configurée dans Vercel (URL de production)
- **Déploiement** : Automatique à chaque push sur `main`
- **CI/CD** : Tests obligatoires avant déploiement

### Staging (Automatique)

- **Branche** : `develop`
- **URL** : URL de staging Vercel (format: `portail-jhmh-staging-*.vercel.app`)
- **Déploiement** : Automatique à chaque push sur `develop`
- **CI/CD** : Workflow dédié pour les tests de qualité

### Preview (Automatique)

- **Pull Requests** : Chaque PR reçoit automatiquement une URL de preview
- **Branches** : Toutes les autres branches ont des déploiements de preview
- **URL** : Format `portail-jhmh-<branch>-*.vercel.app`

## 📋 Configuration requise

### Variables d'environnement sur Vercel

Les variables suivantes doivent être configurées dans les paramètres du projet
Vercel :

#### Variables publiques (Client-side)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Variables privées (Server-side)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

#### Autres variables

- `SESSION_SECRET`
- `JHMH_API_BASE_URL`
- `JHMH_API_KEY`

### Configuration par environnement

Dans Vercel, vous pouvez configurer des valeurs différentes pour chaque
environnement :

1. **Production** : Valeurs de production
2. **Preview** : Peut utiliser les mêmes valeurs ou des valeurs de test
3. **Development** : Valeurs de développement local

## 🌿 Workflow Git recommandé

```bash
# 1. Créer une branche feature depuis develop
git checkout develop
git pull origin develop
git checkout -b feat/ma-nouvelle-feature

# 2. Développer et commiter
git add .
git commit -m "feat: ajout de ma nouvelle feature"

# 3. Pousser et créer une PR vers develop
git push origin feat/ma-nouvelle-feature
# Créer une PR sur GitHub vers develop

# 4. Après validation, merger dans develop
# Le staging se déploie automatiquement

# 5. Une fois testé en staging, créer une PR de develop vers main
# La production se déploie automatiquement après merge
```

## 🔧 Configuration locale

Pour le développement local, créez un fichier `.env.local` à la racine du projet
avec toutes les variables ci-dessus.

## 🚨 Restriction de domaine

L'authentification est restreinte aux emails `@jhmh.com` uniquement. Cette
vérification est effectuée dans l'API Next.js `/api/auth/login`.

## 📝 Commandes utiles

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Tests et qualité
npm run test
npm run lint
npm run type-check

# Nettoyage
npm run clean
```

## 🔍 CI/CD

### Workflow principal (CI)

Le workflow GitHub Actions effectue automatiquement sur `main` et `develop` :

- ✅ ESLint
- ✅ Prettier
- ✅ TypeScript check
- ✅ Tests
- ✅ Build
- ✅ Security audit

### Workflow staging

Sur la branche `develop`, un workflow dédié :

- Exécute tous les tests de qualité
- Notifie du déploiement sur Vercel

Le déploiement sur Vercel se fait automatiquement après la réussite des checks
CI.

## 📊 Monitoring

- **Vercel Dashboard** : Accès aux logs, métriques et analytics
- **GitHub Actions** : Status des builds et tests
- **Firebase Console** : Pour Firestore, Storage et Authentication

## 🆘 Dépannage

### Build échoue sur Vercel

1. Vérifiez les logs dans le dashboard Vercel
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Testez le build localement avec `npm run build`

### Erreur d'authentification

1. Vérifiez que l'email est bien `@jhmh.com`
2. Vérifiez les logs dans `/api/auth/login`
3. Assurez-vous que les variables Firebase sont correctes

### Différences entre staging et production

1. Vérifiez les variables d'environnement dans Vercel
2. Assurez-vous que la branche `develop` est à jour avec `main`
3. Testez les fonctionnalités spécifiques en staging avant production
