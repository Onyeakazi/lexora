import React, { useState } from 'react';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { dictionaryService } from '../../services/dictionaryService';
import { PracticeQuestion, WordEntry } from '../../models/word';
import { audioService } from '../../services/audioService';
import { UserSettings } from '../../models/user';
import { PronunciationPracticeCard } from '../dictionary/PronunciationPracticeCard';

interface PracticeViewProps {
  settings: UserSettings;
  onSelectWord: (word: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  settings,
  onSelectWord
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'pronunciation'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const allWords = dictionaryService.getAllWords();
  const allQuestions: { question: PracticeQuestion; word: WordEntry }[] = [];
  allWords.forEach(w => {
    w.practiceQuestions?.forEach(q => {
      allQuestions.push({ question: q, word: w });
    });
  });

  const currentItem = allQuestions[currentQuestionIndex % (allQuestions.length || 1)];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (currentItem && idx === currentItem.question.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestionIndex(i => i + 1);
  };

  const handleListenPronunciation = (word: string, variant: 'british' | 'american') => {
    audioService.playPronunciation({
      word,
      variant,
      speed: settings.audioSpeed
    });
  };

  return (
    <div className="content-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="word-heading" style={{ fontSize: '2rem', margin: 0 }}>Practice</h1>
        <div className="badge" style={{ fontSize: '0.85rem' }}>
          Score: {score}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'quiz' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'quiz' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Word Quiz
        </button>
        <button
          onClick={() => setActiveTab('pronunciation')}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'pronunciation' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'pronunciation' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Pronunciation
        </button>
      </div>

      {activeTab === 'quiz' && currentItem && (
        <div className="card-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Question {currentQuestionIndex + 1}
            </span>
            <span
              onClick={() => onSelectWord(currentItem.word.word)}
              style={{ fontSize: '0.85rem', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              Review "{currentItem.word.word}"
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', lineHeight: '1.4' }}>
            {currentItem.question.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            {currentItem.question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentItem.question.correctAnswerIndex;

              let border = '1px solid var(--border-color)';
              let bg = 'var(--bg-surface)';

              if (isAnswered) {
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
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border,
                    backgroundColor: bg,
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="#16a34a" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="#dc2626" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginBottom: '1rem'
                }}
              >
                <strong style={{ color: selectedOption === currentItem.question.correctAnswerIndex ? '#16a34a' : 'var(--text-primary)' }}>
                  {selectedOption === currentItem.question.correctAnswerIndex ? 'Correct! ' : 'Explanation: '}
                </strong>
                {currentItem.question.explanation}
              </div>

              <button className="btn-primary" onClick={handleNextQuestion} style={{ width: '100%' }}>
                <span>Next Question</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pronunciation' && currentItem && (
        <div className="card-container" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
          <h2 className="word-heading" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>
            {currentItem.word.word}
          </h2>
          <p className="part-of-speech-tag" style={{ marginBottom: '1.5rem' }}>
            {currentItem.word.partOfSpeech.join(', ')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <button
              className="btn-primary"
              onClick={() => handleListenPronunciation(currentItem.word.word, 'british')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Volume2 size={18} />
              <span>GB British</span>
            </button>
            <button
              className="btn-primary"
              onClick={() => handleListenPronunciation(currentItem.word.word, 'american')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Volume2 size={18} />
              <span>US American</span>
            </button>
          </div>

          <PronunciationPracticeCard
            targetWord={currentItem.word.word}
            variant={settings.preferredPronunciation}
          />
        </div>
      )}
    </div>
  );
};
