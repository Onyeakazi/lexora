import React from 'react';
import { ChevronLeft, BookOpen, Settings } from 'lucide-react';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
  rightAction?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBack = false,
  onBack,
  onNavigateHome,
  onOpenSettings,
  rightAction
}) => {
  return (
    <header className="top-app-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {showBack ? (
          <button
            className="btn-icon"
            onClick={onBack}
            aria-label="Go back"
            style={{ border: 'none', background: 'transparent' }}
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="brand-container" onClick={onNavigateHome} role="button" tabIndex={0}>
            <BookOpen size={22} color="var(--color-accent)" strokeWidth={2.5} />
            <span className="brand-name">Lexora</span>
          </div>
        )}

        {showBack && title && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.2rem',
              fontWeight: 600,
              textTransform: 'lowercase'
            }}
          >
            {title}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {rightAction ? (
          rightAction
        ) : (
          onOpenSettings && (
            <button
              className="btn-icon"
              onClick={onOpenSettings}
              aria-label="Open Settings"
              style={{ border: 'none', background: 'transparent' }}
            >
              <Settings size={20} color="var(--text-muted)" />
            </button>
          )
        )}
      </div>
    </header>
  );
};
