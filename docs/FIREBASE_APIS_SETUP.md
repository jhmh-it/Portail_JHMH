# 🔌 Configuration des APIs Google Cloud pour Firebase Functions

## 🚨 Problème Résolu

L'erreur `Permissions denied enabling artifactregistry.googleapis.com` indique que les **APIs Google Cloud requises** ne sont pas activées pour Firebase Functions.

## ✅ APIs Requises

Firebase Functions nécessite ces 3 APIs Google Cloud :

```bash
✅ cloudfunctions.googleapis.com     # Firebase Cloud Functions (généralement pré-activé)
❌ cloudbuild.googleapis.com         # Google Cloud Build (pour le build des functions)
❌ artifactregistry.googleapis.com   # Artifact Registry (pour stocker les images)
```

## 🔧 Activation Manuelle (Recommandée)

### **Option 1 : Console Google Cloud (Interface)**

1. **Aller sur Google Cloud Console** : https://console.cloud.google.com
2. **Sélectionner le projet** : `portail-jhmh`
3. **Aller dans "APIs & Services" > "Library"**
4. **Activer les APIs suivantes** :

   **Cloud Build API** :
   - URL directe : https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=portail-jhmh
   - Cliquer **"Enable"**

   **Artifact Registry API** :
   - URL directe : https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=portail-jhmh
   - Cliquer **"Enable"**

### **Option 2 : gcloud CLI (Terminal)**

```bash
# S'authentifier avec gcloud
gcloud auth login

# Sélectionner le projet
gcloud config set project portail-jhmh

# Activer les APIs requises
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Vérifier que tout est activé
gcloud services list --enabled --filter="name:(cloudfunctions OR cloudbuild OR artifactregistry)"
```

## 📊 Vérification

Après activation, vérifiez que les 3 APIs sont actives :

```bash
# Via gcloud CLI
gcloud services list --enabled --project=portail-jhmh --filter="name:(cloudfunctions OR cloudbuild OR artifactregistry)"

# Résultat attendu :
# cloudfunctions.googleapis.com
# cloudbuild.googleapis.com
# artifactregistry.googleapis.com
```

## 🔐 Permissions de Service Account (Alternative)

### **Permissions Requises pour Auto-activation**

Si vous préférez que le service account puisse activer les APIs automatiquement :

```bash
# Roles nécessaires pour le service account :
- roles/serviceusage.serviceUsageAdmin    # Pour activer/désactiver les APIs
- roles/cloudfunctions.admin              # Pour déployer les functions
- roles/storage.admin                     # Pour le stockage Firebase
```

### **Commandes pour Assigner les Permissions**

```bash
# Remplacer YOUR-SERVICE-ACCOUNT-EMAIL par l'email du service account
SERVICE_ACCOUNT="firebase-adminsdk-xyz@portail-jhmh.iam.gserviceaccount.com"

# Ajouter les permissions
gcloud projects add-iam-policy-binding portail-jhmh \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding portail-jhmh \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudfunctions.admin"
```

## 🚀 Test du Déploiement

Après activation des APIs, testez le déploiement :

```bash
# En local (si configuré)
cd functions
firebase deploy --only functions --project portail-jhmh

# Ou relancer le workflow GitHub Actions
```

## 📋 Checklist de Résolution

- [ ] **cloudbuild.googleapis.com** activé
- [ ] **artifactregistry.googleapis.com** activé
- [ ] **cloudfunctions.googleapis.com** activé (déjà fait normalement)
- [ ] Test de déploiement réussi
- [ ] Workflow GitHub Actions passe

## 🎯 Erreurs Communes

### **1. "API not enabled"**

```bash
# Solution : Activer l'API manquante via console ou gcloud
gcloud services enable [API_NAME]
```

### **2. "Insufficient permissions"**

```bash
# Solution : Vérifier les roles du service account
gcloud projects get-iam-policy portail-jhmh
```

### **3. "Quota exceeded"**

```bash
# Solution : Vérifier les quotas dans la console Google Cloud
# APIs & Services > Quotas
```

