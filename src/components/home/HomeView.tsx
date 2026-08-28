import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Clock, ArrowRight, Mic } from 'lucide-react';
import { WordEntry } from '../../models/word';
import { dictionaryService } from '../../services/dictionaryService';
import { storageService } from '../../services/storageService';
import { speechRecognitionService } from '../../services/speechRecognitionService';

interface HomeViewProps {
  onGoToSearch: (initialQuery?: string) => void;
  onSelectWord: (word: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGoToSearch, onSelectWord }) => {
  const [wordOfTheDay, setWordOfTheDay] = useState<WordEntry | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [greeting, setGreeting] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  useEffect(() => {
    setWordOfTheDay(dictionaryService.getWordOfTheDay());
    setRecentSearches(storageService.getRecentSearches().slice(0, 4));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleVoiceSearchHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoiceListening) {
      speechRecognitionService.stopListening();
      setIsVoiceListening(false);
      return;
    }

    speechRecognitionService.startVoiceSearch({
      onResult: spokenWord => {
        onSelectWord(spokenWord);
      },
      onStateChange: listening => {
        setIsVoiceListening(listening);
      }
    });
  };

  return (
    <div className="content-container">
      {/* 22. GREETING HEADER */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {greeting}
        </span>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.1rem', fontWeight: 700, margin: '0.25rem 0 0 0', lineHeight: '1.2' }}>
          What word do you want to learn?
        </h1>
      </div>

      {/* 23. LARGE SEARCH TRIGGER FIELD WITH VOICE SEARCH */}
      <div
        onClick={() => onGoToSearch()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.125rem',
          backgroundColor: 'var(--bg-surface)',
          border: isVoiceListening ? '1.5px solid #ef4444' : '1.5px solid var(--border-color-strong)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginBottom: '2rem',
          boxShadow: isVoiceListening ? '0 0 0 4px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)',
          transition: 'all 200ms ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <Search size={20} color="var(--text-muted)" />
          <span style={{ fontSize: '1.05rem', color: isVoiceListening ? '#ef4444' : 'var(--text-muted)', fontWeight: isVoiceListening ? 600 : 400 }}>
            {isVoiceListening ? 'Listening... Speak a word!' : 'Search a word...'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleVoiceSearchHome}
          aria-label="Voice Search"
          style={{
            border: 'none',
            background: isVoiceListening ? '#ef4444' : 'var(--bg-subtle)',
            color: isVoiceListening ? '#ffffff' : 'var(--color-accent)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isVoiceListening ? '0 0 0 6px rgba(239, 68, 68, 0.25)' : 'none',
            transition: 'all 200ms ease'
          }}
        >
          <Mic size={18} style={{ animation: isVoiceListening ? 'pulse 1s infinite' : 'none' }} />
        </button>
      </div>

      {/* 24. WORD OF THE DAY */}
      {wordOfTheDay && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="section-title" style={{ margin: 0 }}>Word of the Day</span>
          </div>

          <div
            onClick={() => onSelectWord(wordOfTheDay.word)}
            style={{
              padding: '1.25rem 1.25rem 1.5rem 1.25rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', margin: 0, fontWeight: 700 }}>
                {wordOfTheDay.word}
              </h2>
              <span className="part-of-speech-tag">{wordOfTheDay.partOfSpeech.join(', ')}</span>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', lineHeight: '1.55', margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
              "{wordOfTheDay.definitions[0]?.dictionary}"
            </p>

            <button
              className="btn-primary"
              onClick={e => {
                e.stopPropagation();
                onSelectWord(wordOfTheDay.word);
              }}
              style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} />
              <span>Learn Word</span>
            </button>
          </div>
        </section>
      )}

      {/* 25. RECENTLY VIEWED WORDS */}
      {recentSearches.length > 0 && (
        <section>
          <h2 className="section-title">Recently Viewed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {recentSearches.map(word => {
              const entry = dictionaryService.getWordLocal(word);
              return (
                <div
                  key={word}
                  onClick={() => onSelectWord(word)}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', margin: 0 }}>
                        {word}
                      </h3>
                      {entry && <span className="part-of-speech-tag">{entry.partOfSpeech.join(', ')}</span>}
                    </div>
                    {entry && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {entry.definitions[0]?.simple || entry.definitions[0]?.dictionary}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Clock size={16} />
                    <ArrowRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
