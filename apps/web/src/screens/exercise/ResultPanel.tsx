// Result of a checked attempt from GET /views/attempts/{attemptId} (AttemptResultView): per-target
// correctness AND independence shown separately, each with an icon + text (never colour alone), with
// the reviewed Ukrainian target title and feedback resolved by the service from the pinned task
// revision. The reference answer is shown only on request, labelled as an example when alternatives
// are possible. Unresolved targets use the "In the exercise" flow (D-001): the answer is kept,
// uncertainty is explained, and the learner can edit & retry, skip, keep it for review or open the
// linked rule. No pass/fail wording for unresolved targets.
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AttemptResultView } from '../../api/types.ts';
import { CopyButton, TargetLabel, targetKey } from '../../components/Common.tsx';
import { HelpButton } from '../../components/HelpButton.tsx';

type Verdict = AttemptResultView['verdicts'][number];

const CORRECTNESS_ICON: Record<Verdict['correctness'], string> = {
  correct: '✓',
  incorrect: '✗',
  unresolved: '?',
  'invalid-item': '⚠',
};

export function isUnresolved(result: AttemptResultView): boolean {
  return result.status === 'unresolved' || result.verdicts.some((verdict) => verdict.correctness === 'unresolved');
}

export interface ResultActions {
  readonly onNext: () => void;
  readonly nextLabel: string;
  readonly onRetry: () => void;
  readonly onOpenRule?: () => void;
}

export interface ResultPanelProps {
  readonly result: AttemptResultView;
  readonly actions: ResultActions;
  /** Language of written answers/references ('es-ES'); undefined for choice tasks (option language unknown). */
  readonly answerLang?: string;
}

export const ResultPanel = forwardRef<HTMLHeadingElement, ResultPanelProps>(function ResultPanel({ result, actions, answerLang }, headingRef) {
  const { t } = useTranslation();
  const [showReference, setShowReference] = useState(false);
  const [keptForReview, setKeptForReview] = useState(false);
  const unresolved = isUnresolved(result);

  return (
    <section className="result-panel card" aria-labelledby="result-title" data-testid="result-panel" data-unresolved={unresolved}>
      <h2 id="result-title" ref={headingRef} tabIndex={-1}>
        {unresolved ? t('result.unresolvedTitle') : t('result.title')}
      </h2>

      {unresolved ? (
        <div className="stack" data-testid="unresolved-panel">
          <p>{t('result.unresolvedBody')}</p>
          <p className="muted">{t('result.unresolvedNoGrade')}</p>
        </div>
      ) : null}
      {result.feedbackUk ? <p data-testid="result-feedback">{result.feedbackUk}</p> : null}

      <ul className="verdicts">
        {result.verdicts.map((verdict) => (
          <li key={targetKey(verdict.target)} className={`verdict verdict-${verdict.correctness}`} data-testid="verdict">
            <TargetLabel target={verdict.target} title={verdict.titleUk} />
            <span className="verdict-line">
              <span aria-hidden="true">{CORRECTNESS_ICON[verdict.correctness]}</span>
              <strong>{t(`result.correctness.${verdict.correctness}`)}</strong>
              <span className="muted">·</span>
              <span>{t(`result.independence.${verdict.independence}`)}</span>
            </span>
            {verdict.feedbackUk ? <span className="small">{verdict.feedbackUk}</span> : null}
          </li>
        ))}
      </ul>
      <p className="small" data-testid="support-used">
        {result.supportUsed.length > 0
          ? t('result.supportUsed', { list: result.supportUsed.map((kind) => t(`result.supportKinds.${kind}`)).join(', ') })
          : t('result.noSupportUsed')}
      </p>
      <p className="muted small">
        {t('result.independenceNote')} <HelpButton topic="exercise.result" />
      </p>

      {result.referenceAnswer ? (
        showReference ? (
          <div className="stack" data-testid="reference-answer">
            <p className="notice notice-info">{result.referenceIsExample ? t('result.referenceExample') : t('result.referenceSingle')}</p>
            <p className="strong" lang={answerLang}>
              {result.referenceAnswer}
            </p>
          </div>
        ) : (
          <div className="row">
            <button type="button" className="btn btn-secondary" onClick={() => setShowReference(true)}>
              {t('result.showReference')}
            </button>
          </div>
        )
      ) : null}

      {unresolved ? (
        <div className="stack">
          <div className="row">
            <button type="button" className="btn btn-secondary" onClick={actions.onRetry}>
              {t('result.editRetry')}
            </button>
            {result.savedForReview ? null : (
              <button type="button" className="btn btn-secondary" onClick={() => setKeptForReview(true)} disabled={keptForReview}>
                {t('result.keepForReview')}
              </button>
            )}
            {actions.onOpenRule ? (
              <button type="button" className="btn btn-ghost" onClick={actions.onOpenRule}>
                {t('result.openRule')}
              </button>
            ) : null}
            <HelpButton topic="exercise.unresolved" />
          </div>
          {result.savedForReview ? (
            <p className="notice notice-info" role="status" data-testid="saved-for-review">
              {t('result.savedForReview')}
            </p>
          ) : null}
          {keptForReview ? (
            <div className="notice notice-info" role="status">
              <p>{t('result.keptForReview')}</p>
              <p className="small">
                {t('result.attemptId')}: <code>{result.attemptId}</code> <CopyButton text={result.attemptId} />
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="row">
        <button type="button" className="btn btn-primary" onClick={actions.onNext} data-testid="next-button">
          {actions.nextLabel}
        </button>
        {unresolved ? null : (
          <button type="button" className="btn btn-secondary" onClick={actions.onRetry}>
            {t('result.retry')}
          </button>
        )}
      </div>
    </section>
  );
});
