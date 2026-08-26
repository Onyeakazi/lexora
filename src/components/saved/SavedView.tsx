import React, { useState, useEffect } from 'react';
import { BookmarkX, Search, ArrowRight } from 'lucide-react';
import { SavedWordItem } from '../../models/user';
import { storageService } from '../../services/storageService';
import { dictionaryService } from '../../services/dictionaryService';

interface SavedViewProps {
  onSelectWord: (word: string) => void;
  onGoToSearch: () => void;
  onShowToast: (msg: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  onSelectWord,
  onGoToSearch,
  onShowToast
}) => {
  const [savedItems, setSavedItems] = useState<SavedWordItem[]>([]);

  useEffect(() => {
    setSavedItems(storageService.getSavedWords());
  }, []);

  const handleRemove = (e: React.MouseEvent, wordId: string, word: string) => {
    e.stopPropagation();
    storageService.toggleSaveWord(wordId, word);
    setSavedItems(storageService.getSavedWords());
    onShowToast(`Removed "${word}" from saved words`);
  };

  if (savedItems.length === 0) {
    return (
      <div className="content-container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
          <BookmarkX size={48} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          No saved words yet
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '320px', margin: '0 auto 2rem auto' }}>
          Words you bookmark will appear here for quick review anytime.
        </p>
        <button className="btn-primary" onClick={onGoToSearch}>
          <Search size={18} />
          <span>Search for a word</span>
        </button>
      </div>
    );
  }

  return (
    <div className="content-container">
      <h1 className="word-heading" style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>
        Saved Words
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {savedItems.map(item => {
          const wordEntry = dictionaryService.getWordLocal(item.word);
          return (
            <div
              key={item.wordId}
              onClick={() => onSelectWord(item.word)}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', margin: 0 }}>
                    {item.word}
                  </h2>
                  {wordEntry && (
                    <span className="part-of-speech-tag">{wordEntry.partOfSpeech.join(', ')}</span>
                  )}
                </div>

                {wordEntry && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {wordEntry.definitions[0]?.simple || wordEntry.definitions[0]?.dictionary}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn-icon"
                  onClick={e => handleRemove(e, item.wordId, item.word)}
                  aria-label={`Remove ${item.word} from saved`}
                  title="Remove"
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                >
                  <BookmarkX size={20} />
                </button>
                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
