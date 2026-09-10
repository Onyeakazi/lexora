export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection';

export type PronunciationVariant = {
  ipa?: string;
  phonetic?: string;
  audioUrl?: string;
};

export type SyllableBreakdown = {
  syllable: string;
  hint: string;
  isStressed?: boolean;
};

export type DefinitionPair = {
  dictionary: string;
  simple: string;
  thinkOfItAs?: string;
};

export type GrammarUsage = {
  isVerb: boolean;
  present?: string[];
  past?: string[];
  future?: string[];
  explanation?: string;
};

export type ExampleItem = {
  context: 'Conversation' | 'Work' | 'Academic' | 'Everyday';
  sentence: string;
};

export type SynonymItem = {
  word: string;
  distinction?: string;
  simpleDefinition?: string;
};

export type PracticeQuestion = {
  id: string;
  wordId: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'correct-usage';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type WordEntry = {
  id: string;
  word: string;
  partOfSpeech: PartOfSpeech[];
  definitions: DefinitionPair[];
  pronunciation: {
    british?: PronunciationVariant;
    american?: PronunciationVariant;
    breakdown?: SyllableBreakdown[];
  };
  usage?: GrammarUsage;
  examples?: ExampleItem[];
  whenToUse?: string[];
  whenNotToUse?: string[];
  commonPhrases?: string[];
  synonyms?: SynonymItem[];
  antonyms?: string[];
  commonUseExample?: string;
  memoryTip?: string;
  practiceQuestions?: PracticeQuestion[];
};
