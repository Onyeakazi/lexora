import React, { useState } from 'react';
import { Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import { speechRecognitionService, SpeechState, SpeechFeedback } from '../../services/speechRecognitionService';
import { PreferredPronunciation } from '../../models/user';

interface PronunciationPracticeCardProps {
  targetWord: string;
  variant?: PreferredPronunciation;
  onShowToast?: (msg: string) => void;
}

export const PronunciationPracticeCard: React.FC<PronunciationPracticeCardProps> = ({
  targetWord,
  variant = 'british',
  onShowToast
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  const handleToggleListening = () => {
    if (speechState === 'listening') {
      stopFn?.();
      setSpeechState('idle');
      setFeedbackMessage(null);
      return;
    }

    const cancel = speechRecognitionService.startListening({
      targetWord,
      variant,
      onFeedback: (fb: SpeechFeedback) => {
        setSpeechState(fb.state);
        if (fb.message) setFeedbackMessage(fb.message);

        if (fb.state === 'success') {
          onShowToast?.(`Great pronunciation! You spoke "${targetWord}".`);
        }
      }
    });

    setStopFn(() => cancel);
  };

  const isListening = speechState === 'listening';
  const isSuccess = speechState === 'success';

  return (
    <div
      style={{
        padding: '1.5rem 1.25rem',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color-strong)',
        textAlign: 'center',
        marginTop: '1rem',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'block',
          marginBottom: '1rem'
        }}
      >
        YOUR TURN
      </span>

      {/* MIC BUTTON */}
      <button
        onClick={handleToggleListening}
        aria-label={`Tap to practice pronouncing ${targetWord}`}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isListening
            ? '#ef4444'
            : isSuccess
            ? '#16a34a'
            : 'var(--bg-surface)',
          color: isListening || isSuccess ? '#ffffff' : 'var(--color-accent)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isListening
            ? '0 0 0 10px rgba(239, 68, 68, 0.2)'
            : 'var(--shadow-md)',
          transition: 'all 200ms ease-out',
          margin: '0 auto 0.875rem auto'
        }}
      >
        {isListening ? (
          <Mic size={32} style={{ animation: 'pulse 1s infinite' }} />
        ) : isSuccess ? (
          <CheckCircle2 size={32} />
        ) : (
          <Mic size={32} />
        )}
      </button>

      {/* STATUS ACTION TEXT */}
      <span
        style={{
          display: 'block',
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}
      >
        {isListening
          ? 'Listening... Say the word!'
          : isSuccess
          ? 'Great job!'
          : 'Tap to speak'}
      </span>

      {/* FEEDBACK & TRANSCRIPT */}
      {feedbackMessage && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            lineHeight: '1.4',
            color: isSuccess ? '#16a34a' : 'var(--text-primary)',
            maxWidth: '360px',
            margin: '0.5rem auto 0 auto'
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* RETRY BUTTON */}
      {(speechState === 'retry' || isSuccess) && (
        <button
          onClick={handleToggleListening}
          style={{
            marginTop: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
};
