# 🔌 Configuration des APIs Google Cloud pour Firebase Functions

## APIs requises

Pour déployer les Cloud Functions Firebase, les APIs suivantes doivent être activées :

### 1. Cloud Build API

**Obligatoire** pour la compilation et construction des fonctions.

🔗 **Activation directe** : [cloudbuild.googleapis.com](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=portail-jhmh)

```bash
# Ou via gcloud CLI
gcloud services enable cloudbuild.googleapis.com --project=portail-jhmh
```

### 2. Artifact Registry API

**Obligatoire** pour stocker les images des fonctions.

🔗 **Activation directe** : [artifactregistry.googleapis.com](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=portail-jhmh)

```bash
# Ou via gcloud CLI
gcloud services enable artifactregistry.googleapis.com --project=portail-jhmh
```

### 3. APIs additionnelles (généralement auto-activées)

- **Cloud Functions API** : `cloudfunctions.googleapis.com`
- **Identity Platform API** : `identitytoolkit.googleapis.com`
- **Cloud Run API** : `run.googleapis.com`
- **Eventarc API** : `eventarc.googleapis.com`
- **Cloud Pub/Sub API** : `pubsub.googleapis.com`
- **Cloud Storage API** : `storage.googleapis.com`

## Vérification des APIs

```bash
# Vérifier toutes les APIs activées
gcloud services list --enabled --project=portail-jhmh

# Vérifier une API spécifique
gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" --project=portail-jhmh
```

## Activation en lot

```bash
# Activer toutes les APIs nécessaires
gcloud services enable \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  cloudfunctions.googleapis.com \
  identitytoolkit.googleapis.com \
  run.googleapis.com \
  eventarc.googleapis.com \
  pubsub.googleapis.com \
  storage.googleapis.com \
  --project=portail-jhmh
```

## 🔧 Configuration CI/CD avec Node.js

### Cloud Functions Node.js/TypeScript

Le projet utilise maintenant **Node.js 20 avec TypeScript** pour les Cloud Functions. Cette approche est plus simple et plus fiable pour les déploiements CI/CD.

**Configuration des workflows GitHub Actions :**

```yaml
- name: 🔒 Deploy Cloud Functions
  run: |
    echo "🔒 Déploiement des Cloud Functions Node.js..."

    # Installation de Firebase CLI
    npm install -g firebase-tools

    # Authentification avec service account
    echo "$FIREBASE_SERVICE_ACCOUNT" > /tmp/service-account.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/service-account.json

    # Installation et build des Cloud Functions
    cd functions
    npm ci
    npm run build
    npm run test
    cd ..

    # Déploiement
    firebase deploy --only functions --project portail-jhmh
```

### 🧪 Test local

Pour tester les Cloud Functions localement :

```bash
# Dans le répertoire functions/
npm install
npm run build
npm run test

# Démarrer l'émulateur Firebase
npm run serve

# Ou déployer directement
npm run deploy
```

### 📦 Structure des fichiers

```
functions/
├── src/
│   ├── index.ts          # Cloud Functions principales
│   └── test.ts           # Tests de validation
├── lib/                  # Code compilé (généré)
├── package.json          # Dépendances Node.js
├── tsconfig.json         # Configuration TypeScript
└── .gitignore            # Ignorer node_modules et lib/
```

### ⚙️ Scripts disponibles

```bash
npm run build        # Compiler TypeScript
npm run test         # Exécuter les tests
npm run serve        # Émulateur Firebase local
npm run deploy       # Déployer vers Firebase
npm run logs         # Voir les logs Firebase
```

## 🚨 Dépannage

### 1. Erreur "API not enabled"

- Vérifier que toutes les APIs sont activées
- Attendre 1-2 minutes après activation

### 2. Erreur "Permission denied"

- Vérifier les permissions du service account Firebase
- Le service account doit avoir le rôle `Firebase Admin`

### 3. Erreur "Build failed"

- Vérifier que TypeScript compile sans erreur : `npm run build`
- Vérifier que les tests passent : `npm run test`
- Vérifier la version Node.js : doit être 20+

### 4. Erreur "Quota exceeded"

- Vérifier les quotas Google Cloud Console
- Passer à un plan payant si nécessaire

## 🎯 Avantages Node.js vs Python

✅ **Node.js/TypeScript :**

- Déploiement CI/CD plus simple et fiable
- Pas de problème d'environnement virtuel
- Types TypeScript pour moins d'erreurs
- Performance optimale pour Firebase
- Écosystème JavaScript/NPM riche

❌ **Python (ancien) :**

- Problèmes d'environnement virtuel dans CI/CD
- Configuration complexe pour GitHub Actions
- Dépendances moins bien gérées

## 🔗 Liens utiles

- [Console Google Cloud APIs](https://console.cloud.google.com/apis/dashboard?project=portail-jhmh)
- [Documentation Firebase Functions Node.js](https://firebase.google.com/docs/functions/typescript)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
