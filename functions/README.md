# 🔒 Cloud Functions - Restriction d'Authentification JHMH

## 📋 Vue d'ensemble

Cette Cloud Function Firebase restreint l'authentification Google uniquement aux utilisateurs possédant une adresse email avec le domaine `@jhmh.com`. Elle utilise le trigger `before_user_signed_in` pour intercepter les tentatives de connexion avant qu'elles soient finalisées.

## 🚀 Fonctionnalités

### `before_user_signed_in`

- **Déclencheur** : Avant chaque tentative d'authentification
- **Fonction** : Vérifie que l'email se termine par `@jhmh.com`
- **Action** : Autorise ou bloque la connexion avec un message d'erreur personnalisé

### `test_domain_check` (Fonction de test)

- **Endpoint** : `https://your-project.cloudfunctions.net/test_domain_check`
- **Usage** : `?email=test@jhmh.com`
- **Fonction** : Teste la validation des domaines sans authentification

## 🛠️ Installation et Déploiement

### 1. Prérequis

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Vérifier que le projet est configuré
firebase projects:list
```

### 2. Configuration Firebase

Dans la console Firebase, activez **Identity Platform** :

1. Allez dans **Authentication** > **Settings** > **Advanced**
2. Activez **Identity Platform**
3. Cela permettra d'utiliser les triggers `before_user_signed_in`

### 3. Déploiement

```bash
# Depuis la racine du projet
cd functions

# Installer les dépendances Python (optionnel, fait automatiquement)
pip install -r requirements.txt

# Déployer uniquement les fonctions
firebase deploy --only functions

# Ou déployer une fonction spécifique
firebase deploy --only functions:before_user_signed_in
```

## 🔧 Configuration

### Domaines Autorisés

Pour modifier les domaines autorisés, éditez la variable `ALLOWED_DOMAINS` dans `main.py` :

```python
# Actuellement configuré pour JHMH uniquement
ALLOWED_DOMAINS = ["jhmh.com"]

# Pour ajouter d'autres domaines :
ALLOWED_DOMAINS = ["jhmh.com", "partenaire.com", "filiale.fr"]
```

### Messages d'Erreur

Le message d'erreur affiché aux utilisateurs non autorisés peut être personnalisé :

```python
message="Accès restreint aux employés JHMH. Veuillez utiliser votre adresse email professionnelle @jhmh.com"
```

## 🧪 Test

### Test en Local (fonction de test)

```bash
# Après déploiement, tester avec différents emails :
curl "https://your-project.cloudfunctions.net/test_domain_check?email=john@jhmh.com"
# ✅ Résultat : Email autorisé

curl "https://your-project.cloudfunctions.net/test_domain_check?email=user@gmail.com"
# ❌ Résultat : Email bloqué
```

### Test en Situation Réelle

1. **Email autorisé** (`user@jhmh.com`) : Connexion réussie
2. **Email non autorisé** (`user@gmail.com`) : Erreur avec message personnalisé

## 📊 Monitoring

### Logs Firebase

Les tentatives de connexion sont loggées dans Firebase Functions :

```bash
# Voir les logs en temps réel
firebase functions:log --only before_user_signed_in

# Logs disponibles dans la console Firebase > Functions > Logs
```

### Types de Logs

- ✅ `Connexion autorisée pour: user@jhmh.com`
- ❌ `Connexion bloquée pour: user@gmail.com - Domaine non autorisé`
- 🔥 `Erreur lors de la vérification d'authentification: ...`

## 🛡️ Sécurité

### Validation Robuste

- ✅ Vérification du format email avec regex
- ✅ Normalisation (minuscules, trim)
- ✅ Extraction sécurisée du domaine
- ✅ Gestion d'erreurs complète

### Gestion d'Erreurs

- **Erreur de validation** : Bloc avec message clair
- **Erreur interne** : Bloc par sécurité avec message générique
- **Logs détaillés** : Pour le debugging et l'audit

## 🔄 Maintenance

### Ajout de Nouveaux Domaines

1. Modifier `ALLOWED_DOMAINS` dans `main.py`
2. Redéployer : `firebase deploy --only functions:before_user_signed_in`
3. Tester avec la fonction de test

### Surveillance

- **Alertes** : Configurer des alertes sur les erreurs répétées
- **Metrics** : Surveiller le nombre de tentatives bloquées
- **Audit** : Examiner régulièrement les logs d'authentification

## 🚨 Troubleshooting

### Problèmes Courants

1. **Identity Platform non activé**
   - Solution : Activer dans Firebase Console > Authentication > Settings

2. **Fonction ne se déclenche pas**
   - Vérifier le déploiement : `firebase functions:list`
   - Vérifier les logs : `firebase functions:log`

3. **Tous les utilisateurs bloqués**
   - Vérifier `ALLOWED_DOMAINS`
   - Tester avec la fonction de test

### Débogage

```bash
# Vérifier le statut des fonctions
firebase functions:list

# Voir les logs en détail
firebase functions:log --lines 50

# Tester une fonction spécifique
firebase functions:shell
```

## 📝 Notes Importantes

- ⚠️ **Impact** : Cette fonction bloque TOUS les utilisateurs non-@jhmh.com
- 🔄 **Redéploiement** : Nécessaire pour chaque modification
- 📊 **Performance** : Fonction légère, impact minimal sur l'authentification
- 🔒 **Sécurité** : Fonction critique, tester soigneusement avant déploiement

## 🤝 Support

Pour toute question ou problème :

1. Vérifier les logs Firebase Functions
2. Tester avec la fonction de test
3. Consulter la documentation Firebase Identity Platform
