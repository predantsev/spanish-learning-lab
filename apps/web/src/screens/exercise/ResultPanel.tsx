// Result of a checked attempt: per-target correctness AND independence shown separately, each with
// an icon + text (never colour alone). Unresolved targets use the "In the exercise" flow (D-001):
// the answer is kept, uncertainty is explained, a reference is an example rather than a verdict,
// and the learner can edit & retry, skip, keep it for external review or open the linked rule.
// No pass/fail wording for unresolved targets.
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Attempt, Verdict } from '../../api/types.ts';
import { CopyButton, TargetLabel, targetKey } from '../../components/Common.tsx';
import { HelpButton } from '../../components/HelpButton.tsx';

const CORRECTNESS_ICON: Record<Verdict['correctness'], string> = {
  correct: '✓',
  incorrect: '✗',
  unresolved: '?',
  'invalid-item': '⚠',
};

export function isUnresolved(attempt: Attempt): boolean {
  return attempt.status === 'unresolved' || attempt.verdicts.some((verdict) => verdict.correctness === 'unresolved');
}

export interface ResultActions {
  readonly onNext: () => void;
  readonly nextLabel: string;
  readonly onRetry: () => void;
  readonly onShowReference?: () => void;
  readonly onOpenRule?: () => void;
  readonly referencePending: boolean;
}

export const ResultPanel = forwardRef<HTMLHeadingElement, { readonly attempt: Attempt; readonly titles: ReadonlyMap<string, string>; readonly actions: ResultActions }>(
  function ResultPanel({ attempt, titles, actions }, headingRef) {
    const { t, i18n } = useTranslation();
    const [keptForReview, setKeptForReview] = useState(false);
    const unresolved = isUnresolved(attempt);

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

        <ul className="verdicts">
          {attempt.verdicts.map((verdict) => (
            <li key={targetKey(verdict.target)} className={`verdict verdict-${verdict.correctness}`} data-testid="verdict">
              <TargetLabel target={verdict.target} title={titles.get(targetKey(verdict.target))} />
              <span className="verdict-line">
                <span aria-hidden="true">{CORRECTNESS_ICON[verdict.correctness]}</span>
                <strong>{t(`result.correctness.${verdict.correctness}`)}</strong>
                <span className="muted">·</span>
                <span>{t(`result.independence.${verdict.independence}`)}</span>
              </span>
              {i18n.exists(`feedback.${verdict.explanationKey}`) ? <span className="small">{t(`feedback.${verdict.explanationKey}`)}</span> : null}
            </li>
          ))}
        </ul>
        <p className="muted small">
          {t('result.independenceNote')} <HelpButton topic="exercise.result" />
        </p>

        {unresolved ? (
          <div className="stack">
            <div className="row">
              {actions.onShowReference ? (
                <button type="button" className="btn btn-secondary" disabled={actions.referencePending} onClick={actions.onShowReference}>
                  {t('result.showReference')}
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary" onClick={actions.onRetry}>
                {t('result.editRetry')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setKeptForReview(true)} disabled={keptForReview}>
                {t('result.keepForReview')}
              </button>
              {actions.onOpenRule ? (
                <button type="button" className="btn btn-ghost" onClick={actions.onOpenRule}>
                  {t('result.openRule')}
                </button>
              ) : null}
              <HelpButton topic="exercise.unresolved" />
            </div>
            {keptForReview ? (
              <div className="notice notice-info" role="status">
                <p>{t('result.keptForReview')}</p>
                <p className="small">
                  {t('result.attemptId')}: <code>{attempt.id}</code> <CopyButton text={attempt.id} />
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
  },
);