## 📞 Support

**Console Google Cloud** : https://console.cloud.google.com/apis/dashboard?project=portail-jhmh  
**Documentation Firebase** : https://firebase.google.com/docs/functions/manage-functions

---

**📝 Statut** : APIs à activer manuellement (one-time setup)  
**⏱️ Durée** : 2-3 minutes via console Google Cloud  
**🔄 Fréquence** : Une seule fois par projet Firebase

## 🔧 Configuration CI/CD

### Problème fréquent : Environnement virtuel Python manquant

**Erreur** :

```
Error: Failed to find location of Firebase Functions SDK: Missing virtual environment at venv directory.
```

**Cause** : Firebase CLI recherche l'environnement virtuel Python activé et les variables d'environnement appropriées pour déployer les Cloud Functions Python.

**Solution ROBUSTE** : Configuration complète de l'environnement Python avec variables d'environnement explicites :

```yaml
- name: 🔒 Deploy Cloud Functions
  run: |
    # Configuration robuste de l'environnement Python
    echo "🐍 Configuration de l'environnement Python..."
    cd functions

    # Créer l'environnement virtuel
    python3 -m venv venv

    # Définir les variables d'environnement pour Firebase CLI
    export VIRTUAL_ENV="$(pwd)/venv"
    export PATH="$VIRTUAL_ENV/bin:$PATH"
    export PYTHONPATH="$VIRTUAL_ENV/lib/python3.10/site-packages:$PYTHONPATH"

    # Activer l'environnement virtuel
    source venv/bin/activate

    # Vérifier l'environnement
    echo "Python path: $(which python)"
    echo "Pip path: $(which pip)"
    echo "Virtual env: $VIRTUAL_ENV"

    # Installer les dépendances
    pip install --upgrade pip
    pip install -r requirements.txt
    pip show functions-framework || pip install functions-framework

    # Retourner au répertoire racine
    cd ..

    # Déployer avec les variables d'environnement définies
    VIRTUAL_ENV="$(pwd)/functions/venv" \
    PATH="$(pwd)/functions/venv/bin:$PATH" \
    firebase deploy --only functions --project your-project-id
```

### 🧪 Test local

Pour tester la configuration localement, utilisez le script fourni :

```bash
# Exécuter le script de test
./functions/test_deploy.sh

# Ou manuellement :
cd functions
chmod +x test_deploy.sh
./test_deploy.sh
```

**⚠️ Points critiques** :

1. **Variables d'environnement explicites** : `VIRTUAL_ENV`, `PATH`, `PYTHONPATH`
2. **Firebase Functions Framework** : Doit être installé via pip
3. **Activation persistante** : L'environnement virtuel doit rester activé
4. **Chemin absolu** : Utiliser `$(pwd)/functions/venv` pour le chemin complet

### 🔧 Alternative: Configuration système

Si l'approche ci-dessus ne fonctionne pas, utiliser la configuration système :

```yaml
- name: Set up Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.10'

- name: Install Python dependencies globally
  run: |
    pip install --upgrade pip
    pip install functions-framework
    cd functions
    pip install -r requirements.txt
    cd ..

- name: Deploy without venv
  run: |
    firebase deploy --only functions --project your-project-id
```

## 🚨 Dépannage

### 1. Erreur "API not enabled"

- Vérifier que toutes les APIs sont activées
- Attendre 1-2 minutes après activation

### 2. Erreur "Permission denied"

- Vérifier les permissions du service account Firebase
- Le service account doit avoir le rôle `Firebase Admin`

### 3. Erreur "Quota exceeded"

- Vérifier les quotas Google Cloud Console
- Passer à un plan payant si nécessaire

## 🔗 Liens utiles

- [Console Google Cloud APIs](https://console.cloud.google.com/apis/dashboard?project=portail-jhmh)
- [Documentation Firebase Functions](https://firebase.google.com/docs/functions)
- [Troubleshooting Firebase CLI](https://firebase.google.com/docs/cli#troubleshooting)
