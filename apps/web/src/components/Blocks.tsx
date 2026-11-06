// Typed content blocks (D-018): every block type has its own component and renders text only as
// React text nodes. No innerHTML, no links/URLs, no remote media, no injected actions. Unknown block
// types render an explicit "unsupported" notice instead of their data.
import { useTranslation } from 'react-i18next';
import type { Block } from '../api/types.ts';

type PracticeLinkBlock = Extract<Block, { type: 'practice-link' }>;

export interface PracticeLinkState {
  readonly enabled: boolean;
  /** Locale key explaining why the link is disabled. */
  readonly reasonKey?: string;
}

export interface BlocksProps {
  readonly blocks: readonly Block[];
  /** Handles a reviewed practice link (normal scoped-practice flow). Absent = links shown disabled. */
  readonly onPracticeLink?: (block: PracticeLinkBlock) => void;
  readonly practiceLinkState?: PracticeLinkState;
}

function langOf(language: 'uk' | 'es-ES'): string {
  return language === 'es-ES' ? 'es-ES' : 'uk';
}

export function Blocks({ blocks, onPracticeLink, practiceLinkState }: BlocksProps) {
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} onPracticeLink={onPracticeLink} practiceLinkState={practiceLinkState} />
      ))}
    </div>
  );
}

function BlockView({
  block,
  onPracticeLink,
  practiceLinkState,
}: {
  readonly block: Block;
  readonly onPracticeLink?: (block: PracticeLinkBlock) => void;
  readonly practiceLinkState?: PracticeLinkState;
}) {
  const { t } = useTranslation();
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="block-paragraph" lang={langOf(block.language)}>
          {block.text}
        </p>
      );
    case 'bullet-list':
      return (
        <ul className="block-list" lang={langOf(block.language)}>
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'example':
      return (
        <div className="block-example">
          <p className="example-es" lang="es-ES">
            {block.spanish}
          </p>
          <p className="example-uk" lang="uk">
            {block.ukrainian}
          </p>
        </div>
      );
    case 'table': {
      const width = block.columns.length;
      return (
        <div className="table-scroll" role="region" aria-label={t('blocks.tableRegion')} tabIndex={0}>
          <table className="block-table" lang={langOf(block.language)}>
            <thead>
              <tr>
                {block.columns.map((column, index) => (
                  <th key={index} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: width }, (_, cellIndex) => (
                    <td key={cellIndex}>{row[cellIndex] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'practice-link': {
      const enabled = Boolean(onPracticeLink) && (practiceLinkState?.enabled ?? true);
      return (
        <div className="block-practice-link">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!enabled}
            onClick={() => onPracticeLink?.(block)}
          >
            {block.labelUk}
          </button>
          <span className="muted">
            {t(`modes.${block.mode}`)} · {t('blocks.practiceLinkItems', { count: block.maxItems })}
          </span>
          {!enabled ? <p className="muted small">{t(practiceLinkState?.reasonKey ?? 'blocks.practiceLinkDisabled')}</p> : null}
        </div>
      );
    }
    default:
      return <p className="notice notice-warning">{t('blocks.unsupported')}</p>;
  }
}
