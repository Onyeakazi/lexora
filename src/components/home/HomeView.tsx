import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { dictionaryService } from '../../services/dictionaryService';
import { storageService } from '../../services/storageService';

interface HomeViewProps {
  onGoToSearch: (query?: string) => void;
  onSelectWord: (word: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onGoToSearch,
  onSelectWord
}) => {
  const wordOfTheDay = dictionaryService.getWordOfTheDay();
  const recentSearches = storageService.getRecentSearches().slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="content-container">
      {/* 23. HOME HEADER */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {greeting}
        </span>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.1rem', fontWeight: 700, margin: '0.25rem 0 0 0', lineHeight: '1.2' }}>
          What word do you want to learn?
        </h1>
      </div>

      {/* 23. LARGE SEARCH TRIGGER FIELD */}
      <div
        onClick={() => onGoToSearch()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1.125rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--border-color-strong)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Search size={20} color="var(--text-muted)" />
        <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          Search a word...
        </span>
      </div>

      {/* 24. WORD OF THE DAY */}
      {wordOfTheDay && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="section-title" style={{ margin: 0 }}>Word of the Day</span>
          </div>

          <div
            className="card-container"
            style={{
              borderLeft: '4px solid var(--color-accent)',
              padding: '1.25rem'
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
              onClick={() => onSelectWord(wordOfTheDay.word)}
              style={{ width: '100%' }}
            >
              <span>Learn word</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* 25. RECENT WORDS */}
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
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {entry.definitions[0]?.simple}
                      </p>
                    )}
                  </div>

                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
