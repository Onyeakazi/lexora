import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Trash2, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { WordEntry } from '../../models/word';
import { dictionaryService } from '../../services/dictionaryService';
import { storageService } from '../../services/storageService';

interface SearchViewProps {
  initialQuery?: string;
  onSelectWord: (word: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onSelectWord
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<WordEntry[]>([]);
  const [multiWordResults, setMultiWordResults] = useState<{ term: string; entry: WordEntry | null }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(storageService.getRecentSearches());
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSearchResults([]);
      setMultiWordResults([]);
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim();
    const isMultiTerm = trimmed.includes(' ');

    let isMounted = true;

    // Instantly check local matching suggestions first
    const suggs = dictionaryService.getSuggestions(trimmed);
    setSuggestions(suggs);

    const performSearch = async () => {
      setIsLoading(true);
      if (isMultiTerm) {
        setSearchResults([]);
        const multi = await dictionaryService.searchMultipleWords(trimmed);
        if (isMounted) {
          setMultiWordResults(multi);
          setIsLoading(false);
        }
      } else {
        setMultiWordResults([]);
        const results = await dictionaryService.searchWord(trimmed);
        if (isMounted) {
          setSearchResults(results);
          setIsLoading(false);
        }
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
    const trimmed = query.trim();
    onSelectWord(trimmed);
  };

  const handleSelectSuggestion = (word: string) => {
    onSelectWord(word);
  };

  const handleClearHistory = () => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="content-container">
      {/* SEARCH BAR */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '0.625rem 0.875rem',
            gap: '0.625rem',
            boxShadow: 'var(--shadow-sm)'
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
            placeholder="Search any word in English..."
            aria-label="Search dictionary"
            autoCapitalize="off"
            autoCorrect="off"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '1rem',
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
              style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* DIRECT SEARCH ACTION CARD (Whenever user types any term) */}
      {query.trim() && !query.includes(' ') && (
        <div
          onClick={() => handleSelectSuggestion(query.trim())}
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
      )}

      {/* SUGGESTIONS LIST */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="section-title">Matching Suggestions</span>
          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
            {suggestions.map((word, idx) => (
              <div
                key={word}
                onClick={() => handleSelectSuggestion(word)}
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

      {/* MULTI-WORD SEARCH RESULTS */}
      {multiWordResults.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Multi-word Search Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {multiWordResults.map(item => (
              <div
                key={item.term}
                onClick={() => item.entry && handleSelectSuggestion(item.entry.word)}
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: item.entry ? 'pointer' : 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem' }}>{item.term}</h3>
                  {item.entry ? (
                    <span className="part-of-speech-tag">{item.entry.partOfSpeech.join(', ')}</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not found</span>
                  )}
                </div>
                {item.entry && (
                  <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {item.entry.definitions[0]?.simple || item.entry.definitions[0]?.dictionary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SINGLE WORD DIRECT MATCH RESULTS LIST */}
      {searchResults.length > 0 && !query.includes(' ') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Dictionary Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {searchResults.map(entry => (
              <div
                key={entry.id}
                onClick={() => handleSelectSuggestion(entry.word)}
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

      {/* RECENT SEARCHES */}
      {!query && recentSearches.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="section-title" style={{ margin: 0 }}>Recent Searches</span>
            <button
              onClick={handleClearHistory}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Trash2 size={14} />
              <span>Clear history</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentSearches.map(item => (
              <div
                key={item}
                onClick={() => onSelectWord(item)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600 }}>{item}</span>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
