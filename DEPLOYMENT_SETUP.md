# 🚀 Guide de Setup - Workflows de Déploiement

## ✅ Checklist de Configuration

### 1. **GitHub Secrets & Variables**

Configurez les secrets dans **Settings** > **Secrets and variables** > **Actions** :

```bash
# 🔑 Secrets obligatoires
FIREBASE_SERVICE_ACCOUNT_PORTAIL_JHMH   # JSON du service account Firebase
FIREBASE_TOKEN                          # Token Firebase CLI

# 🔧 Pour obtenir FIREBASE_TOKEN :
firebase login:ci

# 🔧 Pour obtenir le Service Account :
# Console Firebase > Project Settings > Service Accounts > Generate new private key
```

### 2. **Firebase Projects Setup**

Créez les projets Firebase :

```bash
# 🏗️ Créer les projets
firebase projects:create portail-jhmh-staging
firebase projects:create portail-jhmh  # ou utiliser existant

# 🔧 Activer les services
firebase use portail-jhmh-staging
firebase hosting:enable
firebase functions:enable

firebase use portail-jhmh
firebase hosting:enable
firebase functions:enable

# 🔒 Activer Identity Platform (OBLIGATOIRE pour auth restriction)
# Console Firebase > Authentication > Settings > Advanced > Upgrade to Identity Platform
```

### 3. **Scripts Setup**

```bash
# 📁 Créer le dossier scripts
mkdir -p scripts

# 🔄 Copier le script de déploiement (déjà créé dans scripts/deploy.sh)
chmod +x scripts/deploy.sh

# 📦 Setup Husky
npm run setup:hooks
```

### 4. **Environment Files**

Créez `.env.local` :

```bash
# 🔧 Variables Firebase (publiques)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=portail-jhmh.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portail-jhmh
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=portail-jhmh.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# 🔐 Variables privées (server-only)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@portail-jhmh.iam.gserviceaccount.com
```

### 5. **Branch Protection Rules**

Dans **Settings** > **Branches**, protégez `main` :

```yaml
Protection Rules:
✅ Require pull request reviews before merging
✅ Require status checks to pass before merging
  - CI - Quality Checks / ci-success
  - PR Preview & Validation / pr-summary
✅ Require branches to be up to date before merging
✅ Restrict pushes that create files larger than 100MB
```

## 🧪 Tests des Workflows

### 1. **Test CI Workflow**

```bash
# 🔧 Créer une branche test
git checkout -b test/workflows-setup

# ✏️ Faire un petit changement
echo "// Test workflows" >> src/app/page.tsx

# 📤 Push pour déclencher CI
git add .
git commit -m "test: trigger CI workflow"
git push origin test/workflows-setup
```

### 2. **Test PR Workflow**

```bash
# 🔄 Créer une PR depuis GitHub
gh pr create --title "test: workflows setup" --body "Test des workflows de déploiement"

# ✅ Vérifier que tous les checks passent
# ✅ Vérifier que la preview URL est générée
# ✅ Vérifier que le commentaire automatique apparaît
```

### 3. **Test Staging Workflow**

```bash
# 🚧 Merger vers develop
git checkout develop
git merge test/workflows-setup
git push origin develop

# ✅ Vérifier le déploiement staging automatique
# ✅ Tester https://portail-jhmh-staging.web.app
```

### 4. **Test Production Workflow**

```bash
# 🚀 Merger vers main
git checkout main
git merge develop
git push origin main

# ✅ Vérifier le déploiement production automatique
# ✅ Tester https://portail-jhmh.web.app
```

## 🛠️ Commandes Utiles

### **Setup Initial**

```bash
# 🏗️ Setup complet du projet
npm run setup:dev               # Installe toutes les dépendances
npm run setup:firebase          # Configure Firebase CLI
npm run setup:hooks            # Configure Husky

# 🧪 Valider la configuration
npm run validate:pre-deploy     # Suite complète de tests
npm run test:functions         # Tests Cloud Functions
```

### **Déploiement Manuel**

```bash
# 🚧 Staging
./scripts/deploy.sh --env staging

# 🚀 Production (avec confirmation)
./scripts/deploy.sh --env production

# 🔥 Hotfix (sans confirmation)
./scripts/deploy.sh --env production --force

# 🔍 Simulation (dry-run)
./scripts/deploy.sh --env staging --dry-run
```

### **Monitoring**

```bash
# 📊 Status global
npm run status

# 🏥 Health checks
npm run health                  # Production
npm run health:staging          # Staging

# 📋 Logs
npm run logs:functions          # Logs Cloud Functions
npm run logs:all               # Tous les logs
```

## 🔍 Troubleshooting

### **Problèmes Courants**

#### 1. **"Firebase token expired"**

```bash
# 🔧 Solution
firebase login:ci
# Mettre à jour FIREBASE_TOKEN dans GitHub Secrets
```

#### 2. **"Identity Platform not enabled"**

```bash
# 🔧 Solution
# Console Firebase > Authentication > Settings > Advanced > Upgrade
```

#### 3. **"Cloud Functions deployment failed"**

```bash
# 🔧 Vérifier localement
cd functions
python3 test_validation.py
python3 -m py_compile main.py
```

#### 4. **"Build failed in GitHub Actions"**

```bash
# 🔧 Tester localement
npm run lint
npm run type-check
npm run build
```

#### 5. **"PR Preview not generated"**

```bash
# 🔧 Vérifier
# - Service Account permissions
# - Firebase Hosting enabled
# - Secrets correctement configurés
```

### **Debug des Workflows**

```bash
# 📋 Vérifier les secrets GitHub
gh secret list

# 🔍 Tester Firebase CLI localement
firebase projects:list
firebase use portail-jhmh-staging
firebase hosting:channel:list

# 🧪 Tester les fonctions localement
cd functions
python3 test_validation.py
```

## 📊 Monitoring des Workflows

### **Métriques à Surveiller**

1. **Success Rate** : > 95% sur tous les workflows
2. **Build Time** : CI < 10min, Deploy < 25min
3. **Coverage** : Tous les PRs passent par preview
4. **Security** : 0 vulnérabilité critique

### **Alertes Recommandées**

```yaml
# GitHub Workflow Status
- Échec de déploiement production
- 3+ échecs consécutifs sur staging
- Temps de build > seuils définis

# Application Health
- Uptime < 99%
- Temps de réponse > 3s
- Erreurs Cloud Functions
```

## 🎯 Next Steps

### **Améliorations Futures**

1. **Tests E2E** : Playwright ou Cypress
2. **Monitoring APM** : Sentry, DataDog
3. **Notifications** : Slack/Teams intégration
4. **Blue/Green Deployment** : Zero-downtime
5. **Security Scanning** : CodeQL, Snyk

### **Maintenance Régulière**

- **Hebdomadaire** : Review des métriques workflows
- **Mensuelle** : Mise à jour dépendances
- **Trimestrielle** : Optimisation performances

---

## 🎉 Félicitations !

Votre pipeline CI/CD est maintenant configuré avec :

✅ **4 Workflows GitHub Actions** complets  
✅ **Multi-environnements** (dev, staging, production)  
✅ **Sécurité renforcée** avec Cloud Functions  
✅ **Quality Gates** automatiques  
✅ **Déploiement manuel** sécurisé  
✅ **Monitoring** et health checks

**Votre équipe peut maintenant développer et déployer en toute sécurité ! 🚀**
