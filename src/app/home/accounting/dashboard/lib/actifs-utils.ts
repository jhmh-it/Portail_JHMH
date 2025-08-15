/**
 * Utilitaires pour la transformation des données d'actifs
 */

import type { ActifOption } from '../types';

// Type d'entrée minimal attendu (basé sur les besoins réels)
interface ActifListing {
  code_site: string;
  listing_complet?: string;
}

/**
 * Transforme les données d'actifs en options pour le dashboard
 * @param actifsData - Données brutes des actifs
 * @returns Options d'actifs formatées pour les selects
 */
export function transformActifsToOptions(
  actifsData: ActifListing[]
): ActifOption[] {
  if (!Array.isArray(actifsData)) {
    return [];
  }

  // Utiliser un Map pour éviter les doublons et avoir un accès O(1)
  const uniqueSites = new Map<string, ActifOption>();

  actifsData.forEach(actif => {
    // Valider que code_site existe et n'est pas vide
    if (actif.code_site && !uniqueSites.has(actif.code_site)) {
      uniqueSites.set(actif.code_site, {
        id: actif.code_site,
        label: actif.listing_complet ?? actif.code_site, // Utiliser listing_complet s'il existe, sinon code_site
        type: 'property' as const,
      });
    }
  });

  return Array.from(uniqueSites.values());
}

/**
 * Trouve le premier actif valide dans une liste
 * @param actifs - Liste des options d'actifs
 * @returns Premier actif ou null si aucun
 */
export function getFirstValidActif(actifs: ActifOption[]): ActifOption | null {
  return actifs.length > 0 ? actifs[0] : null;
}

/**
 * Vérifie si un actif est valide
 * @param actifId - ID de l'actif à vérifier
 * @param actifs - Liste des actifs disponibles
 * @returns true si l'actif existe dans la liste
 */
export function isValidActif(actifId: string, actifs: ActifOption[]): boolean {
  return actifs.some(actif => actif.id === actifId);
}
