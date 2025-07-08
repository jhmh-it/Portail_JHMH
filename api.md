### 🎯 Titre : Création du endpoint pour les métriques du tableau de bord (`dashboardMetrics`)

---

### 📝 Description

Ce ticket a pour objectif de créer un nouvel endpoint d'API, `GET /api/dashboard/metrics`, qui fournira un ensemble agrégé de métriques de performance pour notre tableau de bord principal.

L'endpoint devra consolider des données comptables, des statistiques opérationnelles (passées, présentes et futures), ainsi que des prévisions de revenus. La réponse devra respecter le format **JSON:API** pour une intégration standardisée avec le front-end.

---

### ✨ Spécifications de l'Endpoint à fournir

#### **Méthode HTTP**

`GET`

#### **URL**

`/api/dashboard/metrics`

#### **Paramètres de requête (Query Parameters)**

- `date`
  - **Description** : La date de référence pour laquelle les métriques doivent être calculées.
  - **Type** : `string`
  - **Format** : `YYYY-MM-DD`
  - **Obligatoire** : Oui
- `actif`
  - **Description** : L'identifiant de l'actif pour lequel les données sont demandées. Peut être un identifiant de propriété ou une valeur spéciale.
  - **Type** : `string`
  - **Optionnel** : Oui. Si non fourni, la valeur par défaut est `global`.

#### **Authentification**

Cet endpoint doit être sécurisé. Chaque requête devra inclure un jeton d'authentification valide (par exemple, `Bearer Token` ou `API Key` dans les en-têtes).

#### **Réponse en cas de succès (`200 OK`)**

La réponse sera un objet JSON structuré suivant la norme JSON:API. Il contiendra les données de performance agrégées dans la clé `attributes`.

\<details\>
\<summary\>📋 Schéma de la réponse JSON complète\</summary\>

```json
{
"data": {
    "type": "dashboardMetrics",
    "id": "global_2025-07-07",
    "attributes": {
      *"date": "2025-07-07",
      *"actif": "global",
      *Tendances hebdomadaires"databaseStatistics": {
        *"currentWeek": {
          *"weekIdentifier": "2025-07 W28",
          *"accommodationHTExcludingCleaning": 44748.50,
          *"occupancyPercentage": 88.72,
          *"adrHTIncludingCleaning": 392.73,
        },
        *"lastWeek": {
          *"weekIdentifier": "2025-06 W27",
          *"accommodationHTExcludingCleaning": 43617.75,
          *"occupancyPercentage": 74.44,
          *"adrHTIncludingCleaning": 440.26
        },
        *"nextWeek": {
          *"weekIdentifier": "2025-07 W29",
          *"accommodationHTExcludingCleaning": 41326.57,
          *"occupancyPercentage": 99.25,
          *"adrHTIncludingCleaning": 334.02
        },
        *Vue d'ensembl"todayBusiness": {
          *"checkInsToday": 5,
          *"checkOutsToday": 3
        },
        *Comparaison des performances temporelles"thisMonth": {
          *"occupancyRatePercentage": 83.87,
          *"accommodationHT": 194040.22,
          *"cancellableAccommodationHT": 0.00,
          *"cleaningHT": 9328.64,
          *"adrHT": 403.33,
          *Vue d'ensemble"missedSalesTTC": {
            *"amount": 1705.00,
            *"count": 5
          },
          "opportunityTTC": {
            "amount": 48782.20,
            "count": 101
          }
        },
        *Comparaison des performances temporelles"sameMonthLastYear": {
          *"occupancyRatePercentage": 80.10,
          *"accommodationHT": 139932.66,
          *"cleaningHT": 10405.16,
          *"adrHT": 312.83,
          *"euroPerSquareMeterHT": 2866.45
        },
        *Comparaison des performances temporelles"lastMonth": {
          *"occupancyRatePercentage": 96.40,
          *"accommodationHT": 218282.01,
          *"cleaningHT": 11945.94,
          *"adrHT": 422.58,
          *"euroPerSquareMeterHT": 4997.21
        },
        *Prévision mois prochain"nextMonth": {
          *"monthIdentifier": "08",
          *"year": 2025,
          *"occupancyPercentage": 45.98,
          *"adrHT": 331.21,
          *"accommodationHT": 89034.13,
          *"cleaningHT": 5321.43
        },
        *Historique - Statistiques de réservations"databaseInfo": {
          *"totalValidBookings": 6296,
          *"includingNoShows": 82,
          *Vue d'ensemble"totalActiveCheckedIns": {
            *"count": 17,
            *"outOf": 19,
            *"percentage": 89.47
          },
          *Pipeline de réservations futures"totalFutureBookings": 214,
          *Statistiques de réservations"totalInvoicedBookings": 6064,
          *"lastUpdate": "2025-07-07T08:12:08.283Z"
        },
        *Analyse"revenues": {
          *"year": 2025,
          * Revenus détaillés 2025"revenues": {
            "until": {
              *"date": "2025-07-07",
              *"totalAccommodationServicesHT": 1075903.31,
              *"totalCleaningHT": 78243.31,
              *"occupancyPercentage": 87.85,
              *"adrHT": 322.73
            },
            *"totalAccommodationServicesHT": 1283745.09,
            *"totalCleaningHT": 90110.87,
            *"totalADR": 341.91
          }
        },
        *Prix au m² - Analyses comparatives"euroPerSquareMeterHTLast12MonthAvg": 3276.72,
        *Évolution 2024 → 2025"yoy2025vs2024AsOfJune30": {
          *"percentage": 25.75,
          *"value2025": 881672.17,
          *"value2024": 701120.68
        },
        *Performance 2024 (référence)"totalRevenues": {
          *"year": 2024,
          *"occupancyPercentage": 84.72,
          *"adr": 285.64,
          *"totalAccommodationServicesHT": 1540476.22,
          *"totalCleaningHT": 122873.32
        },
        *Historique complet"allTimesBookings": {
          *"adr": 311.00,
          *"totalAccommodationServicesHTToDate": 6937673.30,
          *"totalCleaningHTToDate": 468855.86
        }
      },
      *Prevision"forecast": {
        * Prévisions et Scénarios 2025"year": 2025,
        *"accommodationHT": 1783872.69,
        *"realized2025": 1283745.09,
        *"modifiedOpportunity2025": 833546.00,
        * Potentiel maximal annuel"totalModifiedMaxed2025": 2117291.09,
        *"proRataTemporis2025": 679419.91,
        *"extremeMinimum": 1783872.69,
        *"mixedModelForecast": {
          "occupancyPercentage": 89.06,
          "value": 1783872.69
        },
        *Maximum théorique mensuel"maximums": {
          *"monthIdentifier": "08",
          *"year": 2025,
          *"maxOccupationPercentage": 99.15,
          *"maxTheoreticalAccommodation": 242822.00
        }
      },
      *Analyse - Comparaisons détaillées"monthlyComparison": {
        *"year": 2025,
        *"monthIdentifier": "07",
        "revenues": {
          *"changePercentage": 38.67,
          *"thisMonthAccommodationHT": 194040.22,
          *"thisMonthCancellableAccommodationHT": 0.00,
          *"lastYearSameMonthAccommodationHT": 139932.66,
          *"lastMonthAccommodationHT": 218282.01
        },
        "cleaning": {
          *"changePercentage": -10.35,
          *"thisMonthHT": 9328.64,
          *"lastYearSameMonthHT": 10405.16,
          *"lastMonthHT": 11945.94
        },
        "adrHT": {
          *"changePercentage": 28.93,
          *"thisMonth": 403.33,
          *"lastYearSameMonth": 312.83,
          *"lastMonth": 422.58
        },
        *Prix au m² - Analyses comparatives"sqmPriceHT": {
          *"last12MonthAvgPerShab": 3276.72,
          "lastMonth": {
            *"label": "juin 2025",
            *"value": 4997.21
          },
          "lastYearSameMonth": {
            *"label": "juin 2024",
            *"value": 2866.45
          }
        }
      }
    }
  },
  "links": {
    "self": "/api/dashboard/metrics?actif=global&date=2025-07-07"
  },
  "meta": {
    "generatedAt": "2025-07-07T10:52:19Z",
    "version": "1.0"
  }
}
```

