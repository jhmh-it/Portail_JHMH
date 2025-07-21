#!/bin/bash

# 🚀 Script de Déploiement Manuel - Portail JHMH
# Déploiement interactif avec toutes les vérifications de sécurité

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo ""
    echo "${PURPLE}================================================${NC}"
    echo "${PURPLE}🚀 $1${NC}"
    echo "${PURPLE}================================================${NC}"
    echo ""
}

print_step() {
    echo "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo "${RED}❌ $1${NC}"
}

print_info() {
    echo "${CYAN}ℹ️ $1${NC}"
}

# Variables
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
LOG_FILE="deploy_${TIMESTAMP}.log"
PROJECT_ROOT=$(pwd)
DEPLOYMENT_ENV=""
SKIP_TESTS=false
FORCE_DEPLOY=false
DRY_RUN=false

# Fonction d'aide
show_help() {
    echo "🚀 Script de Déploiement Portail JHMH"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV          Environnement (staging|production)"
    echo "  -s, --skip-tests       Ignorer les tests"
    echo "  -f, --force           Forcer le déploiement"
    echo "  -d, --dry-run         Simulation sans déploiement réel"
    echo "  -h, --help            Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 --env staging"
    echo "  $0 --env production --force"
    echo "  $0 --dry-run"
}

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            DEPLOYMENT_ENV="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -f|--force)
            FORCE_DEPLOY=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Début du script
print_header "DÉPLOIEMENT PORTAIL JHMH"

# Logger la session
exec > >(tee -a "$LOG_FILE")
exec 2>&1

print_info "Démarrage du déploiement - $(date)"
print_info "Log: $LOG_FILE"

# 1. Vérifications préalables
print_step "Vérifications préalables..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm version: $NPM_VERSION"

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 n'est pas installé"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
print_success "Python version: $PYTHON_VERSION"

# Vérifier Firebase CLI
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI n'est pas installé"
    echo "${YELLOW}Installation: npm install -g firebase-tools${NC}"
    exit 1
fi

FIREBASE_VERSION=$(firebase --version)
print_success "Firebase CLI version: $FIREBASE_VERSION"

# 2. Sélection de l'environnement
if [ -z "$DEPLOYMENT_ENV" ]; then
    echo ""
    print_step "Sélection de l'environnement de déploiement:"
    echo "1) staging - Environnement de test"
    echo "2) production - Environnement de production"
    echo ""
    read -p "Choisissez l'environnement (1 ou 2): " env_choice
    
    case $env_choice in
        1)
            DEPLOYMENT_ENV="staging"
            ;;
        2)
            DEPLOYMENT_ENV="production"
            ;;
        *)
            print_error "Choix invalide"
            exit 1
            ;;
    esac
fi

print_info "Environnement sélectionné: $DEPLOYMENT_ENV"

# Configuration selon l'environnement
case $DEPLOYMENT_ENV in
    staging)
        FIREBASE_PROJECT="portail-jhmh-staging"
        TARGET_URL="https://portail-jhmh-staging.web.app"
        ;;
    production)
        FIREBASE_PROJECT="portail-jhmh"
        TARGET_URL="https://portail-jhmh.web.app"
        
        if [ "$FORCE_DEPLOY" != true ] && [ "$DRY_RUN" != true ]; then
            echo ""
            print_warning "DÉPLOIEMENT EN PRODUCTION"
            print_warning "Ceci déploiera en production réelle !"
            read -p "Êtes-vous sûr ? (tapez 'YES' pour continuer): " confirm
            if [ "$confirm" != "YES" ]; then
                print_info "Déploiement annulé"
                exit 0
            fi
        fi
        ;;
    *)
        print_error "Environnement invalide: $DEPLOYMENT_ENV"
        exit 1
        ;;
esac

print_info "Projet Firebase: $FIREBASE_PROJECT"
print_info "URL cible: $TARGET_URL"

# 3. Vérification de l'authentification Firebase
print_step "Vérification de l'authentification Firebase..."

if ! firebase projects:list &> /dev/null; then
    print_error "Non authentifié sur Firebase"
    echo "${YELLOW}Exécutez: firebase login${NC}"
    exit 1
fi

# Configurer le projet
firebase use "$FIREBASE_PROJECT" > /dev/null 2>&1
print_success "Projet Firebase configuré: $FIREBASE_PROJECT"

