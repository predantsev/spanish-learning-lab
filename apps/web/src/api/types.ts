// Wire types come only from the generated contract package (type-only: nothing from
// @sll/contracts is bundled into the browser build).
export type {
  ApiError as ApiErrorBody,
  Artifact,
  Attempt,
  Block,
  CatalogEntry,
  CatalogPage,
  Collection,
  Command,
  Context,
  ContextMeta,
  Draft,
  ExerciseTask,
  ExerciseView,
  ExportRequest,
  RestoreConfirm,
  RestorePreviewRequest,
  TokenCreate,
  Health,
  HomeView,
  LearningSession,
  LessonProgress,
  LessonView,
  ListeningView,
  MaterialsView,
  OwnerProfile,
  PhraseLibraryView,
  PracticeSet,
  ProgressView,
  Receipt,
  Ref,
  RestorePreview,
  Scope,
  Session,
  Summary,
  Support,
  Target,
  TimezonePreview,
  TokenCreated,
  TokenList,
  TokenMetadata,
  Verdict,
} from '@sll/contracts';

/** Private read envelope shared by every authenticated GET (openapi.json). */
export interface Envelope<T> {
  readonly apiVersion: '1';
  readonly requestId: string;
  readonly profileEpoch: number;
  readonly data: T;
}

/** Resource types accepted by GET /resources/{resourceType}/{id}. */
export type ResourceType =
  | 'lesson'
  | 'task'
  | 'phrase'
  | 'material'
  | 'collection'
  | 'practice-set'
  | 'attempt'
  | 'review'
  | 'preference'
  | 'summary'
  | 'support'
  | 'session'
  | 'lesson-progress'
  | 'timezone-preview';

/** Common body of owner-only control writes (tokens, recovery, logout). */
export interface OwnerWriteBase {
  readonly operationId: string;
  readonly profileEpoch: number;
  readonly expectedRevision: number;
}
