import React from 'react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isSaved,
  onToggle,
  className = ''
}) => {
  return (
    <button
      className={`btn-icon ${className}`}
      onClick={onToggle}
      aria-label={isSaved ? 'Remove from saved words' : 'Save word to bookmarks'}
      title={isSaved ? 'Saved' : 'Save'}
      style={{
        color: isSaved ? 'var(--color-accent)' : 'var(--text-secondary)',
        borderColor: isSaved ? 'var(--color-accent)' : 'var(--border-color)'
      }}
    >
      <Bookmark
        size={20}
        fill={isSaved ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
};
