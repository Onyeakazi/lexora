import React, { useEffect, useState, useRef } from 'react';
import { Search, Sparkles, Clock, ArrowRight, Mic, X, Loader2, BookOpen } from 'lucide-react';
import { WordEntry } from '../../models/word';
import { dictionaryService } from '../../services/dictionaryService';
import { storageService } from '../../services/storageService';
import { speechRecognitionService } from '../../services/speechRecognitionService';

interface HomeViewProps {
  onGoToSearch: (initialQuery?: string) => void;
  onSelectWord: (word: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectWord }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<WordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wordOfTheDay, setWordOfTheDay] = useState<WordEntry | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [greeting, setGreeting] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWordOfTheDay(dictionaryService.getWordOfTheDay());
    setRecentSearches(storageService.getRecentSearches().slice(0, 4));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Inline live search effect directly on the homepage
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim();
    let isMounted = true;

    const suggs = dictionaryService.getSuggestions(trimmed);
    setSuggestions(suggs);

    const performSearch = async () => {
      setIsLoading(true);
      const results = await dictionaryService.searchWord(trimmed);
      if (isMounted) {
        setSearchResults(results);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSelectWord(query.trim());
  };

  const handleVoiceSearchHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVoiceError(null);
    if (isVoiceListening) {
      speechRecognitionService.stopListening();
      setIsVoiceListening(false);
      return;
    }

    speechRecognitionService.startVoiceSearch({
      onResult: spokenWord => {
        setQuery(spokenWord);
        onSelectWord(spokenWord);
      },
      onError: err => {
        setVoiceError(err);
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

      {/* 23. INLINE LIVE SEARCH INPUT (NO PAGE REDIRECT) */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: isVoiceListening ? '1.5px solid #ef4444' : '1.5px solid var(--border-color-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            gap: '0.625rem',
            boxShadow: isVoiceListening ? '0 0 0 4px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)',
            transition: 'all 200ms ease'
          }}
        >
          {isLoading ? (
            <Loader2 size={20} className="spin" style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Search size={20} color="var(--text-muted)" />
          )}

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isVoiceListening ? 'Listening... Speak a word!' : 'Search any word in English...'}
            aria-label="Search dictionary"
            autoCapitalize="off"
            autoCorrect="off"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)'
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={18} />
            </button>
          )}

          {/* VOICE SEARCH MIC BUTTON */}
          <button
            type="button"
            onClick={handleVoiceSearchHome}
            aria-label="Voice Search"
            style={{
              border: 'none',
              background: isVoiceListening ? '#ef4444' : 'var(--bg-subtle)',
              color: isVoiceListening ? '#ffffff' : 'var(--color-accent)',
              width: '36px',
              height: '36px',
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
      </form>

      {/* VOICE ERROR MESSAGE */}
      {voiceError && (
        <div style={{ marginBottom: '1rem', padding: '0.625rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontSize: '0.85rem' }}>
          {voiceError}
        </div>
      )}

      {/* INLINE LIVE SEARCH RESULTS (When user is typing on Home screen) */}
      {query.trim() ? (
        <div style={{ marginBottom: '2rem' }}>
          {/* DIRECT SEARCH ACTION CARD */}
          <div
            onClick={() => onSelectWord(query.trim())}
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--bg-accent-subtle)',
              border: '1px solid var(--badge-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <BookOpen size={20} color="var(--color-accent)" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-accent)' }}>
                Search "{query.trim()}" in Dictionary
              </span>
            </div>
            <ArrowRight size={18} color="var(--color-accent)" />
          </div>

          {/* SUGGESTIONS LIST */}
          {suggestions.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="section-title">Matching Suggestions</span>
              <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
                {suggestions.map((word, idx) => (
                  <div
                    key={word}
                    onClick={() => onSelectWord(word)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid var(--divider-color)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600 }}>{word}</span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DICTIONARY MATCHES */}
          {searchResults.length > 0 && (
            <div>
              <h2 className="section-title">Dictionary Results</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {searchResults.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => onSelectWord(entry.word)}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        {entry.word}
                      </h3>
                      <span className="part-of-speech-tag">{entry.partOfSpeech.join(', ')}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {entry.definitions[0]?.dictionary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* DEFAULT HOME CONTENT (Word of the Day & Recently Viewed) */}
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

          {/* RECENTLY VIEWED WORDS */}
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
        </>
      )}
    </div>
  );
};
