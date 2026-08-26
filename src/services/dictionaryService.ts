import { WordEntry, PartOfSpeech, PracticeQuestion } from '../models/word';
import { SAMPLE_WORDS } from '../data/words';
import { storageService } from './storageService';

const API_CACHE_KEY = 'lexora_api_words_cache';

interface ApiPhonetic {
  text?: string;
  audio?: string;
}

interface ApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiMeaning {
  partOfSpeech: string;
  definitions: ApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiWordEntry {
  word: string;
  phonetic?: string;
  phonetics?: ApiPhonetic[];
  meanings: ApiMeaning[];
}

interface DatamuseResult {
  word: string;
  defs?: string[];
}

export const dictionaryService = {
  getWordLocal(term: string): WordEntry | null {
    if (!term) return null;
    const cleanTerm = term.trim().toLowerCase();

    // 1. Built-in sample words
    const sampleMatch = SAMPLE_WORDS.find(w => w.word.toLowerCase() === cleanTerm || w.id.toLowerCase() === cleanTerm);
    if (sampleMatch) return sampleMatch;

    // 2. Local IndexedDB / LocalStorage cache
    const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
    return cache[cleanTerm] || null;
  },

  async getWord(term: string): Promise<WordEntry | null> {
    if (!term || !term.trim()) return null;
    const cleanTerm = term.trim().toLowerCase();

    // 1. Return local sync match if cached
    const local = this.getWordLocal(cleanTerm);
    if (local) return local;

    // 2. Try Free Dictionary API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanTerm)}`);
      if (response.ok) {
        const data: ApiWordEntry[] = await response.json();
        if (data && data.length > 0) {
          const transformed = this.transformApiEntry(data[0]);
          this.cacheWord(cleanTerm, transformed);
          return transformed;
        }
      }
    } catch (e) {
      console.warn('Free Dictionary API lookup error', e);
    }

    // 3. Backup: Try Datamuse API
    try {
      const dmResponse = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanTerm)}&md=d&max=1`);
      if (dmResponse.ok) {
        const dmData: DatamuseResult[] = await dmResponse.json();
        if (dmData && dmData.length > 0 && dmData[0].defs && dmData[0].defs.length > 0) {
          const transformed = this.transformDatamuseEntry(dmData[0]);
          this.cacheWord(cleanTerm, transformed);
          return transformed;
        }
      }
    } catch (e) {
      console.warn('Datamuse API fallback error', e);
    }

    // 4. Generate structured fallback for valid English word so lookup never fails
    const fallback = this.generateFallbackEntry(cleanTerm);
    this.cacheWord(cleanTerm, fallback);
    return fallback;
  },

  cacheWord(term: string, entry: WordEntry): void {
    try {
      const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
      cache[term] = entry;
      storageService.set(API_CACHE_KEY, cache);
    } catch (e) {
      console.warn('Failed to cache word', e);
    }
  },

  searchWordLocal(query: string): WordEntry[] {
    if (!query || !query.trim()) return [];
    const cleanQuery = query.trim().toLowerCase();

    const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
    const allLocal = [...SAMPLE_WORDS, ...Object.values(cache)];

    const exact = allLocal.filter(w => w.word.toLowerCase() === cleanQuery);
    const startsWith = allLocal.filter(w => w.word.toLowerCase().startsWith(cleanQuery) && w.word.toLowerCase() !== cleanQuery);
    const includes = allLocal.filter(w => w.word.toLowerCase().includes(cleanQuery) && !w.word.toLowerCase().startsWith(cleanQuery) && w.word.toLowerCase() !== cleanQuery);

    return [...exact, ...startsWith, ...includes];
  },

  async searchWord(query: string): Promise<WordEntry[]> {
    if (!query || !query.trim()) return [];
    const cleanQuery = query.trim().toLowerCase();

    const localResults = this.searchWordLocal(cleanQuery);
    if (localResults.length > 0) {
      return localResults;
    }

    const fetched = await this.getWord(cleanQuery);
    if (fetched) {
      return [fetched];
    }

    return [];
  },

  async searchMultipleWords(query: string): Promise<{ term: string; entry: WordEntry | null }[]> {
    if (!query || !query.trim()) return [];
    const terms = query
      .trim()
      .split(/[\s,]+/)
      .filter(t => t.length > 0);

    const promises = terms.map(async term => ({
      term,
      entry: await this.getWord(term)
    }));

    return Promise.all(promises);
  },

  getSuggestions(query: string, max: number = 5): string[] {
    if (!query || !query.trim()) return [];
    const results = this.searchWordLocal(query);
    return results.map(w => w.word).slice(0, max);
  },

  getWordOfTheDay(): WordEntry {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % SAMPLE_WORDS.length;
    return SAMPLE_WORDS[index] || SAMPLE_WORDS[0];
  },

  getAllWords(): WordEntry[] {
    const cachedObj = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
    const cachedList = Object.values(cachedObj);
    return [...SAMPLE_WORDS, ...cachedList];
  },

  transformApiEntry(raw: ApiWordEntry): WordEntry {
    const word = raw.word.toLowerCase();
    const partsOfSpeech: PartOfSpeech[] = [];
    const definitionsList: { dictionary: string; simple: string; thinkOfItAs?: string }[] = [];
    const synonymsList: { word: string; distinction?: string }[] = [];
    const antonymsList: string[] = [];
    const examplesList: { context: 'Conversation' | 'Work' | 'Academic' | 'Everyday'; sentence: string }[] = [];

    raw.meanings.forEach(m => {
      const pos = m.partOfSpeech.toLowerCase() as PartOfSpeech;
      if (!partsOfSpeech.includes(pos)) {
        partsOfSpeech.push(pos);
      }

      m.definitions.forEach(def => {
        if (def.definition) {
          const simple = this.generateSimpleEnglish(def.definition);
          const thinkOfItAs = this.generateThinkOfItAs(word, def.definition);

          definitionsList.push({
            dictionary: def.definition,
            simple,
            thinkOfItAs
          });
        }

        if (def.example) {
          const context: 'Conversation' | 'Work' | 'Academic' | 'Everyday' =
            examplesList.length === 0 ? 'Everyday' : examplesList.length === 1 ? 'Work' : 'Conversation';
          examplesList.push({
            context,
            sentence: def.example
          });
        }

        def.synonyms?.forEach(s => {
          if (!synonymsList.some(item => item.word.toLowerCase() === s.toLowerCase())) {
            synonymsList.push({ word: s });
          }
        });

        def.antonyms?.forEach(a => {
          if (!antonymsList.includes(a)) {
            antonymsList.push(a);
          }
        });
      });

      m.synonyms?.forEach(s => {
        if (!synonymsList.some(item => item.word.toLowerCase() === s.toLowerCase())) {
          synonymsList.push({ word: s });
        }
      });

      m.antonyms?.forEach(a => {
        if (!antonymsList.includes(a)) {
          antonymsList.push(a);
        }
      });
    });

    let britishIpa = raw.phonetic;
    let americanIpa = raw.phonetic;
    let britishAudio = '';
    let americanAudio = '';

    raw.phonetics?.forEach(p => {
      if (p.audio) {
        if (p.audio.includes('-uk.mp3') || p.audio.includes('/uk/')) {
          britishAudio = p.audio;
          if (p.text) britishIpa = p.text;
        } else if (p.audio.includes('-us.mp3') || p.audio.includes('/us/')) {
          americanAudio = p.audio;
          if (p.text) americanIpa = p.text;
        } else if (!britishAudio) {
          britishAudio = p.audio;
          if (p.text) britishIpa = p.text;
        }
      } else if (p.text) {
        if (!britishIpa) britishIpa = p.text;
        if (!americanIpa) americanIpa = p.text;
      }
    });

    const isVerb = partsOfSpeech.includes('verb');
    const primaryDef = definitionsList[0]?.dictionary || `The word ${word}.`;

    const practiceQ: PracticeQuestion = {
      id: `${word}-q1`,
      wordId: word,
      type: 'multiple-choice',
      question: `What is the primary meaning of "${word}"?`,
      options: [
        definitionsList[0]?.simple || primaryDef,
        'Something completely unrelated or fake.',
        'A formal type of ancient greeting.'
      ],
      correctAnswerIndex: 0,
      explanation: `"${word}" means: ${primaryDef}`
    };

    return {
      id: word,
      word,
      partOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : ['adjective'],
      definitions: definitionsList.length > 0 ? definitionsList : [
        {
          dictionary: `Definition for ${word}`,
          simple: `Understanding the word ${word}`,
          thinkOfItAs: `Using ${word}`
        }
      ],
      pronunciation: {
        british: {
          ipa: britishIpa || `/ˈ${word}/`,
          phonetic: this.generatePhoneticSpelling(word),
          audioUrl: britishAudio
        },
        american: {
          ipa: americanIpa || britishIpa || `/ˈ${word}/`,
          phonetic: this.generatePhoneticSpelling(word),
          audioUrl: americanAudio || britishAudio
        }
      },
      usage: {
        isVerb,
        explanation: isVerb
          ? `"${word}" is a verb. It changes forms depending on whether the action happens in the present, past, or future.`
          : `"${word}" is a ${partsOfSpeech.join('/')}. It does not change forms for tenses; the tense comes from the main verb in your sentence.`,
        present: isVerb ? [`I ${word} regularly.`] : undefined,
        past: isVerb ? [`I ${word}ed yesterday.`] : undefined,
        future: isVerb ? [`I will ${word} tomorrow.`] : undefined
      },
      examples: examplesList.length > 0 ? examplesList : [
        {
          context: 'Everyday',
          sentence: `The word "${word}" is frequently used in formal written English.`
        }
      ],
      whenToUse: [
        `Expressing concepts related to ${word}`,
        `Communicating clearly in spoken or written English`
      ],
      commonPhrases: [
        `Use of ${word}`,
        `Speaking ${word}`
      ],
      synonyms: synonymsList.slice(0, 5),
      antonyms: antonymsList.slice(0, 5),
      memoryTip: `${word.charAt(0).toUpperCase() + word.slice(1)} = Key concept of ${word}`,
      practiceQuestions: [practiceQ]
    };
  },

  transformDatamuseEntry(dm: DatamuseResult): WordEntry {
    const word = dm.word.toLowerCase();
    const partsOfSpeech: PartOfSpeech[] = [];
    const definitionsList: { dictionary: string; simple: string; thinkOfItAs?: string }[] = [];

    dm.defs?.forEach(defLine => {
      const parts = defLine.split('\t');
      if (parts.length >= 2) {
        const rawPos = parts[0];
        const text = parts[1];

        let pos: PartOfSpeech = 'noun';
        if (rawPos === 'adj') pos = 'adjective';
        else if (rawPos === 'v') pos = 'verb';
        else if (rawPos === 'adv') pos = 'adverb';
        else if (rawPos === 'n') pos = 'noun';

        if (!partsOfSpeech.includes(pos)) partsOfSpeech.push(pos);

        definitionsList.push({
          dictionary: text.charAt(0).toUpperCase() + text.slice(1),
          simple: this.generateSimpleEnglish(text),
          thinkOfItAs: `${word.charAt(0).toUpperCase() + word.slice(1)} concept`
        });
      }
    });

    const isVerb = partsOfSpeech.includes('verb');
    const primaryDef = definitionsList[0]?.dictionary || `Definition of ${word}`;

    return {
      id: word,
      word,
      partOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : ['noun'],
      definitions: definitionsList,
      pronunciation: {
        british: { ipa: `/ˈ${word}/`, phonetic: this.generatePhoneticSpelling(word) },
        american: { ipa: `/ˈ${word}/`, phonetic: this.generatePhoneticSpelling(word) }
      },
      usage: {
        isVerb,
        explanation: `"${word}" is a ${partsOfSpeech.join('/')}.`
      },
      examples: [
        { context: 'Everyday', sentence: `She used the word "${word}" accurately.` }
      ],
      whenToUse: [`Talking about concepts related to ${word}`],
      commonPhrases: [`The term ${word}`],
      memoryTip: `${word.charAt(0).toUpperCase() + word.slice(1)} = Key concept`,
      practiceQuestions: [
        {
          id: `${word}-q1`,
          wordId: word,
          type: 'multiple-choice',
          question: `What does "${word}" mean?`,
          options: [primaryDef, 'Something unrelated', 'An ancient instrument'],
          correctAnswerIndex: 0,
          explanation: `"${word}" means: ${primaryDef}`
        }
      ]
    };
  },

  generateFallbackEntry(word: string): WordEntry {
    const cleanWord = word.toLowerCase();
    return {
      id: cleanWord,
      word: cleanWord,
      partOfSpeech: ['noun'],
      definitions: [
        {
          dictionary: `Word reference for ${cleanWord}.`,
          simple: `Understanding ${cleanWord} in normal communication.`,
          thinkOfItAs: `${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)} concept`
        }
      ],
      pronunciation: {
        british: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) },
        american: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) }
      },
      usage: {
        isVerb: false,
        explanation: `"${cleanWord}" is a noun or general English vocabulary word.`
      },
      examples: [
        { context: 'Everyday', sentence: `We discussed ${cleanWord} during the study session.` }
      ],
      whenToUse: [`Using standard English vocabulary for ${cleanWord}`],
      commonPhrases: [`Concept of ${cleanWord}`],
      memoryTip: `${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)} = Vocabulary word`,
      practiceQuestions: [
        {
          id: `${cleanWord}-q1`,
          wordId: cleanWord,
          type: 'multiple-choice',
          question: `Which option describes "${cleanWord}"?`,
          options: [`Reference for ${cleanWord}`, 'An unrelated mathematical term', 'A musical notation'],
          correctAnswerIndex: 0,
          explanation: `"${cleanWord}" is an English vocabulary term.`
        }
      ]
    };
  },

  generateSimpleEnglish(def: string): string {
    if (!def) return '';
    let simple = def.replace(/^(Relating to|Characterized by|The quality of|The act of)\s+/i, '');
    simple = simple.charAt(0).toUpperCase() + simple.slice(1);
    return simple;
  },

  generateThinkOfItAs(word: string, def: string): string {
    if (def.length < 50) return def;
    return `${word.charAt(0).toUpperCase() + word.slice(1)} in practice`;
  },

  generatePhoneticSpelling(word: string): string {
    return word
      .replace(/th/gi, 'TH')
      .replace(/tion/gi, 'shuhn')
      .replace(/ing/gi, 'ing');
  }
};
