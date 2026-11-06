// Contextual `?` help (C-053): explains what a control does, how to use it, and whether using it
// counts as language support. Opens on click/tap/keyboard (never hover-only); Escape closes and
// focus returns to the `?` button. Interface help itself is neutral (not language support).
import { useContext, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpObserverContext } from '../app/context.tsx';

export interface HelpButtonProps {
  /** Key under `help.` in the locale file: `help.<topic>.title|what|how|support`. */
  readonly topic: string;
  readonly className?: string;
}

export function HelpButton({ topic, className }: HelpButtonProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const observe = useContext(HelpObserverContext);
  const title = t(`help.${topic}.title`);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const howKey = `help.${topic}.how`;
  const supportKey = `help.${topic}.support`;
  return (
    <span className={`help ${className ?? ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="help-button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('help.buttonLabel', { topic: title })}
        onClick={() => {
          setOpen((value) => {
            if (!value) observe?.(topic);
            return !value;
          });
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      <div ref={panelRef} id={panelId} className="help-panel" role="region" aria-label={title} hidden={!open}>
        <p className="help-title">{title}</p>
        <p>{t(`help.${topic}.what`)}</p>
        {i18n.exists(howKey) ? <p>{t(howKey)}</p> : null}
        <p className="help-support">{i18n.exists(supportKey) ? t(supportKey) : t('help.neutral')}</p>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </span>
  );
}
