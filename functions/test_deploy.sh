#!/bin/bash

# Script de test pour le déploiement des Cloud Functions
# Simule l'environnement GitHub Actions

set -e  # Arrêter en cas d'erreur

echo "🧪 Test de déploiement des Cloud Functions..."

# Aller dans le répertoire functions
cd "$(dirname "$0")"

echo "🐍 Configuration de l'environnement Python..."

# Nettoyer l'ancien environnement virtuel s'il existe
if [ -d "venv" ]; then
    echo "🧹 Suppression de l'ancien environnement virtuel..."
    rm -rf venv
fi

# Créer l'environnement virtuel
echo "📦 Création de l'environnement virtuel..."
python3 -m venv venv

# Définir les variables d'environnement pour Firebase CLI
export VIRTUAL_ENV="$(pwd)/venv"
export PATH="$VIRTUAL_ENV/bin:$PATH"
export PYTHONPATH="$VIRTUAL_ENV/lib/python3.10/site-packages:$PYTHONPATH"

echo "🔧 Variables d'environnement définies :"
echo "  VIRTUAL_ENV: $VIRTUAL_ENV"
echo "  PATH: $PATH"

# Activer l'environnement virtuel
source venv/bin/activate

# Vérifier que l'environnement est correctement configuré
echo "✅ Vérification de l'environnement :"
echo "  Python path: $(which python)"
echo "  Pip path: $(which pip)"
echo "  Virtual env: $VIRTUAL_ENV"

# Installer les dépendances
echo "📦 Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# Vérifier l'installation de Firebase Functions Framework
echo "🔍 Vérification de Firebase Functions Framework..."
if pip show functions-framework >/dev/null 2>&1; then
    echo "✅ Firebase Functions Framework déjà installé"
else
    echo "📦 Installation de Firebase Functions Framework..."
    pip install functions-framework
fi

# Retourner au répertoire racine
cd ..

echo "🚀 Test de déploiement (dry-run)..."
echo "Commande qui serait exécutée :"
echo "VIRTUAL_ENV=\"$(pwd)/functions/venv\" PATH=\"$(pwd)/functions/venv/bin:\$PATH\" firebase deploy --only functions --project portail-jhmh"

echo ""
echo "✅ Configuration Python terminée avec succès !"
echo "🎯 L'environnement est prêt pour le déploiement Firebase Functions"

# Optionnel : tester la validation du domaine
echo ""
echo "🧪 Test optionnel de la fonction de validation..."
cd functions
source venv/bin/activate
if python3 test_validation.py; then
    echo "✅ Tests de validation réussis"
else
    echo "⚠️ Problème avec les tests de validation"
fi
cd ..

echo ""
echo "🎉 Script de test terminé !" 