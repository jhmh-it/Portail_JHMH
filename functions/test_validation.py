#!/usr/bin/env python3
"""
Test de validation pour la fonction de restriction de domaine @jhmh.com
Usage: python3 test_validation.py
"""

import sys
import os

# Ajouter le répertoire courant au path pour importer main.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import is_email_allowed

def test_domain_validation():
    """
    Teste la fonction de validation de domaine avec différents cas
    """
    print("🧪 Tests de validation de domaine @jhmh.com")
    print("=" * 50)
    
    # Test cases: (email, expected_result, description)
    test_cases = [
        # Emails valides @jhmh.com
        ("user@jhmh.com", True, "Email basique @jhmh.com"),
        ("test.user@jhmh.com", True, "Email avec point @jhmh.com"),
        ("user123@jhmh.com", True, "Email avec chiffres @jhmh.com"),
        ("user-name@jhmh.com", True, "Email avec tiret @jhmh.com"),
        ("USER@JHMH.COM", True, "Email en majuscules @jhmh.com"),
        ("  user@jhmh.com  ", True, "Email avec espaces @jhmh.com"),
        
        # Emails invalides - autres domaines
        ("user@gmail.com", False, "Email Gmail"),
        ("user@hotmail.com", False, "Email Hotmail"),
        ("user@yahoo.com", False, "Email Yahoo"),
        ("user@company.com", False, "Autre domaine"),
        ("user@jhmh.fr", False, "Mauvaise extension"),
        ("user@jhm.com", False, "Domaine similaire mais différent"),
        
        # Emails malformés
        ("invalid-email", False, "Email sans @"),
        ("user@", False, "Email sans domaine"),
        ("@jhmh.com", False, "Email sans utilisateur"),
        ("user@@jhmh.com", False, "Double @"),
        ("user@jhmh", False, "Domaine sans extension"),
        ("", False, "Email vide"),
        (None, False, "Email None"),
        
        # Cas edge
        ("user@sub.jhmh.com", False, "Sous-domaine de jhmh.com"),
        ("user@jhmh.com.evil.com", False, "Domaine malveillant"),
    ]
    
    all_passed = True
    passed_count = 0
    total_count = len(test_cases)
    
    for email, expected, description in test_cases:
        try:
            result = is_email_allowed(email)
            status = "✅ PASS" if result == expected else "❌ FAIL"
            
            if result != expected:
                all_passed = False
                print(f"{status} | {description}")
                print(f"     Input: {repr(email)}")
                print(f"     Expected: {expected}, Got: {result}")
            else:
                passed_count += 1
                print(f"{status} | {description}")
                
        except Exception as e:
            all_passed = False
            print(f"❌ ERROR | {description}")
            print(f"     Input: {repr(email)}")
            print(f"     Exception: {e}")
    
    print("=" * 50)
    print(f"📊 Résultats: {passed_count}/{total_count} tests réussis")
    
    if all_passed:
        print("🎉 Tous les tests sont passés avec succès !")
        print("✅ La fonction de validation est prête pour le déploiement")
        return True
    else:
        print("❌ Certains tests ont échoué")
        print("🔧 Vérifiez la logique de validation avant déploiement")
        return False

def test_performance():
    """
    Test basique de performance pour s'assurer que la validation est rapide
    """
    import time
    
    print("\n⚡ Test de performance")
    print("-" * 30)
    
    test_email = "performance.test@jhmh.com"
    iterations = 1000
    
    start_time = time.time()
    for _ in range(iterations):
        is_email_allowed(test_email)
    end_time = time.time()
    
    total_time = end_time - start_time
    avg_time = (total_time / iterations) * 1000  # en millisecondes
    
    print(f"📈 {iterations} validations en {total_time:.4f}s")
    print(f"⚡ Temps moyen: {avg_time:.2f}ms par validation")
    
    if avg_time < 1:  # Moins d'1ms par validation
        print("✅ Performance acceptable pour une Cloud Function")
        return True
    else:
        print("⚠️  Performance pourrait être optimisée")
        return False

if __name__ == "__main__":
    print("🔒 Test de la Cloud Function de restriction d'authentification JHMH\n")
    
    # Test de validation
    validation_ok = test_domain_validation()
    
    # Test de performance
    performance_ok = test_performance()
    
    print("\n" + "=" * 60)
    
    if validation_ok and performance_ok:
        print("✅ TOUS LES TESTS RÉUSSIS")
        print("🚀 La Cloud Function est prête pour le déploiement")
        sys.exit(0)
    else:
        print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
        print("🔧 Corrigez les problèmes avant déploiement")
        sys.exit(1) 