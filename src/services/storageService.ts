import { UserSettings, SavedWordItem, PracticeSessionState } from '../models/user';

const STORAGE_KEYS = {
  SETTINGS: 'lexora_settings',
  RECENT_SEARCHES: 'lexora_recent_searches',
  SAVED_WORDS: 'lexora_saved_words',
  PRACTICE_STATE: 'lexora_practice_state'
};

const DEFAULT_SETTINGS: UserSettings = {
  preferredPronunciation: 'british',
  audioSpeed: 1,
  theme: 'dark',
  autoPlayAudio: false
};

export const storageService = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`Error reading ${key} from storage`, e);
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error saving ${key} to storage`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing ${key} from storage`, e);
    }
  },

  clearAll(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage', e);
    }
  },

  // Helpers for specific app domain persistence
  getSettings(): UserSettings {
    return this.get<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  getRecentSearches(): string[] {
    return this.get<string[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
  },

  addRecentSearch(word: string): string[] {
    if (!word || !word.trim()) return this.getRecentSearches();
    const cleanWord = word.trim().toLowerCase();
    const current = this.getRecentSearches();
    const filtered = current.filter(w => w.toLowerCase() !== cleanWord);
    const updated = [cleanWord, ...filtered].slice(0, 30); // Max 30 entries
    this.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
    return updated;
  },

  clearRecentSearches(): void {
    this.set(STORAGE_KEYS.RECENT_SEARCHES, []);
  },

  getSavedWords(): SavedWordItem[] {
    return this.get<SavedWordItem[]>(STORAGE_KEYS.SAVED_WORDS, []);
  },

  isWordSaved(wordId: string): boolean {
    const saved = this.getSavedWords();
    return saved.some(item => item.wordId.toLowerCase() === wordId.toLowerCase());
  },

  toggleSaveWord(wordId: string, word: string): boolean {
    const saved = this.getSavedWords();
    const existsIndex = saved.findIndex(item => item.wordId.toLowerCase() === wordId.toLowerCase());
    if (existsIndex >= 0) {
      saved.splice(existsIndex, 1);
      this.set(STORAGE_KEYS.SAVED_WORDS, saved);
      return false; // Now unsaved
    } else {
      saved.unshift({
        wordId,
        word,
        savedAt: Date.now()
      });
      this.set(STORAGE_KEYS.SAVED_WORDS, saved);
      return true; // Now saved
    }
  },

  clearSavedWords(): void {
    this.set(STORAGE_KEYS.SAVED_WORDS, []);
  },

  getPracticeState(): PracticeSessionState {
    return this.get<PracticeSessionState>(STORAGE_KEYS.PRACTICE_STATE, {
      completedQuestions: {},
      totalAttempted: 0,
      totalCorrect: 0
    });
  },

  savePracticeState(state: PracticeSessionState): void {
    this.set(STORAGE_KEYS.PRACTICE_STATE, state);
  }
};
