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

**Solution** : Les workflows GitHub Actions doivent créer l'environnement virtuel Python :

```yaml
- name: 🔒 Deploy Cloud Functions
  run: |
    # Configuration de l'environnement Python
    cd functions
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..

    # Ensuite déployer
    firebase deploy --only functions --project portail-jhmh
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
