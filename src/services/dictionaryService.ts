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

    // 1. Local sync match
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

    // 3. Backup: Datamuse API
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

    // 4. Fallback generator
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

  // Transforms Free Dictionary API response into a rich, tailored WordEntry
  transformApiEntry(raw: ApiWordEntry): WordEntry {
    const word = raw.word.toLowerCase();
    const partsOfSpeech: PartOfSpeech[] = [];
    const rawSynonyms: string[] = [];
    const rawAntonyms: string[] = [];
    const examplesList: { context: 'Conversation' | 'Work' | 'Academic' | 'Everyday'; sentence: string }[] = [];
    const rawDefs: { pos: string; def: string; example?: string }[] = [];

    raw.meanings.forEach(m => {
      const pos = m.partOfSpeech.toLowerCase() as PartOfSpeech;
      if (!partsOfSpeech.includes(pos)) {
        partsOfSpeech.push(pos);
      }

      m.definitions.forEach(def => {
        if (def.definition) {
          rawDefs.push({ pos, def: def.definition, example: def.example });
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
          if (!rawSynonyms.includes(s.toLowerCase())) rawSynonyms.push(s.toLowerCase());
        });

        def.antonyms?.forEach(a => {
          if (!rawAntonyms.includes(a.toLowerCase())) rawAntonyms.push(a.toLowerCase());
        });
      });

      m.synonyms?.forEach(s => {
        if (!rawSynonyms.includes(s.toLowerCase())) rawSynonyms.push(s.toLowerCase());
      });

      m.antonyms?.forEach(a => {
        if (!rawAntonyms.includes(a.toLowerCase())) rawAntonyms.push(a.toLowerCase());
      });
    });

    const primaryPos = partsOfSpeech[0] || 'adjective';

    // Generate rich tailored simple English & think-of-it-as analogies for each definition
    const definitionsList = rawDefs.slice(0, 3).map((d, index) => {
      const simple = this.generateRichSimpleEnglish(word, d.def, d.pos, rawSynonyms);
      const thinkOfItAs = this.generateRichThinkOfItAs(word, d.def, d.pos, rawSynonyms, index);
      return {
        dictionary: d.def,
        simple,
        thinkOfItAs
      };
    });

    // Parse Audio & IPA
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
    const primaryDefText = definitionsList[0]?.dictionary || `The word ${word}.`;
    const primarySimpleText = definitionsList[0]?.simple || primaryDefText;

    // Build verb tense usage if verb
    const verbTenses = isVerb ? this.generateVerbUsage(word) : undefined;

    // Synonyms with distinction notes
    const synonymsList = rawSynonyms.slice(0, 5).map((syn, idx) => ({
      word: syn,
      distinction: idx === 0
        ? `Closest synonym to ${word} in everyday usage.`
        : `Shares a similar meaning with ${word}, but emphasizes ${syn} characteristics.`
    }));

    const whenToUseList = this.generateWhenToUse(word, primaryPos, rawSynonyms);
    const commonPhrasesList = this.generateCommonPhrases(word, primaryPos);
    const memoryTipText = this.generateMemoryTip(word, rawSynonyms, primaryDefText);

    // Build practice question
    const practiceQ: PracticeQuestion = {
      id: `${word}-q1`,
      wordId: word,
      type: 'multiple-choice',
      question: `What is the primary meaning of "${word}"?`,
      options: [
        primarySimpleText,
        `Something completely opposite to ${rawSynonyms[0] || 'the target concept'}.`,
        'A formal term used exclusively in ancient architecture.'
      ],
      correctAnswerIndex: 0,
      explanation: `"${word}" means: ${primaryDefText}`
    };

    return {
      id: word,
      word,
      partOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : ['adjective'],
      definitions: definitionsList.length > 0 ? definitionsList : [
        {
          dictionary: primaryDefText,
          simple: primarySimpleText,
          thinkOfItAs: this.generateRichThinkOfItAs(word, primaryDefText, primaryPos, rawSynonyms, 0)
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
          ? `"${word}" is an action verb. Notice how its form changes when moving from present to past and future tenses.`
          : `"${word}" is a ${partsOfSpeech.join('/')}. It keeps the same form regardless of tense; the surrounding verb sets the sentence timing.`,
        present: verbTenses?.present,
        past: verbTenses?.past,
        future: verbTenses?.future
      },
      examples: examplesList.length > 0 ? examplesList : [
        {
          context: 'Everyday',
          sentence: `The concept of "${word}" is frequently discussed in clear English communication.`
        },
        {
          context: 'Academic',
          sentence: `In formal contexts, understanding "${word}" helps articulate complex ideas accurately.`
        }
      ],
      whenToUse: whenToUseList,
      commonPhrases: commonPhrasesList,
      synonyms: synonymsList,
      antonyms: rawAntonyms.slice(0, 5),
      memoryTip: memoryTipText,
      practiceQuestions: [practiceQ]
    };
  },

  transformDatamuseEntry(dm: DatamuseResult): WordEntry {
    const word = dm.word.toLowerCase();
    const partsOfSpeech: PartOfSpeech[] = [];
    const rawDefs: { pos: string; def: string }[] = [];

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
        rawDefs.push({ pos, def: text.charAt(0).toUpperCase() + text.slice(1) });
      }
    });

    const primaryPos = partsOfSpeech[0] || 'noun';
    const definitionsList = rawDefs.slice(0, 3).map((d, index) => ({
      dictionary: d.def,
      simple: this.generateRichSimpleEnglish(word, d.def, d.pos, []),
      thinkOfItAs: this.generateRichThinkOfItAs(word, d.def, d.pos, [], index)
    }));

    const isVerb = partsOfSpeech.includes('verb');
    const primaryDefText = definitionsList[0]?.dictionary || `Definition of ${word}`;

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
        explanation: `"${word}" functions as a ${partsOfSpeech.join('/')} in English sentences.`
      },
      examples: [
        { context: 'Everyday', sentence: `She used the term "${word}" in her conversation.` }
      ],
      whenToUse: this.generateWhenToUse(word, primaryPos, []),
      commonPhrases: this.generateCommonPhrases(word, primaryPos),
      memoryTip: this.generateMemoryTip(word, [], primaryDefText),
      practiceQuestions: [
        {
          id: `${word}-q1`,
          wordId: word,
          type: 'multiple-choice',
          question: `What does "${word}" mean?`,
          options: [primaryDefText, 'An ancient string instrument', 'Something completely unrelated'],
          correctAnswerIndex: 0,
          explanation: `"${word}" means: ${primaryDefText}`
        }
      ]
    };
  },

  generateFallbackEntry(word: string): WordEntry {
    const cleanWord = word.toLowerCase();
    const primaryDef = `An English vocabulary term referring to ${cleanWord}.`;
    return {
      id: cleanWord,
      word: cleanWord,
      partOfSpeech: ['noun'],
      definitions: [
        {
          dictionary: primaryDef,
          simple: `In plain English, ${cleanWord} refers to a specific concept, object, or quality.`,
          thinkOfItAs: `A mental image representing ${cleanWord} in real life.`
        }
      ],
      pronunciation: {
        british: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) },
        american: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) }
      },
      usage: {
        isVerb: false,
        explanation: `"${cleanWord}" is an English noun.`
      },
      examples: [
        { context: 'Everyday', sentence: `We discussed ${cleanWord} during the study session.` }
      ],
      whenToUse: [`Using standard English vocabulary when discussing ${cleanWord}`],
      commonPhrases: [`The nature of ${cleanWord}`, `Key aspect of ${cleanWord}`],
      memoryTip: `Remember: ${cleanWord.toUpperCase()} starts with '${cleanWord.charAt(0).toUpperCase()}'.`,
      practiceQuestions: [
        {
          id: `${cleanWord}-q1`,
          wordId: cleanWord,
          type: 'multiple-choice',
          question: `Which option describes "${cleanWord}"?`,
          options: [primaryDef, 'An unrelated mathematical term', 'A musical notation'],
          correctAnswerIndex: 0,
          explanation: `"${cleanWord}" is an English vocabulary term.`
        }
      ]
    };
  },

  // --- SMART RICH GENERATORS FOR TAILORED LEARNING ---

  generateRichSimpleEnglish(word: string, def: string, pos: string, synonyms: string[]): string {
    if (!def) return '';

    // Clean dictionary prefixes
    let cleanDef = def
      .replace(/^(Relating to|Characterized by|The quality of|The act of|Having the nature of)\s+/i, '')
      .replace(/;\s*also\s*:.*$/i, '');
    cleanDef = cleanDef.charAt(0).toLowerCase() + cleanDef.slice(1);

    if (synonyms.length >= 2) {
      return `In simple terms, ${word} describes something that is ${synonyms[0]} or ${synonyms[1]}. It means ${cleanDef}.`;
    } else if (synonyms.length === 1) {
      return `In plain English, ${word} means being ${synonyms[0]}—${cleanDef}.`;
    }

    if (pos === 'adjective') {
      return `In simple terms, ${word} is used to describe things or people that are ${cleanDef}.`;
    } else if (pos === 'verb') {
      return `In plain English, to ${word} means to ${cleanDef}.`;
    } else if (pos === 'adverb') {
      return `In simple terms, doing something ${word} means doing it in a way that is ${cleanDef}.`;
    }

    return `In plain English, ${word} refers to ${cleanDef}.`;
  },

  generateRichThinkOfItAs(word: string, def: string, pos: string, synonyms: string[], index: number): string {
    const keySynonym = synonyms[index] || synonyms[0];

    if (keySynonym) {
      return `${word.charAt(0).toUpperCase() + word.slice(1)} in action: Think of something that is strictly ${keySynonym}, like a moment or feeling that captures this quality.`;
    }

    const clean = def.replace(/^(Relating to|Characterized by|The quality of|The act of)\s+/i, '').toLowerCase();

    if (pos === 'adjective') {
      return `Think of a situation where something feels distinctly ${clean}.`;
    } else if (pos === 'verb') {
      return `Think of taking a clear, active step to ${clean}.`;
    } else if (pos === 'noun') {
      return `Picture a real-world example of ${clean}.`;
    }

    return `Think of ${word} as a core concept representing ${clean}.`;
  },

  generateWhenToUse(word: string, pos: string, synonyms: string[]): string[] {
    const syn1 = synonyms[0] ? ` (${synonyms[0]})` : '';

    if (pos === 'adjective') {
      return [
        `Use when describing qualities, traits, or states that feel ${synonyms[0] || 'distinct'} in your sentence.`,
        `Use in writing or speeches when you want to add precision instead of using general terms like "good" or "bad".`
      ];
    } else if (pos === 'verb') {
      return [
        `Use when describing an action where someone takes steps to${syn1}.`,
        `Use in professional, academic, or formal discussions to convey specific actions clearly.`
      ];
    } else if (pos === 'noun') {
      return [
        `Use when referring to the specific idea, condition, or entity of ${word}${syn1}.`,
        `Use as the main topic or subject in sentences discussing ${word.toLowerCase()}.`
      ];
    }

    return [
      `Use when expressing ideas related to ${word}${syn1}.`,
      `Use to elevate your spoken or written English vocabulary.`
    ];
  },

  generateCommonPhrases(word: string, pos: string): string[] {
    const capitalWord = word.charAt(0).toUpperCase() + word.slice(1);

    if (pos === 'adjective') {
      return [
        `Highly ${word}`,
        `${capitalWord} nature`,
        `${capitalWord} effect`,
        `Remain ${word}`
      ];
    } else if (pos === 'verb') {
      return [
        `Attempt to ${word}`,
        `Ability to ${word}`,
        `Strive to ${word}`,
        `Successfully ${word}`
      ];
    } else if (pos === 'noun') {
      return [
        `The core of ${word}`,
        `A sense of ${word}`,
        `Underlying ${word}`,
        `Degree of ${word}`
      ];
    }

    return [
      `Concept of ${word}`,
      `${capitalWord} context`,
      `Understanding ${word}`
    ];
  },

  generateMemoryTip(word: string, synonyms: string[], def: string): string {
    const firstLetter = word.charAt(0).toUpperCase();
    const synMatch = synonyms.find(s => s.charAt(0).toUpperCase() === firstLetter);

    if (synMatch) {
      return `Mnemonic: ${word.toUpperCase()} starts with '${firstLetter}', just like ${synMatch.toUpperCase()} (${def.slice(0, 35)}...).`;
    }

    if (synonyms.length > 0) {
      return `Anchor: Think of ${word.toUpperCase()} = ${synonyms.slice(0, 2).join(' / ').toUpperCase()}.`;
    }

    return `Anchor: ${word.toUpperCase()} starts with '${firstLetter}'. Connect it to ${def.slice(0, 40)}.`;
  },

  generateVerbUsage(word: string): { present: string[]; past: string[]; future: string[] } {
    let pastForm = `${word}ed`;
    if (word.endsWith('e')) pastForm = `${word}d`;
    else if (word.endsWith('y') && !/[aeiou]y$/.test(word)) pastForm = `${word.slice(0, -1)}ied`;

    let thirdPresent = `${word}s`;
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x')) thirdPresent = `${word}es`;
    else if (word.endsWith('y') && !/[aeiou]y$/.test(word)) thirdPresent = `${word.slice(0, -1)}ies`;

    return {
      present: [
        `She ${thirdPresent} whenever the opportunity arises.`,
        `They ${word} regularly as part of their routine.`
      ],
      past: [
        `We ${pastForm} after reviewing the initial results.`,
        `The team ${pastForm} without hesitation.`
      ],
      future: [
        `I will ${word} as soon as everything is prepared.`,
        `They plan to ${word} in the upcoming phase.`
      ]
    };
  },

  generatePhoneticSpelling(word: string): string {
    return word
      .replace(/th/gi, 'TH')
      .replace(/tion/gi, 'shuhn')
      .replace(/ing/gi, 'ing');
  }
};
