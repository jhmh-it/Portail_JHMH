# 🔐 Gestion des Accès Greg

## Vue d'ensemble

La page de gestion des accès permet de contrôler les permissions entre les
espaces et les documents dans le système Greg. Elle offre une interface unifiée
pour gérer deux types d'accès :

1. **Accès Documents-Espaces** : Définit quels espaces peuvent accéder à quels
   documents
2. **Accès Historiques entre Espaces** : Permet à certains espaces d'accéder à
   l'historique d'autres espaces

## Architecture

### Composants principaux

```
src/app/home/greg/access/
├── page.tsx                          # Page principale avec tabs et filtres
├── components/
│   ├── SpaceDocumentAccessList.tsx  # Liste des accès documents-espaces
│   ├── SpaceHistoryAccessList.tsx   # Liste des accès historiques
│   ├── CreateAccessModal.tsx        # Modal de création d'accès
│   ├── AccessFilters.tsx            # Panneau de filtres avancés
│   └── index.ts                     # Exports
└── README.md                        # Documentation
```

### Routes API

```
src/app/api/greg/
├── space-document-access/
│   └── route.ts                     # GET, POST, DELETE
└── space-history-access/
    └── route.ts                     # GET, POST, PUT, DELETE
```

## Fonctionnalités

### 1. Visualisation des accès

- **Vue en tableau** : Affichage clair des accès avec espaces, documents, dates
  et notes
- **Recherche globale** : Recherche par nom d'espace, document, ID ou notes
- **Filtres avancés** :
  - Type d'espace (Groupes/DMs)
  - Type de document (En attente/Approuvés)
  - Période (Aujourd'hui/Semaine/Mois/Année)

### 2. Gestion des accès

- **Création** : Modal unifié pour créer des accès documents ou historiques
- **Modification** : Édition des notes pour les accès historiques
- **Suppression** : Suppression avec confirmation
- **Actualisation** : Bouton de rafraîchissement avec indicateur de chargement

### 3. Interface utilisateur

- **Tabs** : Navigation entre accès documents et accès historiques
- **Indicateurs visuels** :
  - Badges pour les types d'espaces (Groupe/DM)
  - Badges pour les documents en attente de révision
  - Icônes distinctes pour chaque type d'accès
- **États de chargement** : Skeletons pendant le chargement
- **Gestion d'erreurs** : Messages d'erreur clairs avec alertes

## APIs utilisées

### Accès Documents-Espaces

- `GET /api/greg/space-document-access` - Liste tous les accès
- `POST /api/greg/space-document-access` - Créer un nouvel accès
- `DELETE /api/greg/space-document-access` - Supprimer un accès
- `GET /api/greg/space-document-access/document/{id}` - Espaces ayant accès à un
  document
- `GET /api/greg/space-document-access/space/{id}` - Documents accessibles par
  un espace

### Accès Historiques

- `GET /api/greg/space-history-access` - Liste tous les accès historiques
- `POST /api/greg/space-history-access` - Créer un nouvel accès
- `PUT /api/greg/space-history-access` - Mettre à jour un accès (note)
- `DELETE /api/greg/space-history-access` - Supprimer un accès
- `GET /api/greg/space-history-access/{space_id}` - Accès historiques pour un
  espace

## Patterns de code

### State Management

```typescript
// Gestion centralisée des états
const [activeTab, setActiveTab] = useState('document-access');
const [searchQuery, setSearchQuery] = useState('');
const [showCreateModal, setShowCreateModal] = useState(false);
const [filters, setFilters] = useState({
  spaceType: 'all',
  documentType: 'all',
  dateRange: 'all',
});
```

### Fetching de données

```typescript
// Utilisation de fetch natif avec gestion d'erreurs
const fetchAccessList = async () => {
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();

    const response = await fetch('/api/greg/space-document-access', {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    const data = await response.json();
    setAccessList(data);
  } catch (error) {
    setError('Impossible de charger les accès');
  }
};
```

### Validation avec Zod

```typescript
const documentAccessSchema = z.object({
  space_id: z.string().min(1, 'Veuillez sélectionner un espace'),
  document_id: z.string().min(1, 'Veuillez sélectionner un document'),
});
```

## Améliorations futures

1. **Pagination** : Ajouter la pagination pour les grandes listes d'accès
2. **Export** : Permettre l'export des accès en CSV/Excel
3. **Bulk actions** : Actions groupées (suppression multiple, etc.)
4. **Audit trail** : Historique des modifications d'accès
5. **Visualisation** : Graphiques pour visualiser les relations d'accès
6. **Permissions granulaires** : Niveaux d'accès (lecture/écriture/admin)

## Sécurité

- Authentification Firebase requise pour toutes les opérations
- Validation des données côté client et serveur
- Token JWT transmis dans les headers pour l'API JHMH
- Sanitization des entrées utilisateur
