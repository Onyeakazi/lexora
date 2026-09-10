import React from 'react';
import { UserSettings, PreferredPronunciation, AudioSpeed, ThemePreference } from '../../models/user';
import { Moon, Sun, Monitor, Trash2, Check } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onShowToast: (msg: string) => void;
}

const AUDIO_SPEEDS: AudioSpeed[] = [0.5, 0.75, 1, 1.25];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onShowToast
}) => {
  const handleSelectPronunciation = (pref: PreferredPronunciation) => {
    onUpdateSettings({ preferredPronunciation: pref });
    onShowToast(`Default pronunciation set to ${pref === 'british' ? 'British English' : 'American English'}`);
  };

  const handleSelectSpeed = (speed: AudioSpeed) => {
    onUpdateSettings({ audioSpeed: speed });
    onShowToast(`Audio speed set to ${speed}x`);
  };

  const handleSelectTheme = (theme: ThemePreference) => {
    onUpdateSettings({ theme });
    onShowToast(`Theme changed to ${theme}`);
  };

  const handleClearSearchHistory = () => {
    storageService.clearRecentSearches();
    onShowToast('Search history cleared');
  };

  const handleClearSavedWords = () => {
    storageService.clearSavedWords();
    onShowToast('Saved words cleared');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all saved words, search history, and settings?')) {
      storageService.clearAll();
      window.location.reload();
    }
  };

  const themeItems: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { id: 'system', label: 'System Default', icon: <Monitor size={18} /> },
    { id: 'light', label: 'Light Mode', icon: <Sun size={18} /> },
    { id: 'dark', label: 'Dark Mode', icon: <Moon size={18} /> }
  ];

  return (
    <div className="content-container">
      <h1 className="word-heading" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        Settings
      </h1>

      {/* PRONUNCIATION */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Pronunciation</h2>
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          <div
            onClick={() => handleSelectPronunciation('british')}
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--divider-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge">GB</span>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>British English</span>
            </div>
            {settings.preferredPronunciation === 'british' && <Check size={18} color="var(--color-accent)" />}
          </div>

          <div
            onClick={() => handleSelectPronunciation('american')}
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge">US</span>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>American English</span>
            </div>
            {settings.preferredPronunciation === 'american' && <Check size={18} color="var(--color-accent)" />}
          </div>
        </div>
      </section>

      {/* AUDIO SPEED */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Audio Playback Speed</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {AUDIO_SPEEDS.map(speed => {
            const isSelected = settings.audioSpeed === speed;
            return (
              <button
                key={speed}
                onClick={() => handleSelectSpeed(speed)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--bg-accent-subtle)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            );
          })}
        </div>
      </section>

      {/* APPEARANCE */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Appearance</h2>
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {themeItems.map((item, idx) => {
            const isSelected = settings.theme === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectTheme(item.id)}
                style={{
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: idx < themeItems.length - 1 ? '1px solid var(--divider-color)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                  {item.icon}
                  <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.label}</span>
                </div>
                {isSelected && <Check size={18} color="var(--color-accent)" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* DATA & SEARCH */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Data & Storage</h2>
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          <div
            onClick={handleClearSearchHistory}
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              borderBottom: '1px solid var(--divider-color)',
              color: 'var(--text-primary)'
            }}
          >
            <Trash2 size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Clear search history</span>
          </div>

          <div
            onClick={handleClearSavedWords}
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              borderBottom: '1px solid var(--divider-color)',
              color: 'var(--text-primary)'
            }}
          >
            <Trash2 size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Clear saved words</span>
          </div>

          <div
            onClick={handleResetData}
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: '#ef4444'
            }}
          >
            <Trash2 size={18} color="#ef4444" />
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Reset all application data</span>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">About Lexora</h2>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <strong style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem' }}>Lexora</strong>
            <span className="badge">v1.0.0</span>
          </div>
          <p style={{ margin: '0 0 0.75rem 0', fontFamily: 'var(--font-sans)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Understand words. Use them. Say them.
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Traditional dictionary & pocket vocabulary reference designed for mobile devices.
          </p>
        </div>
      </section>
    </div>
  );
};
