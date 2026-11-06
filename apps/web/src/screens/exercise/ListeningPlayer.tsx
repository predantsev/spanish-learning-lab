// "Listening focus" player (C-054/C-082): playback only from an explicit learner gesture, no
// autoplay (also not on Next), replay and 1 / 0.85 speed are neutral (reported via support.observe),
// a playback failure offers Retry and an explicit written alternative. No microphone, ever.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PlaybackSpeed = 1 | 0.85;

export interface ListeningPlayerProps {
  readonly src: string;
  readonly label: string;
  readonly defaultSpeed: PlaybackSpeed;
  readonly onReplay: () => void;
  readonly onSpeedChange: (speed: PlaybackSpeed) => void;
  readonly onError: () => void;
  readonly onWrittenAlternative: () => void;
}

type PlayerState = 'idle' | 'playing' | 'paused' | 'ended' | 'error';

export function ListeningPlayer({ src, label, defaultSpeed, onReplay, onSpeedChange, onError, onWrittenAlternative }: ListeningPlayerProps) {
  const { t, i18n } = useTranslation();
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>('idle');
  const [speed, setSpeed] = useState<PlaybackSpeed>(defaultSpeed);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed;
  }, [speed]);

  const fail = () => {
    setState('error');
    onError();
  };

  const play = async (fromStart: boolean) => {
    const element = audio.current;
    if (!element) return;
    if (fromStart) {
      element.currentTime = 0;
      if (played) onReplay();
    }
    element.playbackRate = speed;
    try {
      await element.play();
      setPlayed(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      fail();
    }
  };

  const retry = () => {
    const element = audio.current;
    if (!element) return;
    setState('idle');
    element.load();
  };

  return (
    <div className="player" data-testid="listening-player" data-state={state}>
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setState('playing')}
        onPause={() => setState((previous) => (previous === 'error' ? previous : 'paused'))}
        onEnded={() => setState('ended')}
        onError={fail}
        aria-label={label}
      />
      {state === 'error' ? (
        <div className="notice notice-error" role="alert">
          <p>{t('listening.player.error')}</p>
          <div className="row">
            <button type="button" className="btn btn-secondary" onClick={retry}>
              {t('listening.player.retry')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onWrittenAlternative}>
              {t('listening.player.writtenAlternative')}
            </button>
          </div>
          <p className="small">{t('listening.player.errorNote')}</p>
        </div>
      ) : (
        <>
          {state === 'playing' ? (
            <button type="button" className="btn btn-primary" onClick={() => audio.current?.pause()}>
              {t('listening.player.pause')}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => void play(state === 'ended' || !played)}>
              {played && state !== 'ended' ? t('listening.player.continue') : t('listening.player.play')}
            </button>
          )}
          <button type="button" className="btn btn-secondary" disabled={!played} onClick={() => void play(true)}>
            {t('listening.player.replay')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            aria-pressed={speed === 0.85}
            onClick={() => {
              const next: PlaybackSpeed = speed === 1 ? 0.85 : 1;
              setSpeed(next);
              onSpeedChange(next);
            }}
          >
            {speed === 1 ? t('listening.player.slower') : t('listening.player.normal')}
          </button>
          <span className="muted small" role="status" aria-live="polite">
            {t(`listening.player.state.${state}`)} · {t('listening.player.speed', { speed: new Intl.NumberFormat(i18n.language).format(speed) })}
          </span>
        </>
      )}
    </div>
  );
}
