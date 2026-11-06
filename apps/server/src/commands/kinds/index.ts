// Command kind → handler. review.validate / content.promote are privileged local-CLI commands and are
// never executed over HTTP (403 before reaching this table).
import type { CommandHandler, CommandKind } from '../env.ts';
import { lessonProgress, sessionFinish, sessionStart } from './session.ts';
import { attemptSubmit, contextActivity, contextClose, contextOpen, draftSave } from './context.ts';
import { supportCancel, supportConfirm, supportObserve, supportPrepare, supportRequest } from './support.ts';
import { collectionCreate, collectionPatch, materialDraft, phraseArchive, phraseCapture, practiceCreate, reviewSubmit } from './library.ts';
import { preferenceSet, profileSettings, profileTimezonePreview } from './profile.ts';

export const HANDLERS: Partial<Record<CommandKind, CommandHandler>> = {
  'session.start': sessionStart,
  'session.finish': sessionFinish,
  'lesson.progress': lessonProgress,
  'context.open': contextOpen,
  'context.activity': contextActivity,
  'context.close': contextClose,
  'draft.save': draftSave,
  'attempt.submit': attemptSubmit,
  'support.observe': supportObserve,
  'support.request': supportRequest,
  'support.prepare': supportPrepare,
  'support.confirm': supportConfirm,
  'support.cancel': supportCancel,
  'practice.create': practiceCreate,
  'phrase.capture': phraseCapture,
  'phrase.archive': phraseArchive,
  'material.draft': materialDraft,
  'collection.create': collectionCreate,
  'collection.patch': collectionPatch,
  'preference.set': preferenceSet,
  'review.submit': reviewSubmit,
  'profile.timezone-preview': profileTimezonePreview,
  'profile.settings': profileSettings,
};
