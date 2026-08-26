import React from 'react';

interface SplashScreenProps {
  onFinished?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <div className="splash-screen" role="banner" aria-label="Lexora Application Loading">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
        <svg className="splash-logo" viewBox="0 0 512 512" width="96" height="96">
          <rect width="512" height="512" rx="112" fill="var(--bg-surface)" stroke="var(--border-color-strong)" strokeWidth="12" />
          <path d="M 128 140 C 180 120, 240 136, 256 150 C 272 136, 332 120, 384 140 L 384 360 C 332 344, 272 358, 256 372 C 240 358, 180 344, 128 360 Z" fill="var(--bg-subtle)" stroke="var(--border-color-strong)" strokeWidth="8"/>
          <path d="M 176 190 L 176 300 L 220 300" fill="none" stroke="var(--color-accent)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="292" y1="200" x2="352" y2="200" stroke="var(--text-primary)" strokeWidth="14" strokeLinecap="round"/>
          <line x1="292" y1="240" x2="340" y2="240" stroke="var(--text-muted)" strokeWidth="14" strokeLinecap="round"/>
          <line x1="292" y1="280" x2="352" y2="280" stroke="var(--text-primary)" strokeWidth="14" strokeLinecap="round"/>
          <path d="M 256 150 L 256 290 L 270 275 L 284 290 L 284 150 Z" fill="var(--color-accent)"/>
        </svg>

        <h1 className="splash-title">Lexora</h1>
        <p className="splash-tagline">Understand words. Use them. Say them.</p>
      </div>

      <div className="splash-spinner" aria-label="Loading..." />
    </div>
  );
};
