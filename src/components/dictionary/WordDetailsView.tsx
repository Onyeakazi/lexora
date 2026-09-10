import React, { useState, useEffect } from 'react';
import { WordEntry } from '../../models/word';
import { UserSettings } from '../../models/user';
import { PronunciationPlayer } from './PronunciationPlayer';
import { PronunciationPracticeCard } from './PronunciationPracticeCard';
import { BookmarkButton } from '../common/BookmarkButton';
import { ShareButton } from '../common/ShareButton';
import { CopyButton } from '../common/CopyButton';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Layers, Sparkles, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface WordDetailsViewProps {
  wordEntry: WordEntry;
  settings: UserSettings;
  isSaved: boolean;
  onToggleSave: () => void;
  onNavigateToWord: (word: string) => void;
  onUpdateSettings?: (newSettings: Partial<UserSettings>) => void;
  onShowToast: (msg: string) => void;
}

export const WordDetailsView: React.FC<WordDetailsViewProps> = ({
  wordEntry,
  settings,
  isSaved,
  onToggleSave,
  onNavigateToWord,
  onUpdateSettings,
  onShowToast
}) => {
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(false);
  const [customSimple, setCustomSimple] = useState<string | null>(null);
  const [customThinkOfItAs, setCustomThinkOfItAs] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setCustomSimple(null);
    setCustomThinkOfItAs(null);
  }, [wordEntry.id]);

  const handleSpinLaymanMeaning = async () => {
    setIsSpinning(true);
    try {
      const res = await aiService.generateLaymanExplanation(
        wordEntry.word,
        wordEntry.definitions[0]?.dictionary || '',
        wordEntry.partOfSpeech[0] || 'adjective'
      );
      setCustomSimple(res.simple);
      setCustomThinkOfItAs(res.thinkOfItAs);
      onShowToast('Generated new AI layman explanation!');
    } catch (e) {
      onShowToast('Failed to generate new explanation');
    } finally {
      setIsSpinning(false);
    }
  };

  const mainDef = wordEntry.definitions[0];
  const preferredIsBritish = settings.preferredPronunciation === 'british';

  const practiceQ = wordEntry.practiceQuestions?.[0];

  const handleSelectPracticeOption = (idx: number) => {
    setSelectedPracticeOption(idx);
    setShowPracticeExplanation(true);
  };

  return (
    <article className="content-container">
      {/* 30. WORD HEADER */}
      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 className="word-heading">{wordEntry.word}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
              {wordEntry.partOfSpeech.map(pos => (
                <span key={pos} className="part-of-speech-tag">
                  {pos}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <BookmarkButton isSaved={isSaved} onToggle={onToggleSave} />
            <ShareButton
              title={`Lexora — ${wordEntry.word}`}
              text={`${wordEntry.word} (${wordEntry.partOfSpeech.join(', ')}): ${mainDef?.dictionary || ''}`}
              onSuccess={() => onShowToast('Word link copied!')}
            />
            <CopyButton
              textToCopy={`${wordEntry.word} (${wordEntry.partOfSpeech.join(', ')})\n\nDefinition: ${mainDef?.dictionary}\n\nSimple English: ${mainDef?.simple}`}
              onCopied={() => onShowToast('Copied definition to clipboard')}
            />
          </div>
        </div>
      </header>

      {/* 31. PRONUNCIATION SECTION */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Pronunciation</h2>

        {/* Display user's preferred pronunciation first, then the alternative */}
        {preferredIsBritish ? (
          <>
            <PronunciationPlayer
              word={wordEntry.word}
              variant="british"
              data={wordEntry.pronunciation.british}
              speed={settings.audioSpeed}
              onSpeedChange={newSpeed => onUpdateSettings?.({ audioSpeed: newSpeed })}
              onShowToast={onShowToast}
            />
            <PronunciationPlayer
              word={wordEntry.word}
              variant="american"
              data={wordEntry.pronunciation.american}
              speed={settings.audioSpeed}
              onSpeedChange={newSpeed => onUpdateSettings?.({ audioSpeed: newSpeed })}
              onShowToast={onShowToast}
            />
          </>
        ) : (
          <>
            <PronunciationPlayer
              word={wordEntry.word}
              variant="american"
              data={wordEntry.pronunciation.american}
              speed={settings.audioSpeed}
              onSpeedChange={newSpeed => onUpdateSettings?.({ audioSpeed: newSpeed })}
              onShowToast={onShowToast}
            />
            <PronunciationPlayer
              word={wordEntry.word}
              variant="british"
              data={wordEntry.pronunciation.british}
              speed={settings.audioSpeed}
              onSpeedChange={newSpeed => onUpdateSettings?.({ audioSpeed: newSpeed })}
              onShowToast={onShowToast}
            />
          </>
        )}

        {/* 49. YOUR TURN — PRONUNCIATION PRACTICE */}
        <PronunciationPracticeCard
          targetWord={wordEntry.word}
          variant={settings.preferredPronunciation}
          onShowToast={onShowToast}
        />

        {/* 21. PRONUNCIATION BREAKDOWN (if available) */}
        {wordEntry.pronunciation.breakdown && wordEntry.pronunciation.breakdown.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginTop: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Syllable Breakdown
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {wordEntry.pronunciation.breakdown.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <strong style={{ color: item.isStressed ? 'var(--color-accent)' : 'var(--text-primary)', textTransform: item.isStressed ? 'uppercase' : 'none' }}>
                    {item.syllable}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({item.hint})</span>
                  {idx < wordEntry.pronunciation.breakdown!.length - 1 && <span style={{ color: 'var(--border-color-strong)' }}>•</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* 32. DICTIONARY MEANING */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Dictionary Meaning</h2>
        <div style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--border-color-strong)' }}>
          <p className="dictionary-definition">{mainDef.dictionary}</p>
        </div>
      </section>

      {/* 33. SIMPLE ENGLISH WITH AI SPIN BUTTON */}
      <section style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>In Simple English</h2>
          <button
            type="button"
            onClick={handleSpinLaymanMeaning}
            disabled={isSpinning}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--bg-accent-subtle)',
              border: '1px solid var(--badge-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-accent)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: isSpinning ? 'wait' : 'pointer',
              transition: 'all 200ms ease'
            }}
          >
            {isSpinning ? (
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={14} color="var(--color-accent)" />
            )}
            <span>{isSpinning ? 'Spinning AI...' : 'Spin AI Explanation'}</span>
          </button>
        </div>

        <p className="simple-explanation" style={{ marginBottom: '0.75rem', transition: 'all 300ms ease' }}>
          {customSimple || mainDef.simple}
        </p>

        {(customThinkOfItAs || mainDef.thinkOfItAs) && (
          <div
            style={{
              backgroundColor: 'var(--bg-accent-subtle)',
              padding: '0.875rem 1.125rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--badge-border)',
              transition: 'all 300ms ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--badge-text)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
              THINK OF IT AS
            </span>
            <blockquote style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--badge-text)' }}>
              "{customThinkOfItAs || mainDef.thinkOfItAs}"
            </blockquote>
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* 35 & 36. HOW TO USE IT & GRAMMAR */}
      {wordEntry.usage && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">How To Use It</h2>

          {wordEntry.usage.explanation && (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.55' }}>
              {wordEntry.usage.explanation}
            </p>
          )}

          {/* Grammar Tenses box */}
          {wordEntry.usage.isVerb ? (
            <div className="card-container" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                <Layers size={18} color="var(--color-accent)" />
                <span>Verb Tenses & Usage</span>
              </div>

              {wordEntry.usage.present && (
                <div style={{ marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Present Tense</span>
                  {wordEntry.usage.present.map((s, i) => (
                    <p key={i} style={{ margin: '0.2rem 0', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>"{s}"</p>
                  ))}
                </div>
              )}

              {wordEntry.usage.past && (
                <div style={{ marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Past Tense</span>
                  {wordEntry.usage.past.map((s, i) => (
                    <p key={i} style={{ margin: '0.2rem 0', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>"{s}"</p>
                  ))}
                </div>
              )}

              {wordEntry.usage.future && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Future Tense</span>
                  {wordEntry.usage.future.map((s, i) => (
                    <p key={i} style={{ margin: '0.2rem 0', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>"{s}"</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Grammar Note: </strong>
              "{wordEntry.word}" is an {wordEntry.partOfSpeech.join('/')}. It does not have present, past, or future forms. The tense comes from the main verb in your sentence.
            </div>
          )}
        </section>
      )}

      {/* 37. REAL-LIFE EXAMPLES */}
      {wordEntry.examples && wordEntry.examples.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">Real-Life Examples</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wordEntry.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span className="badge" style={{ marginBottom: '0.375rem' }}>
                  {ex.context}
                </span>
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                  "{ex.sentence}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="divider" />

      {/* 38. WHEN TO USE IT */}
      {wordEntry.whenToUse && wordEntry.whenToUse.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#22c55e" />
            <span>When To Use It</span>
          </h2>
          <div
            style={{
              padding: '1rem 1.125rem',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', lineHeight: '1.65' }}>
              {wordEntry.whenToUse.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.4rem', fontWeight: 500 }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 39. WHEN NOT TO USE IT */}
      {wordEntry.whenNotToUse && wordEntry.whenNotToUse.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={18} color="#ef4444" />
            <span>When NOT To Use It</span>
          </h2>
          <div
            style={{
              padding: '1rem 1.125rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              {wordEntry.whenNotToUse.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 40. COMMON PHRASES */}
      {wordEntry.commonPhrases && wordEntry.commonPhrases.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">Common Phrases</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {wordEntry.commonPhrases.map((phrase, i) => (
              <div
                key={i}
                style={{
                  padding: '0.5rem 0.875rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}
              >
                {phrase}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 41. SIMILAR WORDS */}
      {wordEntry.synonyms && wordEntry.synonyms.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">Similar Words</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {wordEntry.synonyms.map((syn, i) => (
              <div
                key={i}
                onClick={() => onNavigateToWord(syn.word)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-accent)', fontSize: '1rem' }}>{syn.word}</strong>
                  {syn.distinction && (
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {syn.distinction}
                    </p>
                  )}
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 42. OPPOSITES */}
      {wordEntry.antonyms && wordEntry.antonyms.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">Opposites</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {wordEntry.antonyms.map((ant, i) => (
              <span
                key={i}
                onClick={() => onNavigateToWord(ant)}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {ant}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 43. MEMORY TIP */}
      {wordEntry.memoryTip && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 className="section-title">Remember It</h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color-strong)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Lightbulb size={24} color="var(--color-accent)" />
            <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {wordEntry.memoryTip}
            </strong>
          </div>
        </section>
      )}

      {/* 44. PRACTICE CARD */}
      {practiceQ && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Practice This Word</h2>
          <div className="card-container">
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              {practiceQ.question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {practiceQ.options.map((opt, idx) => {
                const isSelected = selectedPracticeOption === idx;
                const isCorrect = idx === practiceQ.correctAnswerIndex;

                let border = '1px solid var(--border-color)';
                let bg = 'var(--bg-surface)';

                if (showPracticeExplanation) {
                  if (isCorrect) {
                    border = '1.5px solid #16a34a';
                    bg = 'rgba(22, 163, 74, 0.08)';
                  } else if (isSelected) {
                    border = '1.5px solid #dc2626';
                    bg = 'rgba(220, 38, 38, 0.08)';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPracticeOption(idx)}
                    disabled={showPracticeExplanation}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border,
                      backgroundColor: bg,
                      textAlign: 'left',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      cursor: showPracticeExplanation ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{opt}</span>
                    {showPracticeExplanation && isCorrect && <CheckCircle2 size={18} color="#16a34a" />}
                    {showPracticeExplanation && isSelected && !isCorrect && <XCircle size={18} color="#dc2626" />}
                  </button>
                );
              })}
            </div>

            {showPracticeExplanation && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}
              >
                <strong style={{ color: selectedPracticeOption === practiceQ.correctAnswerIndex ? '#16a34a' : 'var(--text-primary)' }}>
                  {selectedPracticeOption === practiceQ.correctAnswerIndex ? 'Correct! ' : 'Explanation: '}
                </strong>
                {practiceQ.explanation}
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
};
