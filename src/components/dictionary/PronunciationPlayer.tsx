import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2, Turtle } from 'lucide-react';
import { PronunciationVariant } from '../../models/word';
import { PreferredPronunciation, AudioSpeed } from '../../models/user';
import { audioService, AudioState } from '../../services/audioService';
import { CopyButton } from '../common/CopyButton';

interface PronunciationPlayerProps {
  word: string;
  variant: PreferredPronunciation;
  data?: PronunciationVariant;
  speed?: AudioSpeed;
  onSpeedChange?: (newSpeed: AudioSpeed) => void;
  onShowToast?: (msg: string) => void;
}

const SPEED_OPTIONS: { speed: AudioSpeed; label: string; icon?: React.ReactNode }[] = [
  { speed: 0.5, label: '0.5x Slow', icon: <Turtle size={14} /> },
  { speed: 0.75, label: '0.75x' },
  { speed: 1, label: '1x Normal' },
  { speed: 1.25, label: '1.25x' }
];

export const PronunciationPlayer: React.FC<PronunciationPlayerProps> = ({
  word,
  variant,
  data,
  speed = 1,
  onSpeedChange,
  onShowToast
}) => {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<AudioSpeed>(speed);

  if (!data) return null;

  const isBritish = variant === 'british';
  const flagTag = isBritish ? 'GB' : 'US';
  const title = isBritish ? 'British English' : 'American English';

  const handleListen = (overrideSpeed?: AudioSpeed) => {
    const playSpeed = overrideSpeed || currentSpeed;
    setErrorMessage(null);
    audioService.playPronunciation({
      word,
      variant,
      audioUrl: data.audioUrl,
      speed: playSpeed,
      onStateChange: (state, err) => {
        setAudioState(state);
        if (err) {
          setErrorMessage(err);
          onShowToast?.(err);
        }
      }
    });
  };

  const handleSelectSpeed = (newSpeed: AudioSpeed) => {
    setCurrentSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
    onShowToast?.(`Playback speed set to ${newSpeed}x`);
    if (audioState === 'playing') {
      handleListen(newSpeed);
    }
  };

  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        marginBottom: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge">{flagTag}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>

        {data.ipa && <CopyButton textToCopy={data.ipa} label="IPA" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {data.ipa && <span className="ipa-text">{data.ipa}</span>}
        {data.phonetic && <span className="phonetic-guide">{data.phonetic}</span>}
      </div>

      {/* LISTEN BUTTON & INLINE SPEED CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {audioState === 'unavailable' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <VolumeX size={16} />
              <span>Audio unavailable</span>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => handleListen()}
              aria-label={`Play ${title} pronunciation for ${word} at ${currentSpeed}x speed`}
              disabled={audioState === 'loading'}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                width: 'auto'
              }}
            >
              {audioState === 'loading' ? (
                <>
                  <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Loading...</span>
                </>
              ) : audioState === 'playing' ? (
                <>
                  <Volume2 size={16} />
                  <span>Playing ({currentSpeed}x)...</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} />
                  <span>Listen ({title})</span>
                </>
              )}
            </button>
          )}

          {/* Quick Slow Motion (0.5x) Button */}
          <button
            onClick={() => handleSelectSpeed(0.5)}
            title="Slow down pronunciation to 0.5x"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.45rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: currentSpeed === 0.5 ? '1.5px solid var(--color-accent)' : '1px solid var(--border-color)',
              backgroundColor: currentSpeed === 0.5 ? 'var(--bg-accent-subtle)' : 'var(--bg-subtle)',
              color: currentSpeed === 0.5 ? 'var(--color-accent)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Turtle size={14} />
            <span>0.5x Slow</span>
          </button>
        </div>

        {/* SPEED SELECTOR PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            SPEED:
          </span>
          {SPEED_OPTIONS.map(opt => {
            const isSelected = currentSpeed === opt.speed;
            return (
              <button
                key={opt.speed}
                onClick={() => handleSelectSpeed(opt.speed)}
                aria-label={`Set voice speed to ${opt.label}`}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--bg-accent-subtle)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--color-accent)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <span style={{ display: 'block', marginTop: '0.375rem', fontSize: '0.8rem', color: '#ef4444' }}>
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
};
