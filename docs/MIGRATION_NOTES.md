# MIGRATION_NOTES.md: Risques et Points de Vigilance

Ce document a pour but de signaler les risques potentiels, les dépendances
critiques et les points d'attention pour l'évolution du projet.

### 1. Dépendance Critique à l'API Externe (JHMH API)

- **Constat** : L'application fonctionne principalement comme un
  **Backend-For-Frontend (BFF)** ou un proxy pour une API externe
  (`JHMH_API_BASE_URL`). La quasi-totalité des fonctionnalités dépend de la
  disponibilité et des performances de cette API.
- **Risque** :
  - **Disponibilité** : Toute interruption de l'API externe rendra le portail
    JHMH inutilisable. La vérification de santé (`/api/auth/login`) est une
    bonne mesure d'atténuation, mais elle ne prévient pas les pannes en cours de
    session.
  - **Latence** : L'architecture en proxy ajoute un saut réseau supplémentaire à
    chaque appel, ce qui augmente mécaniquement la latence perçue par
    l'utilisateur.
- **Vigilance** :
  - Mettre en place un monitoring robuste sur la santé de l'API externe.
  - Envisager une stratégie de cache plus agressive (ex: Redis) pour les données
    fréquemment consultées et peu volatiles.
  - Pour les futures optimisations, évaluer la possibilité pour le client de
    communiquer directement avec l'API externe si les contraintes de sécurité
    (CORS, authentification) le permettent.

### 2. Scalabilité du Filtrage et de la Pagination

- **Constat** : Plusieurs endpoints critiques effectuent le filtrage et la
  pagination **après** avoir récupéré l'intégralité des données de l'API
  externe.
- **Risque** : C'est le **risque de performance le plus important** du projet.
  Avec une volumétrie de données croissante, les temps de réponse de ces
  endpoints deviendront inacceptables, et la consommation de mémoire du serveur
  Next.js pourrait entraîner des pannes.
- **Vigilance** :
  - La tâche de refactorisation (P0 dans `TODO_REFACTOR.md`) qui consiste à
    déléguer ces opérations à l'API externe est **non négociable** pour la
    viabilité à long terme de l'application.
  - Il est crucial de **valider que l'API externe supporte bien ces
    opérations**. Si ce n'est pas le cas, une discussion immédiate doit être
    engagée avec l'équipe responsable de cette API pour qu'elle implémente ces
    fonctionnalités. Le projet sera bloqué sans cela.

### 3. Sécurité des Routes API

- **Constat** : La sécurité repose sur une logique de vérification de session
  dupliquée manuellement dans chaque fichier de route.
- **Risque** : Le risque d'oubli de cette vérification par un développeur est
  très élevé, ce qui créerait une **faille de sécurité majeure** en exposant un
  endpoint sans authentification.
- **Vigilance** : La factorisation de cette logique (P0 dans `TODO_REFACTOR.md`)
  est une priorité absolue pour garantir la sécurité de manière systématique.

### 4. Gestion des "Custom Claims" Firebase

- **Constat** : Le code récupère les `customClaims` (rôles) de l'utilisateur
  lors de la connexion et de la vérification de la session.
- **Risque** : Les `customClaims` ne sont pas mis à jour en temps réel dans le
  token d'ID de l'utilisateur. Si les rôles d'un utilisateur sont modifiés, le
  changement ne sera effectif qu'après l'expiration de son token actuel (jusqu'à
  7 jours) et sa reconnexion.
- **Vigilance** :
  - Pour les opérations sensibles, il est recommandé de toujours re-valider les
    permissions côté serveur en récupérant l'enregistrement utilisateur à jour
    (`adminAuth.getUser(uid)`) plutôt que de se fier uniquement au contenu du
    token.
  - Prévoir un mécanisme pour forcer le rafraîchissement du token côté client
    lorsqu'un rôle est modifié.

### 5. Absence de Framework de Test

- **Constat** : Le projet n'a aucune infrastructure de test automatisé.
- **Risque** : Chaque modification, même mineure, peut introduire des
  régressions. Le refactoring à grande échelle (comme celui proposé) est
  extrêmement risqué sans une suite de tests pour valider la non-régression.
- **Vigilance** : Il est fortement recommandé de commencer par écrire des tests
  pour les fonctionnalités existantes **avant** d'entreprendre des
  refactorisations majeures. Commencer par les fonctions utilitaires pures et la
  logique d'authentification.
