# 🔐 Configuration des Secrets GitHub Actions

## 📋 Vue d'ensemble

Ce document liste tous les secrets GitHub Actions nécessaires pour que les workflows CI/CD fonctionnent correctement avec Firebase et Next.js.

## 🔑 Secrets Obligatoires

### **Firebase Authentication & Admin**

```bash
# 🔥 Firebase Service Account (pour déploiement)
FIREBASE_SERVICE_ACCOUNT_PORTAIL_JHMH
# Contenu : JSON complet du service account Firebase
# Source : Console Firebase > Project Settings > Service Accounts > Generate new private key
# Utilisation : Authentification Firebase CLI et déploiements (hosting + functions)
```

### **Firebase Configuration (Client)**

```bash
# 🌐 Variables publiques Next.js (prefix NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# 📍 Source : Console Firebase > Project Settings > General > Your apps
```

### **Firebase Configuration (Server)**

```bash
# 🔒 Variables privées (server-only, pas de prefix NEXT_PUBLIC_)
FIREBASE_PROJECT_ID          # ID du projet Firebase
FIREBASE_CLIENT_EMAIL        # Email du service account
FIREBASE_PRIVATE_KEY         # Clé privée du service account (avec \n préservés)

# 📍 Source : Console Firebase > Project Settings > Service Accounts
```

## 🛠️ Configuration Step-by-Step

### **1. Accéder aux Secrets GitHub**

1. Aller sur votre repository GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquer sur **"New repository secret"**

### **2. Obtenir les Valeurs Firebase**

#### **A. Service Account JSON (FIREBASE_SERVICE_ACCOUNT_PORTAIL_JHMH)**

```bash
# 1. Console Firebase > Project Settings > Service Accounts
# 2. Cliquer "Generate new private key"
# 3. Télécharger le fichier JSON
# 4. Copier TOUT le contenu JSON dans le secret GitHub
```

#### **B. Configuration du Service Account**

```bash
# Le service account remplace le token CLI et offre une sécurité renforcée
# Il permet l'authentification pour hosting ET functions
# Plus stable et recommandé pour la production
```

#### **C. Configuration Client (NEXT*PUBLIC*\*)**

```bash
# Console Firebase > Project Settings > General > Your apps
# Section "Firebase SDK snippet" > Config

# Exemple de valeurs :
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=portail-jhmh.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portail-jhmh
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=portail-jhmh.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### **D. Configuration Server (FIREBASE\_\*)**

```bash
# Depuis le fichier Service Account JSON :
FIREBASE_PROJECT_ID=portail-jhmh
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@portail-jhmh.iam.gserviceaccount.com

# ⚠️ ATTENTION pour FIREBASE_PRIVATE_KEY :
# Garder les \n dans la clé privée, exemple :
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

### **3. Validation des Secrets**

Après configuration, vérifiez que les secrets sont bien définis :

```bash
# Dans GitHub Actions, vous pouvez ajouter ce step pour debug :
- name: 🔍 Check Secrets
  run: |
    echo "✅ Firebase Project ID: ${{ secrets.FIREBASE_PROJECT_ID }}"
    echo "✅ Firebase Client Email: ${{ secrets.FIREBASE_CLIENT_EMAIL }}"
    echo "✅ Private Key length: ${#FIREBASE_PRIVATE_KEY}"
  env:
    FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
```

## 🚨 Erreurs Communes

### **1. "Missing required Firebase environment variables"**

```bash
# ❌ Cause : Variables d'environnement non mappées dans workflow
# ✅ Solution : Ajouter env: dans les steps build des workflows
```

### **2. "Invalid private key"**

```bash
# ❌ Cause : Les \n dans FIREBASE_PRIVATE_KEY sont mal formatés
# ✅ Solution : Garder les sauts de ligne comme dans le JSON original
```

### **3. "Failed to authenticate, have you run firebase login?"**

```bash
# ❌ Cause : Service account mal configuré ou invalide
# ✅ Solution : Vérifier FIREBASE_SERVICE_ACCOUNT_PORTAIL_JHMH dans GitHub Secrets
```

### **4. "Service account not found"**

```bash
# ❌ Cause : JSON mal copié ou service account désactivé
# ✅ Solution : Vérifier le JSON et les permissions dans Firebase Console
```

## 📊 Variables par Environnement

### **Development (.env.local)**

```bash
# Toutes les variables listées ci-dessus
# + variables de développement spécifiques
```

### **Staging**

```bash
# Même config que production mais avec :
# - Projet Firebase staging séparé
# - URLs staging dans les CORS
```

### **Production**

```bash
# Configuration principale décrite ci-dessus
```

## 🔄 Mise à Jour des Secrets

### **Quand mettre à jour :**

- **Rotation des clés** : Tous les 6 mois minimum
- **Nouveau service account** : Si changement de permissions
- **Nouveau projet** : Si migration Firebase

### **Process de mise à jour :**

1. Générer nouveaux secrets Firebase
2. Mettre à jour dans GitHub Secrets
3. Tester un déploiement
4. Révoquer anciens secrets

## ✅ Checklist de Validation

- [ ] **FIREBASE_SERVICE_ACCOUNT_PORTAIL_JHMH** : JSON complet copié
- [ ] **NEXT*PUBLIC*\*** : 6 variables publiques définies
- [ ] **FIREBASE\_\*** : 3 variables privées définies
- [ ] **Build test** : `npm run build` fonctionne localement
- [ ] **Déploiement test** : Au moins un workflow réussit

## 📞 Support

En cas de problème :

1. Vérifier les logs GitHub Actions
2. Tester les variables localement
3. Consulter la documentation Firebase
4. Vérifier les permissions du service account

---

**📝 Dernière mise à jour** : Janvier 2025  
**🔗 Workflows concernés** : ci.yml, firebase-hosting-merge.yml, firebase-hosting-pull-request.yml, staging.yml
