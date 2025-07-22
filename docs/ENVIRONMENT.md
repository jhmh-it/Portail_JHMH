# 🔧 Variables d'Environnement et Configuration

## 📋 Vue d'ensemble

Le projet utilise des variables d'environnement pour gérer les configurations sensibles et spécifiques à chaque environnement (dev, staging, prod).

## 🔐 Fichiers de configuration

### Structure des fichiers

```
.env.local          # Variables locales (dev) - NE PAS COMMITER
.env.production     # Variables production (sur serveur)
.env.test          # Variables pour tests automatisés
```

### Priorité de chargement

1. `.env.production` (en production)
2. `.env.local` (en développement)
3. Variables système

## 📝 Variables requises

### 🔥 Firebase Client (Public)

```bash
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🔒 Firebase Admin (Serveur uniquement)

```bash
# Firebase Admin SDK (Server-side only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=[Format: "-----BEGIN PRIVATE KEY-----\n[Your-Key-Content]\n-----END PRIVATE KEY-----\n"]
```

### 🌐 Application

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Portail JHMH"
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 🔑 Sécurité

```bash
# Security
AUTH_SECRET=your-random-secret-key-min-32-chars
COOKIE_NAME=__session
COOKIE_SECURE=false # true en production
COOKIE_MAX_AGE=604800 # 7 jours en secondes
```

### 📧 Email (Futur)

```bash
# Email Configuration (Future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM="Portail JHMH <noreply@jhmh.com>"
```

### 🗄️ Base de données (Futur)

```bash
# Database (Future - Supabase/Postgres)
DATABASE_URL=postgresql://user:password@localhost:5432/portail_jhmh
DIRECT_URL=postgresql://user:password@localhost:5432/portail_jhmh
```

### 📊 Monitoring (Futur)

```bash
# Monitoring & Analytics
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🔗 APIs Externes

```bash
# API JHMH Externe
JHMH_API_BASE_URL=https://apijhmhportail-22997865276.europe-west1.run.app
JHMH_API_KEY=your-api-key-here
```

## 🔨 Template .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# =====================================================
# CONFIGURATION LOCALE - NE PAS COMMITER
# =====================================================

# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Server-side)
# Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Security
SESSION_SECRET=generate-random-32-char-string

# External APIs
JHMH_API_BASE_URL=https://apijhmhportail-22997865276.europe-west1.run.app
JHMH_API_KEY=your-api-key-here
```

## 🚀 Setup par environnement

### Développement local

```bash
# 1. Créer le fichier .env.local (voir template ci-dessus)
touch .env.local

# 2. Remplir les valeurs Firebase depuis la console
# https://console.firebase.google.com

# 3. Générer SESSION_SECRET
openssl rand -base64 32

# 4. Lancer l'app
npm run dev
```

### Staging

```bash
# Variables spécifiques staging
NEXT_PUBLIC_APP_URL=https://staging.portail-jhmh.com
COOKIE_SECURE=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portail-jhmh-staging
```

### Production

```bash
# Variables spécifiques production
NEXT_PUBLIC_APP_URL=https://portail.jhmh.com
COOKIE_SECURE=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portail-jhmh-prod
NODE_ENV=production
```

## 🔍 Accès aux variables

### Côté client (navigateur)

```typescript
// Uniquement les variables NEXT_PUBLIC_*
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

### Côté serveur

```typescript
// Toutes les variables disponibles
const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const authSecret = process.env.AUTH_SECRET;
```

### Dans les composants

```typescript
// src/lib/firebase-client.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  // ...
};
```

## 🛡️ Sécurité des variables

### ⚠️ NE JAMAIS COMMITER

- `.env.local`
- `.env.production`
- Toute variable contenant :
  - Private keys
  - Passwords
  - API secrets
  - Tokens

### ✅ Bonnes pratiques

1. **Rotation régulière** des secrets
2. **Principe du moindre privilège** pour les API keys
3. **Variables différentes** par environnement
4. **Audit trail** des changements
5. **Encryption** pour les valeurs sensibles

## 🔄 Validation des variables

### Runtime validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Server
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

### Build-time validation

```typescript
// next.config.ts
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
}
```

## 🚨 Troubleshooting

### Variables non définies

```bash
# Vérifier que .env.local existe
ls -la .env.local

# Vérifier le contenu (sans exposer les secrets)
grep "NEXT_PUBLIC" .env.local

# Redémarrer le serveur après changement
npm run dev
```

### Firebase Admin errors

```bash
# Erreur commune : Private key mal formatée
# Solution : Entourer la clé avec des guillemets
FIREBASE_PRIVATE_KEY=[Format: "-----BEGIN PRIVATE KEY-----\n[Your-Key-Content]\n-----END PRIVATE KEY-----\n"]
```

### Cookies non définis

```bash
# En dev : COOKIE_SECURE=false
# En prod : COOKIE_SECURE=true + HTTPS requis
```

## 📚 Ressources

### Documentation officielle

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Admin Setup](https://firebase.google.com/docs/admin/setup)

### Outils

- [direnv](https://direnv.net/) - Chargement automatique .env
- [dotenv-vault](https://www.dotenv.org/docs/security/vault) - Gestion sécurisée

## 🔐 Checklist sécurité

- [ ] `.env.local` dans `.gitignore`
- [ ] Pas de secrets dans le code
- [ ] Variables NEXT_PUBLIC uniquement pour données publiques
- [ ] Rotation régulière des secrets
- [ ] Monitoring des accès non autorisés
- [ ] Backup sécurisé des configurations

---

**⚠️ IMPORTANT** : Ne jamais partager ou commiter des variables d'environnement contenant des données sensibles. En cas de doute, demandez à l'équipe de sécurité.
