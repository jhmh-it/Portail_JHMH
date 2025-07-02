# 🎯 Portail JHMH - Authentification Google avec Firebase Auth

Une application Next.js 15 avec authentification Google via Firebase Auth, construite avec TypeScript, TailwindCSS et TanStack Query.

## 🚀 Fonctionnalités

- ✅ Authentification Google via Firebase Auth
- ✅ Gestion des sessions côté serveur avec cookies HttpOnly
- ✅ Protection des routes avec middleware Next.js
- ✅ Affichage des informations utilisateur et rôles (custom claims)
- ✅ Interface utilisateur moderne avec TailwindCSS
- ✅ Gestion d'état avec TanStack Query
- ✅ Types TypeScript stricts
- ✅ Gestion d'erreurs complète

## 📦 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS v4
- **Authentication**: Firebase Auth + Firebase Admin SDK
- **State Management**: TanStack Query v5
- **HTTP Client**: Axios
- **Cookies**: js-cookie

## 🛠️ Installation

1. **Cloner le repository** (si applicable)
   ```bash
   git clone <repository-url>
   cd portail_jhmh
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer le fichier `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configurer les variables d'environnement** (voir section Configuration)

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet ou utiliser un projet existant
3. Activer l'authentification : Authentication > Sign-in method > Google

### 2. Obtenir les clés de configuration

Dans les paramètres du projet Firebase :
- Aller dans Project Settings > General
- Dans "Your apps", ajouter une app web
- Copier les valeurs de configuration

### 3. Configurer Firebase Admin SDK

1. Aller dans Project Settings > Service accounts
2. Cliquer sur "Generate new private key"
3. Télécharger le fichier JSON
4. Extraire les valeurs nécessaires pour `.env.local`

### 4. Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Firebase Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Backend)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id

# Session Secret (générer une clé aléatoire)
SESSION_SECRET=your_random_session_secret_key_here
```

## 📁 Structure du projet

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/auth/          # Routes API d'authentification
│   │   ├── login/         # POST - Connexion
│   │   ├── logout/        # POST - Déconnexion
│   │   └── me/            # GET - Données utilisateur
│   ├── dashboard/         # Page dashboard (protégée)
│   ├── login/             # Page de connexion
│   ├── layout.tsx         # Layout principal avec providers
│   └── page.tsx           # Page d'accueil (redirections)
├── hooks/                 # Hooks React personnalisés
│   ├── useAuth.ts         # Hook d'authentification
│   └── useUser.ts         # Hook pour données utilisateur
├── lib/                   # Utilitaires et configurations
│   ├── firebase-client.ts # Config Firebase côté client
│   └── firebase-admin.ts  # Config Firebase Admin SDK
├── providers/             # Providers React
│   └── query-provider.tsx # Provider TanStack Query
├── types/                 # Types TypeScript
│   └── auth.ts            # Types d'authentification
└── middleware.ts          # Middleware de protection des routes
```

## 🔐 Gestion de l'authentification

### Flux d'authentification

1. **Connexion** : L'utilisateur clique sur "Se connecter avec Google"
2. **Popup Google** : Authentification via Firebase Auth
3. **Token échange** : Le token ID est envoyé au serveur via `/api/auth/login`
4. **Vérification** : Le serveur vérifie le token avec Firebase Admin SDK
5. **Session** : Un cookie HttpOnly sécurisé est créé
6. **Redirection** : L'utilisateur est redirigé vers `/dashboard`

### Sécurité

- **Cookies HttpOnly** : Protection contre les attaques XSS
- **Middleware** : Protection automatique des routes
- **Vérification serveur** : Tous les tokens sont vérifiés côté serveur
- **Types stricts** : TypeScript pour éviter les erreurs

## 🎨 Interface utilisateur

### Design System

- **Couleurs principales** : Indigo/Blue palette
- **Composants** : Cards, buttons, forms avec design moderne
- **Responsive** : Design adaptatif mobile-first
- **Accessibilité** : Support clavier et screen readers

### Pages

- **`/login`** : Page de connexion avec bouton Google
- **`/dashboard`** : Affichage des infos utilisateur et rôles
- **`/`** : Redirection automatique selon l'état de connexion

## 🧪 Custom Claims (Rôles)

Pour ajouter des rôles à un utilisateur :

```javascript
// Via Firebase Admin SDK
await admin.auth().setCustomUserClaims(uid, {
  roles: ['admin', 'editor'],
  organization: 'JHMH'
});
```

Les rôles apparaîtront automatiquement dans le dashboard.

## 🚀 Déploiement

### Variables d'environnement en production

Assurez-vous de configurer toutes les variables d'environnement dans votre plateforme de déploiement (Vercel, Netlify, etc.).

### Build de production

```bash
npm run build
npm start
```

## 🛠️ Développement

### Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Build de production
npm run start    # Démarrer en mode production
npm run lint     # Linter ESLint
```

### Debugging

- **TanStack Query DevTools** : Activés en développement
- **Console logs** : Erreurs d'authentification loggées
- **Types TypeScript** : Validation stricte

## 🔧 Personnalisation

### Ajouter de nouvelles routes protégées

Dans `src/middleware.ts` :

```typescript
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
```

### Modifier le design

Les styles sont dans TailwindCSS. Personnaliser les couleurs dans la configuration Tailwind ou directement dans les composants.

### Ajouter des providers d'authentification

Modifier `src/lib/firebase-client.ts` pour ajouter d'autres providers (Facebook, Twitter, etc.).

## 📝 Notes importantes

- **Environnement de développement** : Utiliser `http://localhost:3000`
- **CORS** : Configurer les domaines autorisés dans Firebase Console
- **Sécurité** : Ne jamais exposer les clés privées côté client
- **Sessions** : Les cookies expirent après 7 jours par défaut

## 🐛 Résolution de problèmes

### Erreurs communes

1. **"Firebase options object is not valid"**
   - Vérifier que toutes les variables d'environnement sont définies

2. **"Popup blocked"**
   - L'utilisateur doit autoriser les popups pour ce site

3. **"Token expired"**
   - Les tokens Firebase expirent après 1 heure, la session est automatiquement rafraîchie

4. **Redirection infinie**
   - Vérifier la configuration du middleware et les routes

### Debug checklist

- [ ] Variables d'environnement correctement définies
- [ ] Domaine autorisé dans Firebase Console
- [ ] Cookies activés dans le navigateur
- [ ] Pas de bloqueur de popup actif

## 📞 Support

Pour toute question ou problème, consulter :
- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation TanStack Query](https://tanstack.com/query/latest)