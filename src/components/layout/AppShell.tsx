import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { TopAppBar } from './TopAppBar';
import { BottomNavigation, TabRoute } from './BottomNavigation';
import { Toast, ToastMessage } from '../common/Toast';
import { PWAInstallBanner } from '../common/PWAInstallBanner';
import { WordDetailsSkeleton } from '../common/SkeletonLoader';
import { UserSettings } from '../../models/user';
import { storageService } from '../../services/storageService';
import { dictionaryService } from '../../services/dictionaryService';
import { WordEntry } from '../../models/word';

// Page Views
import { HomeView } from '../home/HomeView';
import { SearchView } from '../search/SearchView';
import { WordDetailsView } from '../dictionary/WordDetailsView';
import { SavedView } from '../saved/SavedView';
import { PracticeView } from '../practice/PracticeView';
import { SettingsView } from '../settings/SettingsView';

export const AppShell: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedWordIds, setSavedWordIds] = useState<string[]>([]);

  // 1. Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // 2. Sync Saved Words List State
  useEffect(() => {
    const updateSavedList = () => {
      setSavedWordIds(storageService.getSavedWords().map(w => w.wordId.toLowerCase()));
    };
    updateSavedList();
  }, [currentWord]);

  // 3. Theme Application Effect
  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    applyTheme(settings.theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (settings.theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.theme]);

  // 4. URL Hash Routing Listener
  useEffect(() => {
    const parseUrl = async () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      let target = path;
      if (hash && hash.startsWith('#')) {
        target = hash.substring(1);
      }

      if (target.startsWith('/word/')) {
        const wordParam = decodeURIComponent(target.replace('/word/', ''));
        setIsLoadingWord(true);
        const entry = await dictionaryService.getWord(wordParam);
        setIsLoadingWord(false);
        if (entry) {
          setCurrentWord(entry);
          return;
        }
      } else if (target === '/search') {
        setActiveTab('search');
        setCurrentWord(null);
      } else if (target === '/saved') {
        setActiveTab('saved');
        setCurrentWord(null);
      } else if (target === '/practice') {
        setActiveTab('practice');
        setCurrentWord(null);
      } else if (target === '/settings') {
        setActiveTab('settings');
        setCurrentWord(null);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const showToast = (text: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleSelectWord = async (word: string) => {
    setIsLoadingWord(true);
    storageService.addRecentSearch(word);
    window.history.pushState(null, '', `#/word/${encodeURIComponent(word)}`);

    const entry = await dictionaryService.getWord(word);
    setIsLoadingWord(false);

    if (entry) {
      setCurrentWord(entry);
    } else {
      showToast(`Word "${word}" not found`);
    }
  };

  const handleSelectTab = (tab: TabRoute) => {
    setActiveTab(tab);
    setCurrentWord(null);
    window.history.pushState(null, '', `#/${tab === 'home' ? '' : tab}`);
  };

  const handleToggleSaveCurrentWord = () => {
    if (!currentWord) return;
    const nowSaved = storageService.toggleSaveWord(currentWord.id, currentWord.word);
    setSavedWordIds(storageService.getSavedWords().map(w => w.wordId.toLowerCase()));
    showToast(nowSaved ? `Saved "${currentWord.word}"` : `Removed "${currentWord.word}"`);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  const isWordSaved = currentWord ? savedWordIds.includes(currentWord.id.toLowerCase()) : false;

  return (
    <div className="app-viewport">
      <TopAppBar
        title={currentWord ? currentWord.word : undefined}
        showBack={currentWord !== null || isLoadingWord}
        onBack={() => {
          setCurrentWord(null);
          setIsLoadingWord(false);
          window.history.pushState(null, '', `#/${activeTab === 'home' ? '' : activeTab}`);
        }}
        onNavigateHome={() => handleSelectTab('home')}
        onOpenSettings={() => handleSelectTab('settings')}
      />

      <main className="main-content">
        {isLoadingWord ? (
          <div className="content-container">
            <WordDetailsSkeleton />
          </div>
        ) : currentWord ? (
          <WordDetailsView
            wordEntry={currentWord}
            settings={settings}
            isSaved={isWordSaved}
            onToggleSave={handleToggleSaveCurrentWord}
            onNavigateToWord={handleSelectWord}
            onUpdateSettings={handleUpdateSettings}
            onShowToast={showToast}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                onGoToSearch={() => handleSelectTab('search')}
                onSelectWord={handleSelectWord}
              />
            )}
            {activeTab === 'search' && (
              <SearchView onSelectWord={handleSelectWord} />
            )}
            {activeTab === 'saved' && (
              <SavedView
                onSelectWord={handleSelectWord}
                onGoToSearch={() => handleSelectTab('search')}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'practice' && (
              <PracticeView
                settings={settings}
                onSelectWord={handleSelectWord}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onSelectTab={handleSelectTab} />

      <PWAInstallBanner />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
