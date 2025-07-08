# 📊 Dashboard Accounting Tool - Documentation

## 🎯 Vue d'ensemble

Le Dashboard Accounting Tool est une interface avancée qui permet d'analyser les performances financières des actifs immobiliers avec des métriques détaillées et des comparaisons temporelles.

## ✨ Fonctionnalités implémentées

### 🔍 Filtres de recherche

- **Sélecteur d'actifs** : Dropdown avec liste dynamique des actifs disponibles
- **Sélecteur de date** : Composant calendar pour choisir la date de référence
- **Bouton de recherche** : Lance la requête avec états loading/actualiser

### 📈 Métriques affichées

#### 1. **Métriques principales**

- Revenus du mois avec variation vs mois dernier
- Taux d'occupation avec pourcentage
- ADR HT avec évolution année sur année
- Prévisions 2025 avec taux d'occupation prévu

#### 2. **Analyse hebdomadaire**

- Statistiques semaine dernière, actuelle et prochaine
- Revenus et taux d'occupation pour chaque période

#### 3. **Activité du jour**

- Check-ins et check-outs du jour
- Unités occupées actuellement
- Réservations futures

#### 4. **Comparaisons**

- Croissance année vs année précédente
- Performances historiques
- Moyennes et totaux

## 🏗️ Architecture technique

### API Routes créées

#### `/api/dashboard/metrics`

- **Méthode** : GET
- **Paramètres** :
  - `date` (YYYY-MM-DD) - obligatoire
  - `actif` (string) - optionnel, défaut: "global"
- **Réponse** : Structure JSON:API complète avec toutes les métriques

#### `/api/actifs`

- **Méthode** : GET
- **Réponse** : Liste des actifs disponibles avec métadonnées

### Hooks personnalisés

#### `useDashboardMetrics`

```typescript
const { data, isLoading, error, refetch } = useDashboardMetrics({
  date: '2025-01-15',
  actif: 'global',
  enabled: true,
});
```

#### `useActifs`

```typescript
const { actifs, isLoading, error } = useActifs();
```

### Composants créés

#### `MetricCard`

Composant réutilisable pour afficher les métriques avec :

- Formatage automatique (currency, percentage, number)
- Indicateurs de tendance (up/down/neutral)
- Variations avec badges colorés
- Tailles multiples (sm/md/lg)

#### `DatePicker`

Composant basé sur Calendar et Popover pour la sélection de dates :

- Interface intuitive avec calendar
- Formatage français automatique
- Validation et états disabled

## 🎨 Design et UX

### Principes appliqués

- **Mobile-first** : Interface responsive adaptée à tous les écrans
- **États visuels** : Loading skeletons, messages d'erreur, états vides
- **Hiérarchie claire** : Sections organisées avec icônes et titres
- **Accessibilité** : Support clavier, labels appropriés, contrastes

### Palette de couleurs

- **Primaire** : Navy (#0D1B3C) pour les éléments importants
- **Succès** : Vert pour les tendances positives
- **Erreur** : Rouge pour les tendances négatives
- **Neutres** : Gris pour les informations secondaires

## 📱 Responsive Design

### Breakpoints utilisés

- **Mobile** : 1 colonne pour toutes les sections
- **Tablet (md)** : 2-3 colonnes selon le contenu
- **Desktop (lg+)** : 4 colonnes pour les métriques principales

### Adaptations mobiles

- Navigation par boutons scrollables
- Cards empilées verticalement
- Textes redimensionnés automatiquement

## 🔧 Gestion des états

### Loading

- Skeletons pendant le chargement des données
- Spinner sur le bouton de recherche
- Désactivation des interactions pendant les requêtes

### Erreurs

- Messages d'erreur contextuels avec bouton "Réessayer"
- Gestion différenciée des erreurs 400/404/500
- Fallbacks gracieux

### États vides

- Message d'accueil avant la première recherche
- Instructions claires pour l'utilisateur
- Illustration avec icône BarChart3

## 🚀 Performance

### Optimisations appliquées

- **React Query** : Cache intelligent avec staleTime/gcTime
- **Lazy loading** : Données chargées seulement à la demande
- **Memoization** : Formatage optimisé des valeurs
- **Débouncing implicite** : Pas de recherche automatique

### Métriques de cache

- **Métriques** : 5 minutes stale, 10 minutes garbage collection
- **Actifs** : 15 minutes stale, 30 minutes garbage collection

## 📊 Données mock

### Structure des actifs

```typescript
{
  id: 'global',
  label: 'Global',
  description: 'Vue d\'ensemble de tous les actifs',
  type: 'global' | 'property' | 'zone',
  isActive: boolean
}
```

### Actifs disponibles

- **Global** : Vue d'ensemble
- **14M** : Résidence Montparnasse
- **17C** : Complexe Clichy
- **23A** : Appartements Austerlitz
- **45B** : Villa Bercy

### Métriques simulées

- Données réalistes basées sur l'exemple du fichier api.md
- Variations par actif (facteurs multiplicateurs)
- Timestamps et IDs dynamiques
- Simulation de délai réseau (500ms)

## 🧪 Tests et qualité

### Validations implémentées

- **Zod schemas** : Validation stricte des paramètres API
- **TypeScript strict** : Types complets pour toutes les interfaces
- **Error boundaries** : Gestion d'erreurs robuste
- **Null safety** : Vérifications systématiques

### Cas de test couverts

- Paramètres manquants ou invalides
- Actifs inexistants
- Erreurs réseau
- Données corrompues
- États de chargement

## 📚 Utilisation

### Workflow utilisateur

1. **Arrivée** : Page avec état d'accueil et instructions
2. **Sélection** : Choisir un actif et une date
3. **Recherche** : Cliquer sur "Rechercher" pour lancer l'analyse
4. **Analyse** : Consulter les métriques organisées par sections
5. **Actualisation** : Bouton "Actualiser" pour rafraîchir les données

### Navigation

- **Breadcrumbs** : Navigation contextuelle claire
- **Sidebar** : Accès rapide via le sous-menu Accounting Tool
- **Filtres persistants** : Sélections conservées entre les recherches

## 🔄 Évolutions possibles

### Court terme

- Graphiques et visualisations (charts.js/recharts)
- Export des données (CSV/PDF)
- Filtres avancés (période, type d'actif)
- Comparaisons multi-actifs

### Moyen terme

- Notifications en temps réel
- Rapports automatisés
- Intégration API réelles
- Dashboard personnalisable

### Long terme

- IA pour prédictions
- Analyse prédictive
- Intégration ERP/CRM
- Mode multi-tenant

## 🛠️ Maintenance

### Surveillance recommandée

- Temps de réponse API
- Taux d'erreur des requêtes
- Usage des différents actifs
- Performance des composants

### Mises à jour

- Données mock à synchroniser avec la production
- Composants Shadcn à maintenir à jour
- Types TypeScript à affiner selon l'évolution de l'API

---

**Implémentation terminée** ✅

- API mock complète avec validation
- Interface utilisateur avancée
- Gestion d'états robuste
- Design responsive et accessible
- Performance optimisée