\</details\>

#### **Réponses d'erreur possibles**

- `400 Bad Request` : Si le paramètre `date` est manquant ou mal formaté.
- `401 Unauthorized` : Si le jeton d'authentification est manquant ou invalide.
- `404 Not Found` : Si l'`actif` demandé n'existe pas.

---

### ✅ Tâches à réaliser

🔹 **1. Créer la route de l'API**

- Déclarer la nouvelle route `GET /api/dashboard/metrics` dans le routeur de l'application.
- Appliquer les middlewares d'authentification nécessaires.

🔹 **2. Développer la logique de récupération des données**

- Créer le contrôleur et les services associés pour gérer la requête.
- Implémenter la logique pour récupérer et agréger toutes les métriques requises depuis la base de données ou d'autres services (réservations, comptabilité, etc.).
- La performance est clé : optimiser les requêtes pour assurer un temps de réponse rapide.

🔹 **3. Structurer la réponse au format JSON:API**

- Mettre en place un "serializer" ou un "transformer" pour formater les données agrégées selon la structure JSON:API spécifiée (incluant `data`, `attributes`, `links`, `meta`).

🔹 **4. Gérer les paramètres et les erreurs**

- Valider les paramètres d'entrée (`date`, `actif`).
- Implémenter la gestion des erreurs pour renvoyer les codes de statut HTTP appropriés.

🔹 **5. Rédiger les tests**

- Écrire des tests unitaires pour la logique de calcul des métriques.
- Écrire des tests d'intégration pour valider le fonctionnement de l'endpoint de bout en bout, incluant les cas d'erreur.

---

### 📎 Livrables attendus

- Un endpoint `GET /api/dashboard/metrics` fonctionnel et déployé.
- Le code source de la fonctionnalité, revu et mergé.
- Une couverture de test adéquate pour la nouvelle logique.
- Une documentation de l'endpoint mise à jour dans notre outil (Swagger/OpenAPI).
