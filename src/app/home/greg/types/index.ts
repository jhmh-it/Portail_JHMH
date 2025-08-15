/**
 * Export barrel pour les types Greg
 */

export type {
  GregApiResponse,
  GregCategory,
  GregDocument,
  GregDocumentWithStringFields,
  GregSpace,
  GregSpacesFilters,
  GregUser,
  GregReminder,
  GregShift,
  GregHealthResponse,
  GregStats,
} from './greg';

export type {
  SpaceDocumentAccess,
  CreateSpaceDocumentAccessRequest,
  DeleteSpaceDocumentAccessRequest,
} from './space-document-access';

export type {
  SpaceHistoryAccess,
  CreateSpaceHistoryAccessRequest,
  UpdateSpaceHistoryAccessRequest,
  DeleteSpaceHistoryAccessRequest,
} from './space-history-access';