# 4. Installation des dépendances
print_step "Installation des dépendances..."

npm ci
print_success "Dépendances Node.js installées"

if [ -d "functions" ]; then
    cd functions
    pip install -r requirements.txt > /dev/null 2>&1
    cd ..
    print_success "Dépendances Python installées"
fi

# 5. Tests et validations
if [ "$SKIP_TESTS" != true ]; then
    print_step "Exécution des tests et validations..."
    
    # Linting
    print_info "Linting..."
    npm run lint
    print_success "Linting réussi"
    
    # Type checking
    print_info "Vérification TypeScript..."
    npm run type-check
    print_success "Types TypeScript valides"
    
    # Build test
    print_info "Test de build..."
    npm run build > /dev/null 2>&1
    print_success "Build réussi"
    
    # Tests Cloud Functions
    if [ -f "functions/test_validation.py" ]; then
        print_info "Tests Cloud Functions..."
        cd functions
        python3 test_validation.py > /dev/null 2>&1
        cd ..
        print_success "Tests Cloud Functions réussis"
    fi
    
    # Audit de sécurité
    print_info "Audit de sécurité..."
    npm audit --audit-level=moderate > /dev/null 2>&1 || print_warning "Vulnérabilités détectées"
    
else
    print_warning "Tests ignorés (--skip-tests)"
fi

# 6. Pré-déploiement
print_step "Préparation du déploiement..."

# Build final
print_info "Build de production..."
npm run build

# Génération de la version
VERSION="${DEPLOYMENT_ENV}-$(date +'%Y.%m.%d')-$(git rev-parse --short HEAD 2>/dev/null || echo 'local')"
print_info "Version: $VERSION"

# 7. Déploiement
if [ "$DRY_RUN" = true ]; then
    print_warning "MODE DRY-RUN - Aucun déploiement réel"
    print_info "Commandes qui seraient exécutées:"
    echo "  firebase deploy --only hosting --project $FIREBASE_PROJECT"
    echo "  firebase deploy --only functions --project $FIREBASE_PROJECT"
else
    print_step "Déploiement vers $DEPLOYMENT_ENV..."
    
    # Déploiement Hosting
    print_info "Déploiement Hosting..."
    firebase deploy --only hosting --project "$FIREBASE_PROJECT"
    print_success "Hosting déployé"
    
    # Déploiement Functions
    if [ -d "functions" ]; then
        print_info "Déploiement Cloud Functions..."
        firebase deploy --only functions --project "$FIREBASE_PROJECT"
        print_success "Cloud Functions déployées"
    fi
fi

# 8. Tests post-déploiement
if [ "$DRY_RUN" != true ]; then
    print_step "Tests post-déploiement..."
    
    # Test de santé
    print_info "Test de santé..."
    sleep 5  # Attendre la propagation
    
    if curl -sf "$TARGET_URL" > /dev/null; then
        print_success "Application accessible"
    else
        print_error "Application inaccessible"
        exit 1
    fi
    
    # Test des fonctions si disponibles
    if [ -d "functions" ]; then
        FUNCTION_URL="https://europe-west1-$FIREBASE_PROJECT.cloudfunctions.net/test_domain_check"
        if curl -sf "$FUNCTION_URL?email=test@jhmh.com" > /dev/null; then
            print_success "Cloud Functions accessibles"
        else
            print_warning "Cloud Functions peuvent ne pas être accessibles"
        fi
    fi
fi

# 9. Résumé final
print_header "RÉSUMÉ DU DÉPLOIEMENT"

echo "📋 Informations:"
echo "   • Environnement: $DEPLOYMENT_ENV"
echo "   • Version: $VERSION"
echo "   • Timestamp: $(date)"
echo "   • Log: $LOG_FILE"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 Mode: DRY-RUN (simulation)"
else
    echo "✅ Status: DÉPLOYÉ"
    echo "🌐 URL: $TARGET_URL"
    
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        echo ""
        print_success "🎉 DÉPLOIEMENT PRODUCTION RÉUSSI !"
        echo "${GREEN}L'application est maintenant live !${NC}"
    else
        echo ""
        print_success "🚧 DÉPLOIEMENT STAGING RÉUSSI !"
        echo "${GREEN}Prêt pour les tests !${NC}"
    fi
fi

echo ""
print_info "Fin du déploiement - $(date)" 