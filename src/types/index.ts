/**
 * Barrel export pour tous les types du projet
 * Permet d'importer facilement : import { AccountingTool } from '@/types'
 */

// Types existants
export * from './auth';
export * from './dashboard';
export * from './guest';
export * from './listing';
export * from './reservation';
export * from './reservation-details';
export * from './reservation-fields';
export * from './greg';
// Note: actifs types conflicts with dashboard types, import directly from './actifs' if needed

// Nouveaux types accounting
export * from './accounting';

// Types auth
export * from './auth';

// Types dashboard
export * from './dashboard';
