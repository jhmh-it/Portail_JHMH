# ⚡ Guide de Démarrage Rapide - Restriction Authentification

## 🎯 Objectif

Restreindre l'authentification Google aux emails `@jhmh.com` uniquement.

## 🚀 Déploiement en 3 étapes

### 1. Activation d'Identity Platform

Dans la [Console Firebase](https://console.firebase.google.com) :

1. **Authentication** > **Settings** > **Advanced**
2. Cliquer sur **Upgrade** pour activer **Identity Platform**
3. ✅ Nécessaire pour les triggers `before_user_signed_in`

### 2. Déploiement

```bash
# Option 1: Script automatisé (recommandé)
cd functions
chmod +x deploy.sh
./deploy.sh

# Option 2: Commande manuelle
firebase deploy --only functions
```

### 3. Vérification

```bash
# Tester la fonction de validation
curl "https://your-project.cloudfunctions.net/test_domain_check?email=test@jhmh.com"
# ✅ Résultat attendu : Email autorisé

curl "https://your-project.cloudfunctions.net/test_domain_check?email=user@gmail.com"
# ❌ Résultat attendu : Email bloqué
```

## 📊 Surveillance

```bash
# Logs en temps réel
firebase functions:log --only before_user_signed_in

# Vérifier les fonctions déployées
firebase functions:list
```

## 🔧 Configuration

### Modifier les domaines autorisés

Éditez `functions/main.py` :

```python
ALLOWED_DOMAINS = ["jhmh.com", "nouveau-domaine.com"]
```

Puis redéployez :

```bash
firebase deploy --only functions:before_user_signed_in
```

## ⚠️ ATTENTION

- **Impact immédiat** : Après déploiement, seuls les emails @jhmh.com peuvent se connecter
- **Test recommandé** : Testez avec un compte @jhmh.com avant déploiement
- **Rollback** : En cas de problème, désactivez la fonction via la console Firebase

## 🆘 En cas de problème

1. **Tous les utilisateurs bloqués** :

   ```bash
   # Désactiver temporairement
   firebase functions:delete before_user_signed_in
   ```

2. **Fonction ne se déclenche pas** :
   - Vérifier Identity Platform activé
   - Vérifier les logs : `firebase functions:log`

3. **Tests locaux** :
   ```bash
   cd functions
   python3 -c "from main import is_email_allowed; print(is_email_allowed('test@jhmh.com'))"
   ```

## 📞 Support

- **Logs détaillés** : Console Firebase > Functions > Logs
- **Documentation** : Voir `README.md` pour plus de détails
- **Rollback** : Supprimez la fonction si nécessaire
