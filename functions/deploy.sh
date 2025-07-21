#!/bin/bash

# 🚀 Script de Déploiement - Cloud Functions JHMH
# Restriction d'authentification aux domaines @jhmh.com

set -e  # Arrêter en cas d'erreur

echo "🔒 Déploiement des Cloud Functions de restriction d'authentification JHMH"
echo "=================================================================="

# Vérifications préalables
echo "🔍 Vérifications préalables..."

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé. Installation requise :"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! firebase projects:list &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Firebase. Connexion requise :"
    echo "   firebase login"
    exit 1
fi

# Afficher le projet actuel
echo "📋 Projet Firebase actuel :"
firebase use

read -p "🤔 Voulez-vous continuer avec ce projet ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt introuvable"
    exit 1
fi

# Option : Tester localement avant déploiement
read -p "🧪 Voulez-vous exécuter les tests de validation ? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "🧪 Exécution des tests de validation..."
    
    # Test de base de la validation d'email
    python3 -c "
import sys
sys.path.append('.')
from main import is_email_allowed

# Tests
tests = [
    ('user@jhmh.com', True),
    ('test.user@jhmh.com', True),
    ('user@gmail.com', False),
    ('user@hotmail.com', False),
    ('invalid-email', False),
    ('', False)
]

all_passed = True
for email, expected in tests:
    result = is_email_allowed(email)
    status = '✅' if result == expected else '❌'
    print(f'{status} {email} -> {result} (attendu: {expected})')
    if result != expected:
        all_passed = False

if all_passed:
    print('🎉 Tous les tests passent !')
else:
    print('❌ Certains tests ont échoué')
    sys.exit(1)
"
    
    if [ $? -ne 0 ]; then
        echo "❌ Les tests ont échoué. Vérifiez le code avant déploiement."
        exit 1
    fi
fi

# Déploiement
echo "🚀 Déploiement des fonctions..."
echo "   - before_user_signed_in (restriction de domaine)"
echo "   - test_domain_check (fonction de test)"

# Déployer seulement les fonctions
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Déploiement réussi !"
    echo "=================================================================="
    echo "📋 Fonctions déployées :"
    echo "   ✅ before_user_signed_in - Restriction authentification"
    echo "   ✅ test_domain_check - Fonction de test"
    echo ""
    echo "🧪 Test de la fonction :"
    echo "   Tester avec : curl 'https://your-project.cloudfunctions.net/test_domain_check?email=test@jhmh.com'"
    echo ""
    echo "📊 Surveillance :"
    echo "   Logs : firebase functions:log --only before_user_signed_in"
    echo "   Console : https://console.firebase.google.com/project/$(firebase use | grep -o '([^)]*)')/functions"
    echo ""
    echo "⚠️  IMPORTANT : Seuls les emails @jhmh.com peuvent maintenant se connecter !"
    echo "=================================================================="
else
    echo "❌ Échec du déploiement"
    exit 1
fi 