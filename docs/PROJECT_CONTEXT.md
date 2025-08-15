# 🏢 Contexte du Projet - Portail JHMH

## 📋 Vue d'ensemble du projet

### Description

Le **Portail JHMH** est une application web d'entreprise moderne conçue pour
centraliser l'accès aux différents services et outils internes de la société
JHMH. Il sert de point d'entrée unique pour les employés, avec une
authentification sécurisée et une gestion des rôles granulaire.

### Objectifs métier

1. **Centralisation** : Un seul point d'accès pour tous les outils
2. **Sécurité** : Authentification robuste avec gestion des permissions
3. **Productivité** : Interface moderne et intuitive
4. **Évolutivité** : Architecture permettant l'ajout facile de nouveaux modules

### Utilisateurs cibles

- **Employés JHMH** : Accès aux outils quotidiens
- **Managers** : Tableaux de bord et rapports
- **Administrateurs** : Gestion des accès et configurations

## 🏗️ État actuel du projet

### Phase actuelle : **Foundation** (v0.1.0)

- ✅ Architecture de base Next.js 15
- ✅ Authentification Firebase intégrée
- ✅ Système de toasts et notifications
- ✅ Middleware de sécurité
- ✅ Structure de composants modulaire
- ✅ Configuration ESLint/Prettier
- ✅ Git hooks automatisés

### Prochaines phases planifiées

1. **Phase 2 - Core Features** (v0.2.0)
   - Gestion des utilisateurs
   - Dashboard principal
   - Navigation multi-niveaux
   - Système de permissions

2. **Phase 3 - Modules métier** (v0.3.0)
   - Module RH
   - Module Finance
   - Module Projets

## 🔑 Décisions techniques importantes

### 1. Next.js App Router

**Pourquoi** : Performance optimale, Server Components, meilleur SEO **Impact**
: Structure des fichiers différente, composants serveur/client

### 2. Firebase Authentication

**Pourquoi** : Solution robuste, OAuth intégré, scalable **Impact** : Cookies
httpOnly, middleware custom, gestion des sessions

### 3. TanStack Query + Zustand

**Pourquoi** : Séparation claire entre server state et UI state **Impact** :
Patterns spécifiques pour data fetching et gestion d'état

### 4. TailwindCSS + Shadcn UI

**Pourquoi** : Développement rapide, composants accessibles, personnalisation
facile **Impact** : Pas de CSS custom, utilisation des primitives Radix

## 📊 Architecture des données

### Modèle utilisateur

```typescript
interface User {
  uid: string; // ID Firebase
  email: string; // Email de connexion
  displayName?: string; // Nom affiché
  photoURL?: string; // Avatar
  roles: string[]; // Rôles assignés (custom claims)
  metadata: {
    createdAt: Date;
    lastLoginAt: Date;
    department?: string;
    position?: string;
  };
}
```

### Hiérarchie des rôles

1. **super_admin** : Accès total
2. **admin** : Gestion utilisateurs et configuration
3. **manager** : Accès aux rapports et analytics
4. **user** : Accès standard
5. **guest** : Accès limité/temporaire

### Sources de données

- **Firebase Auth** : Authentification et profils de base
- **Firestore** : Données métier (à implémenter)
- **API externes** : Intégrations futures (ERP, CRM, etc.)

## 🔐 Sécurité et conformité

### Mesures de sécurité

- Authentification OAuth 2.0 (Google)
- Sessions via cookies httpOnly
- Middleware de protection des routes
- Validation Zod sur toutes les entrées
- Rate limiting (à implémenter)
- Audit logs (à implémenter)

### Conformité

- RGPD : Gestion des données personnelles
- Sécurité : Standards OWASP
- Accessibilité : WCAG 2.1 AA

## 🌍 Environnements

### Développement (local)

- URL : http://localhost:3000
- Firebase : Projet de dev
- Features flags : Toutes activées

### Staging (à configurer)

- URL : https://staging.portail-jhmh.com
- Firebase : Projet staging
- Features flags : Selon tests

### Production (à configurer)

- URL : https://portail.jhmh.com
- Firebase : Projet production
- Features flags : Progressif

## 🚀 Flux de travail principaux

### 1. Connexion utilisateur

```
Utilisateur → Page login → Google OAuth → Firebase Auth
    ↓
Cookie créé → Middleware vérifie → Dashboard
    ↓
Récupération roles → Affichage modules autorisés
```

### 2. Accès à un module

```
Click module → Vérification permissions (middleware)
    ↓
Si autorisé → Chargement module → Fetch données
    ↓
Si non autorisé → Redirection + Toast erreur
```

### 3. Actions métier

```
Action utilisateur → Validation client (Zod)
    ↓
API call → Validation serveur → Vérification permissions
    ↓
Exécution → Mise à jour UI → Notification succès/erreur
```

## 📈 Métriques clés

### Performance cibles

- **LCP** : < 2.5s
- **FID** : < 100ms
- **CLS** : < 0.1
- **TTFB** : < 600ms

### Utilisation attendue

- **Utilisateurs simultanés** : 100-500
- **Pics d'usage** : 9h-10h, 14h-15h
- **Volume données** : Modéré (< 1GB/jour)

## 🔄 Intégrations futures

### Systèmes internes

1. **ERP** : Synchronisation données employés
2. **CRM** : Accès aux données clients
3. **Email** : Intégration Gmail/Outlook
4. **Calendar** : Gestion des agendas

### Services externes

1. **Slack** : Notifications et alertes
2. **Teams** : Collaboration
3. **Drive/SharePoint** : Documents

## 🎯 Problématiques à résoudre

### Court terme

- [ ] Implémentation du système de permissions granulaire
- [ ] Dashboard personnalisable par rôle
- [ ] Système de notifications temps réel
- [ ] Mode offline basique

### Moyen terme

- [ ] Multi-tenancy pour filiales
- [ ] API publique pour intégrations
- [ ] Mobile app (React Native)
- [ ] Analytics avancés

### Long terme

- [ ] IA/ML pour suggestions
- [ ] Automatisation workflows
- [ ] Voice UI
- [ ] Blockchain pour audit trail

## 💡 Conventions spécifiques JHMH

### Terminologie métier

- **Collaborateur** : Terme préféré à "employé"
- **Espace** : Module ou section de l'app
- **Gestionnaire** : Manager avec droits étendus

### Branding

- **Couleurs** : Bleu corporate (#0066CC)
- **Ton** : Professionnel mais accessible
- **Langue** : Français par défaut

## 📚 Documentation complémentaire

### Interne

- [Architecture technique](./ARCHITECTURE.md)
- [Guide de développement](./DEVELOPMENT.md)
- [Conventions de code](./STYLE_GUIDE.md)

### Externe

- Confluence JHMH : [URL interne]
- Figma designs : [URL Figma]
- Specs API : [URL Swagger]

## 🤝 Contacts clés

### Technique

- **Lead Dev** : [Nom]
- **Architect** : [Nom]
- **DevOps** : [Nom]

### Métier

- **Product Owner** : [Nom]
- **UX Designer** : [Nom]
- **Project Manager** : [Nom]

---

**Note pour les agents IA** : Ce document contient le contexte essentiel du
projet. Référez-vous y pour comprendre les décisions, contraintes et objectifs
avant toute implémentation.
