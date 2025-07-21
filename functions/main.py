# Welcome to Cloud Functions for Firebase for Python!
# Authentication domain restriction for JHMH platform
# Deploy with `firebase deploy --only functions`

from firebase_functions import https_fn, identity_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app
import re

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)

# Initialize Firebase Admin SDK
initialize_app()

# Domain whitelist for JHMH employees
ALLOWED_DOMAINS = ["jhmh.com"]

def is_email_allowed(email: str) -> bool:
    """
    Vérifie si l'email appartient à un domaine autorisé
    
    Args:
        email: L'adresse email à vérifier
        
    Returns:
        bool: True si l'email est autorisé, False sinon
    """
    if not email:
        return False
    
    # Normaliser l'email en minuscules
    email = email.lower().strip()
    
    # Vérifier le format email basique
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False
    
    # Extraire le domaine
    try:
        domain = email.split('@')[1]
        return domain in ALLOWED_DOMAINS
    except IndexError:
        return False

@identity_fn.before_user_signed_in()
def before_user_signed_in(event: identity_fn.AuthBlockingEvent) -> identity_fn.BeforeSignInResponse:
    """
    Fonction déclenchée avant qu'un utilisateur soit authentifié.
    Vérifie que l'email appartient au domaine @jhmh.com
    
    Args:
        event: L'événement d'authentification contenant les données utilisateur
        
    Returns:
        BeforeSignInResponse: Autorisation ou blocage de l'authentification
    """
    try:
        # Récupérer l'email de l'utilisateur
        user_email = event.data.email
        
        # Log pour debugging (visible dans Firebase Console)
        print(f"Tentative de connexion pour: {user_email}")
        
        # Vérifier si l'email est autorisé
        if not is_email_allowed(user_email):
            print(f"Connexion bloquée pour: {user_email} - Domaine non autorisé")
            
            # Bloquer l'authentification avec un message d'erreur personnalisé
            raise identity_fn.HttpsError(
                code=identity_fn.AuthErrorCode.INVALID_ARGUMENT,
                message="Accès restreint aux employés JHMH. Veuillez utiliser votre adresse email professionnelle @jhmh.com"
            )
        
        # Si l'email est autorisé, permettre la connexion
        print(f"Connexion autorisée pour: {user_email}")
        
        # Optionnel: Ajouter des custom claims ou modifier les données utilisateur
        return identity_fn.BeforeSignInResponse(
            # Vous pouvez ajouter des custom claims ici si nécessaire
            # custom_claims={"role": "employee", "domain": "jhmh.com"}
        )
        
    except identity_fn.HttpsError:
        # Re-raise les erreurs d'authentification
        raise
    except Exception as e:
        # Log l'erreur et bloquer par sécurité
        print(f"Erreur lors de la vérification d'authentification: {str(e)}")
        raise identity_fn.HttpsError(
            code=identity_fn.AuthErrorCode.INTERNAL,
            message="Erreur interne lors de l'authentification. Veuillez réessayer."
        )

@https_fn.on_request()
def test_domain_check(req: https_fn.Request) -> https_fn.Response:
    """
    Fonction de test pour vérifier la validation des domaines
    Accessible via: https://your-project.cloudfunctions.net/test_domain_check?email=test@jhmh.com
    """
    email = req.args.get('email', '')
    
    if not email:
        return https_fn.Response(
            "Usage: ?email=test@jhmh.com",
            status=400
        )
    
    is_allowed = is_email_allowed(email)
    
    result = {
        "email": email,
        "is_allowed": is_allowed,
        "message": f"Email {'autorisé' if is_allowed else 'bloqué'} pour la plateforme JHMH"
    }
    
    return https_fn.Response(
        f"Test de validation d'email:\n{result}",
        headers={"Content-Type": "text/plain; charset=utf-8"}
    )