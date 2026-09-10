export type PreferredPronunciation = 'british' | 'american';

export type AudioSpeed = 0.5 | 0.75 | 1 | 1.25;

export type ThemePreference = 'system' | 'light' | 'dark';

export type UserSettings = {
  preferredPronunciation: PreferredPronunciation;
  audioSpeed: AudioSpeed;
  theme: ThemePreference;
  autoPlayAudio: boolean;
};

export type SavedWordItem = {
  wordId: string;
  word: string;
  savedAt: number;
};

export type PracticeSessionState = {
  completedQuestions: Record<string, boolean>;
  totalAttempted: number;
  totalCorrect: number;
};
