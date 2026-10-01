import { WordEntry, PartOfSpeech, PracticeQuestion } from '../models/word';
import { SAMPLE_WORDS } from '../data/words';
import { OFFLINE_DICTIONARY_DATA } from '../data/offlineDictionary';
import { storageService } from './storageService';
import { aiService } from './aiService';

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

interface WiktionaryDefItem {
  definition: string;
  parsedExamples?: { example: string; translation?: string }[];
  examples?: string[];
}

interface WiktionarySection {
  partOfSpeech: string;
  language: string;
  definitions: WiktionaryDefItem[];
}

interface WiktionaryResponse {
  en?: WiktionarySection[];
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

import {
  FORMAL_TO_SIMPLE_MAP,
  simplifyFormalEnglish,
  isVerbatimDuplicate,
  cleanDictionaryDefinition
} from '../utils/simplificationEngine';

export { FORMAL_TO_SIMPLE_MAP, simplifyFormalEnglish };

const SYNONYM_DETAILS_MAP: Record<string, { simpleDefinition: string; distinction: string }> = {
  'offensive': {
    simpleDefinition: 'Causing someone to feel insulted or deeply hurt.',
    distinction: 'Focuses on hurting people\'s feelings.'
  },
  'unhealthy': {
    simpleDefinition: 'Not good for physical or mental health.',
    distinction: 'Applies to any bad habit or illness.'
  },
  'ghoulish': {
    simpleDefinition: 'Showing a creepy fascination with death and horror.',
    distinction: 'Much more scary and creepy.'
  },
  'pathological': {
    simpleDefinition: 'Driven by an extreme mental condition or disease.',
    distinction: 'Implies a real medical illness.'
  },
  'unwholesome': {
    simpleDefinition: 'Bad for moral health or good character.',
    distinction: 'Focuses on bad influences or habits.'
  },
  'vague': {
    simpleDefinition: 'Not clear or lacking detailed information.',
    distinction: 'Focuses on missing details.'
  },
  'unclear': {
    simpleDefinition: 'Hard to see, hear, or understand.',
    distinction: 'General word for anything confusing.'
  },
  'equivocal': {
    simpleDefinition: 'Using confusing language to hide the truth.',
    distinction: 'Used when trying to mislead someone.'
  },
  'tough': {
    simpleDefinition: 'Strong and able to handle rough treatment.',
    distinction: 'Focuses on raw strength.'
  },
  'adaptable': {
    simpleDefinition: 'Able to easily change and fit new situations.',
    distinction: 'Focuses on adjusting to new places.'
  },
  'flexible': {
    simpleDefinition: 'Able to bend or change plans easily.',
    distinction: 'Focuses on being open to change.'
  },
  'bargain': {
    simpleDefinition: 'Talking with someone to get a lower price.',
    distinction: 'Focuses on money and prices.'
  },
  'mediate': {
    simpleDefinition: 'Helping two arguing sides talk and agree.',
    distinction: 'Used when a third person helps settle a fight.'
  },
  'settle': {
    simpleDefinition: 'Reaching a final decision to end an argument.',
    distinction: 'Focuses on making the final decision.'
  },
  'unavoidable': {
    simpleDefinition: 'Impossible to stop or stay away from.',
    distinction: 'Stresses that nothing can prevent it.'
  },
  'certain': {
    simpleDefinition: 'Completely sure to happen without any doubt.',
    distinction: 'Simply means 100% sure.'
  },
  'eloquence': {
    simpleDefinition: 'Speaking or writing in a beautiful, persuasive way.',
    distinction: 'Focuses on graceful and moving words.'
  },
  'fluent': {
    simpleDefinition: 'Able to speak smoothly without stopping.',
    distinction: 'Focuses on smooth flow of speech.'
  },
  'hesitant': {
    simpleDefinition: 'Pausing before acting because you feel unsure.',
    distinction: 'Focuses on the short pause before acting.'
  },
  'unwilling': {
    simpleDefinition: 'Refusing to do something or agree to it.',
    distinction: 'Means a direct refusal.'
  },
  'speculate': {
    simpleDefinition: 'Guessing about something without real proof.',
    distinction: 'Focuses on making a guess.'
  },
  'postulate': {
    simpleDefinition: 'Suggesting an idea as a starting point for debate.',
    distinction: 'Used when starting a formal theory.'
  }
};

function getFallbackSynonymDetails(synWord: string, mainWord: string): { simpleDefinition: string; distinction: string } {
  const cleanSyn = synWord.toLowerCase();
  const cleanMain = mainWord.toLowerCase();

  const mapped = SYNONYM_DETAILS_MAP[cleanSyn];
  let distBase = mapped?.distinction || `Focuses on ${cleanSyn} traits`;

  let finalDist = distBase;
  if (!distBase.toLowerCase().includes(cleanMain)) {
    if (distBase.startsWith('More') || distBase.startsWith('Broader') || distBase.startsWith('Much more')) {
      finalDist = `${distBase} than ${cleanMain}.`;
    } else {
      finalDist = `${distBase}, unlike ${cleanMain}.`;
    }
  }

  return {
    simpleDefinition: mapped?.simpleDefinition || `Refers to ${cleanSyn} in simple terms.`,
    distinction: finalDist
  };
}

export const dictionaryService = {
  isFallbackEntry(entry: WordEntry | null | undefined): boolean {
    if (!entry || !entry.definitions || entry.definitions.length === 0) return true;
    const def = (entry.definitions[0]?.dictionary || '').trim().toLowerCase();
    const simple = (entry.definitions[0]?.simple || '').trim().toLowerCase();
    const thinkOfItAs = (entry.definitions[0]?.thinkOfItAs || '').trim().toLowerCase();

    // Check placeholder fallbacks
    if (
      def.startsWith('an english vocabulary term referring to') ||
      simple.includes('refers to a specific concept or object in plain english') ||
      thinkOfItAs.startsWith('picture a clear real-life scenario representing')
    ) {
      return true;
    }

    // Check verbatim duplicate: if simple is just a lazy copy/prepend of the dictionary definition
    if (isVerbatimDuplicate(simple, def)) {
      return true;
    }

    return false;
  },

  purgeCorruptedCache(): void {
    try {
      const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
      let changed = false;
      Object.keys(cache).forEach(key => {
        if (this.isFallbackEntry(cache[key])) {
          delete cache[key];
          changed = true;
        }
      });
      if (changed) {
        storageService.set(API_CACHE_KEY, cache);
      }
    } catch (e) {
      // ignore
    }
  },

  getWordLocal(term: string): WordEntry | null {
    if (!term) return null;
    const cleanTerm = term.trim().toLowerCase();

    // 1. Built-in sample words
    const sampleMatch = SAMPLE_WORDS.find(w => w.word.toLowerCase() === cleanTerm || w.id.toLowerCase() === cleanTerm);
    if (sampleMatch) return sampleMatch;

    // 2. Preloaded Offline Dictionary Dataset
    if (OFFLINE_DICTIONARY_DATA[cleanTerm]) {
      return OFFLINE_DICTIONARY_DATA[cleanTerm];
    }

    // 3. Local IndexedDB / LocalStorage cache
    const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
    const cached = cache[cleanTerm];
    if (cached) {
      if (this.isFallbackEntry(cached)) {
        // Automatically evict corrupted placeholder entry
        delete cache[cleanTerm];
        storageService.set(API_CACHE_KEY, cache);
        return null;
      }
      return cached;
    }
    return null;
  },

  async fetchWithTimeout(url: string, timeoutMs: number = 4000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  },

  async fetchDatamuseSynonyms(word: string): Promise<string[]> {
    try {
      const res = await this.fetchWithTimeout(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=8`, 2500);
      if (res.ok) {
        const list: { word: string }[] = await res.json();
        if (list && list.length > 0) {
          return list.map(item => item.word.toLowerCase());
        }
      }
      const mlRes = await this.fetchWithTimeout(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=6`, 2500);
      if (mlRes.ok) {
        const mlList: { word: string }[] = await mlRes.json();
        return mlList.map(item => item.word.toLowerCase()).filter(w => w !== word.toLowerCase());
      }
    } catch (e) {
      console.warn('Datamuse synonym fetch failed', e);
    }
    return [];
  },

  async enrichSynonymsIfNeeded(entry: WordEntry): Promise<WordEntry> {
    if (!entry.synonyms || entry.synonyms.length < 2) {
      const fetchedSyns = await this.fetchDatamuseSynonyms(entry.word);
      if (fetchedSyns.length > 0) {
        const currentSyns = entry.synonyms ? entry.synonyms.map(s => s.word.toLowerCase()) : [];
        const merged = [...currentSyns];
        fetchedSyns.forEach(s => {
          if (!merged.includes(s)) merged.push(s);
        });

        entry.synonyms = merged.slice(0, 5).map(syn => ({
          word: syn
        }));
      }
    }

    if (entry.synonyms && entry.synonyms.length > 0) {
      entry.synonyms = entry.synonyms.map(synItem => {
        const cleanSyn = synItem.word.toLowerCase();
        const fallback = getFallbackSynonymDetails(cleanSyn, entry.word);
        const localMatch = this.getWordLocal(cleanSyn);

        const simpleDef =
          (synItem.simpleDefinition && !synItem.simpleDefinition.startsWith('Refers to'))
            ? synItem.simpleDefinition
            : (localMatch?.definitions?.[0]?.simple || localMatch?.definitions?.[0]?.dictionary || fallback.simpleDefinition);

        const dist =
          (synItem.distinction && !synItem.distinction.includes('emphasizes'))
            ? synItem.distinction
            : fallback.distinction;

        return {
          word: synItem.word,
          simpleDefinition: simpleDef,
          distinction: dist
        };
      });
    }

    return entry;
  },

  async getWord(term: string): Promise<WordEntry | null> {
    if (!term || !term.trim()) return null;
    const cleanTerm = term.trim().toLowerCase();

    // 1. Local sync match (0ms response)
    const local = this.getWordLocal(cleanTerm);
    if (local && !this.isFallbackEntry(local)) {
      let enriched = await this.enrichSynonymsIfNeeded(local);
      if (aiService.isAIEnabled()) {
        enriched = await aiService.enrichWordEntryWithAI(enriched);
        this.cacheWord(cleanTerm, enriched);
      }
      return enriched;
    }

    // 2. Primary: Wiktionary REST API (High uptime, fast <300ms, comprehensive English definitions)
    try {
      const wkResponse = await this.fetchWithTimeout(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanTerm)}`, 3500);
      if (wkResponse.ok) {
        const wkData: WiktionaryResponse = await wkResponse.json();
        const transformed = this.transformWiktionaryEntry(cleanTerm, wkData);
        if (transformed && transformed.definitions.length > 0) {
          let enriched = await this.enrichSynonymsIfNeeded(transformed);
          if (aiService.isAIEnabled()) {
            enriched = await aiService.enrichWordEntryWithAI(enriched);
          }
          this.cacheWord(cleanTerm, enriched);
          return enriched;
        }
      }
    } catch (e) {
      console.warn('Wiktionary API lookup error/timeout', e);
    }

    // 3. Secondary: Free Dictionary API (rich phonetics and audio if available)
    try {
      const response = await this.fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanTerm)}`, 2500);
      if (response.ok) {
        const data: ApiWordEntry[] = await response.json();
        if (data && data.length > 0) {
          let transformed = this.transformApiEntry(data[0]);
          transformed = await this.enrichSynonymsIfNeeded(transformed);
          if (aiService.isAIEnabled()) {
            transformed = await aiService.enrichWordEntryWithAI(transformed);
          }
          this.cacheWord(cleanTerm, transformed);
          return transformed;
        }
      }
    } catch (e) {
      console.warn('Free Dictionary API lookup error/timeout', e);
    }

    // 4. Tertiary: Datamuse API
    try {
      const dmResponse = await this.fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanTerm)}&md=d&max=1`, 3500);
      if (dmResponse.ok) {
        const dmData: DatamuseResult[] = await dmResponse.json();
        if (dmData && dmData.length > 0 && dmData[0].defs && dmData[0].defs.length > 0) {
          let transformed = this.transformDatamuseEntry(dmData[0]);
          transformed = await this.enrichSynonymsIfNeeded(transformed);
          if (aiService.isAIEnabled()) {
            transformed = await aiService.enrichWordEntryWithAI(transformed);
          }
          this.cacheWord(cleanTerm, transformed);
          return transformed;
        }
      }
    } catch (e) {
      console.warn('Datamuse API fallback error/timeout', e);
    }

    // 5. Intelligent AI Generator (when external dictionary APIs fail or word is slang/modern)
    if (aiService.isAIEnabled()) {
      try {
        const aiEntry = await aiService.generateFullWordWithAI(cleanTerm);
        if (aiEntry && !this.isFallbackEntry(aiEntry)) {
          this.cacheWord(cleanTerm, aiEntry);
          return aiEntry;
        }
      } catch (e) {
        console.warn('AI full word generation failed', e);
      }
    }

    // 6. Emergency Fallback generator (NEVER cached into localStorage)
    let fallback = this.generateFallbackEntry(cleanTerm);
    fallback = await this.enrichSynonymsIfNeeded(fallback);
    return fallback;
  },

  cacheWord(term: string, entry: WordEntry): void {
    if (!entry || this.isFallbackEntry(entry)) {
      // NEVER cache a degraded fallback placeholder!
      return;
    }
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

    const offlineList = Object.values(OFFLINE_DICTIONARY_DATA);
    const cache = storageService.get<Record<string, WordEntry>>(API_CACHE_KEY, {});
    const cachedList = Object.values(cache).filter(w => !this.isFallbackEntry(w));

    const wordMap = new Map<string, WordEntry>();
    SAMPLE_WORDS.forEach(w => wordMap.set(w.word.toLowerCase(), w));
    offlineList.forEach(w => { if (!wordMap.has(w.word.toLowerCase())) wordMap.set(w.word.toLowerCase(), w); });
    cachedList.forEach(w => { if (!wordMap.has(w.word.toLowerCase())) wordMap.set(w.word.toLowerCase(), w); });

    const allLocal = Array.from(wordMap.values());

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
    const cachedList = Object.values(cachedObj).filter(w => !this.isFallbackEntry(w));
    return [...SAMPLE_WORDS, ...cachedList];
  },

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

    const definitionsList = rawDefs.slice(0, 3).map((d, index) => {
      const simple = this.generatePureSimpleEnglish(word, d.def, d.pos, rawSynonyms);
      const thinkOfItAs = this.generatePureVividMentalImage(word, d.def, d.pos, rawSynonyms, index);
      return {
        dictionary: d.def,
        simple,
        thinkOfItAs
      };
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
    const primaryDefText = definitionsList[0]?.dictionary || `The word ${word}.`;
    const primarySimpleText = definitionsList[0]?.simple || primaryDefText;

    const verbTenses = isVerb ? this.generateVerbUsage(word) : undefined;

    const synonymsList = rawSynonyms.slice(0, 5).map(syn => {
      const cleanSyn = syn.toLowerCase();
      const fallback = getFallbackSynonymDetails(cleanSyn, word);
      const localMatch = this.getWordLocal(cleanSyn);

      const simpleDef =
        localMatch?.definitions?.[0]?.simple ||
        localMatch?.definitions?.[0]?.dictionary ||
        fallback.simpleDefinition;

      return {
        word: syn,
        simpleDefinition: simpleDef,
        distinction: fallback.distinction
      };
    });

    // Generate authentic real-life sentence examples (combines API examples with authentic natural sentences)
    const authenticExamples = this.generateAuthenticExamples(word, primaryPos, examplesList);

    const whenToUseList = this.generateWhenToUse(word, primaryPos, rawSynonyms);
    const whenNotToUseList = this.generateWhenNotToUse(word, primaryPos, rawSynonyms);
    const commonPhrasesList = this.generateCommonPhrases(word, primaryPos);
    const memoryTipText = this.generateMemoryTip(word, rawSynonyms, primaryDefText);

    const practiceQ: PracticeQuestion = {
      id: `${word}-q1`,
      wordId: word,
      type: 'multiple-choice',
      question: `What is the plain English meaning of "${word}"?`,
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
          thinkOfItAs: this.generatePureVividMentalImage(word, primaryDefText, primaryPos, rawSynonyms, 0)
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
          : `"${word}" functions as a ${partsOfSpeech.join('/')}. The word itself stays the same; the verb in your sentence sets the timing.`,
        present: verbTenses?.present,
        past: verbTenses?.past,
        future: verbTenses?.future
      },
      examples: authenticExamples,
      whenToUse: whenToUseList,
      whenNotToUse: whenNotToUseList,
      commonPhrases: commonPhrasesList,
      synonyms: synonymsList,
      antonyms: rawAntonyms.slice(0, 5),
      commonUseExample: this.generateCommonUseExample(word, primaryPos, primaryDefText, rawSynonyms),
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
      simple: this.generatePureSimpleEnglish(word, d.def, d.pos, []),
      thinkOfItAs: this.generatePureVividMentalImage(word, d.def, d.pos, [], index)
    }));

    const isVerb = partsOfSpeech.includes('verb');
    const primaryDefText = definitionsList[0]?.dictionary || `Definition of ${word}`;
    const authenticExamples = this.generateAuthenticExamples(word, primaryPos, []);

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
      examples: authenticExamples,
      whenToUse: this.generateWhenToUse(word, primaryPos, []),
      commonPhrases: this.generateCommonPhrases(word, primaryPos),
      memoryTip: this.generateMemoryTip(word, [], primaryDefText),
      practiceQuestions: [
        {
          id: `${word}-q1`,
          wordId: word,
          type: 'multiple-choice',
          question: `What does "${word}" mean in plain English?`,
          options: [definitionsList[0]?.simple || primaryDefText, 'An ancient string instrument', 'Something completely unrelated'],
          correctAnswerIndex: 0,
          explanation: `"${word}" means: ${primaryDefText}`
        }
      ]
    };
  },

  transformWiktionaryEntry(cleanWord: string, data: WiktionaryResponse): WordEntry | null {
    const enSections = data.en || [];
    if (!enSections || enSections.length === 0) return null;

    const partsOfSpeech: PartOfSpeech[] = [];
    const rawDefs: { pos: PartOfSpeech; def: string; examples?: string[] }[] = [];

    for (const sec of enSections) {
      const rawPos = (sec.partOfSpeech || '').toLowerCase();
      let pos: PartOfSpeech = 'noun';
      if (rawPos.includes('adj')) pos = 'adjective';
      else if (rawPos.includes('verb')) pos = 'verb';
      else if (rawPos.includes('adv')) pos = 'adverb';
      else if (rawPos.includes('noun')) pos = 'noun';
      else if (rawPos.includes('prep')) pos = 'preposition';
      else if (rawPos.includes('conj')) pos = 'conjunction';

      if (!partsOfSpeech.includes(pos)) partsOfSpeech.push(pos);

      for (const d of sec.definitions || []) {
        const cleaned = stripHtml(d.definition);
        if (
          cleaned &&
          cleaned.length > 5 &&
          !cleaned.toLowerCase().startsWith('inflection of') &&
          !cleaned.toLowerCase().startsWith('plural of') &&
          !cleaned.toLowerCase().startsWith('alternative form of')
        ) {
          const exList: string[] = [];
          if (d.parsedExamples && d.parsedExamples.length > 0) {
            d.parsedExamples.forEach(pe => {
              const cleanEx = stripHtml(pe.example);
              if (cleanEx) exList.push(cleanEx);
            });
          }
          rawDefs.push({ pos, def: cleaned, examples: exList });
        }
      }
    }

    if (rawDefs.length === 0) return null;

    const primaryPos = partsOfSpeech[0] || 'noun';
    const isVerb = partsOfSpeech.includes('verb');

    const definitionsList = rawDefs.slice(0, 3).map((d, index) => ({
      dictionary: d.def.charAt(0).toUpperCase() + d.def.slice(1),
      simple: this.generatePureSimpleEnglish(cleanWord, d.def, d.pos, []),
      thinkOfItAs: this.generatePureVividMentalImage(cleanWord, d.def, d.pos, [], index)
    }));

    const primaryDefText = definitionsList[0]?.dictionary || `Definition of ${cleanWord}`;

    const gatheredExamples: { context: 'Conversation' | 'Work' | 'Academic' | 'Everyday'; sentence: string }[] = [];
    rawDefs.forEach(rd => {
      if (rd.examples && rd.examples.length > 0) {
        rd.examples.forEach(ex => {
          if (gatheredExamples.length < 3 && !gatheredExamples.some(ge => ge.sentence === ex)) {
            const ctx = gatheredExamples.length === 0 ? 'Everyday' : gatheredExamples.length === 1 ? 'Work' : 'Conversation';
            gatheredExamples.push({ context: ctx, sentence: ex });
          }
        });
      }
    });

    const authenticExamples = gatheredExamples.length >= 2
      ? gatheredExamples
      : this.generateAuthenticExamples(cleanWord, primaryPos, gatheredExamples);

    return {
      id: cleanWord,
      word: cleanWord,
      partOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : ['noun'],
      definitions: definitionsList,
      pronunciation: {
        british: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) },
        american: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) }
      },
      usage: {
        isVerb,
        explanation: isVerb
          ? `"${cleanWord}" is an action verb. Notice how its form changes when moving from present to past and future tenses.`
          : `"${cleanWord}" functions as a ${partsOfSpeech.join('/')}. The word itself stays the same; the verb in your sentence sets the timing.`
      },
      examples: authenticExamples,
      whenToUse: this.generateWhenToUse(cleanWord, primaryPos, []),
      whenNotToUse: this.generateWhenNotToUse(cleanWord, primaryPos, []),
      commonPhrases: this.generateCommonPhrases(cleanWord, primaryPos),
      commonUseExample: this.generateCommonUseExample(cleanWord, primaryPos, primaryDefText, []),
      memoryTip: this.generateMemoryTip(cleanWord, [], primaryDefText),
      practiceQuestions: [
        {
          id: `${cleanWord}-q1`,
          wordId: cleanWord,
          type: 'multiple-choice',
          question: `What does "${cleanWord}" mean in plain English?`,
          options: [definitionsList[0]?.simple || primaryDefText, 'An ancient string instrument', 'Something completely unrelated'],
          correctAnswerIndex: 0,
          explanation: `"${cleanWord}" means: ${primaryDefText}`
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
          simple: `${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)} refers to a specific concept or object in plain English.`,
          thinkOfItAs: `Picture a clear real-life scenario representing ${cleanWord}.`
        }
      ],
      pronunciation: {
        british: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) },
        american: { ipa: `/ˈ${cleanWord}/`, phonetic: this.generatePhoneticSpelling(cleanWord) }
      },
      usage: {
        isVerb: false,
        explanation: `"${cleanWord}" is a noun.`
      },
      examples: this.generateAuthenticExamples(cleanWord, 'noun', []),
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

  // AUTHENTIC REAL-LIFE EXAMPLE SENTENCE ENGINE — NO PLACEHOLDER REPETITION
  generateAuthenticExamples(
    word: string,
    pos: string,
    existingApiExamples: { context: 'Conversation' | 'Work' | 'Academic' | 'Everyday'; sentence: string }[]
  ): { context: 'Conversation' | 'Work' | 'Academic' | 'Everyday'; sentence: string }[] {
    const clean = word.toLowerCase();

    // High-frequency curated natural sentences
    if (clean === 'seldom') {
      return [
        { context: 'Everyday', sentence: 'He seldom eats fast food because he prefers cooking at home.' },
        { context: 'Work', sentence: 'Our team seldom misses deadlines when projects are planned in advance.' },
        { context: 'Conversation', sentence: 'I seldom see him around here anymore since he moved downtown.' }
      ];
    } else if (clean === 'ephemeral') {
      return [
        { context: 'Everyday', sentence: 'The beauty of a sunset is ephemeral, fading into darkness within minutes.' },
        { context: 'Work', sentence: 'Social media trends are often ephemeral, lasting only a few days before disappearing.' },
        { context: 'Conversation', sentence: 'Fame in pop culture can be very ephemeral.' }
      ];
    } else if (clean === 'resilient') {
      return [
        { context: 'Everyday', sentence: 'Children are remarkably resilient and adapt quickly to new surroundings.' },
        { context: 'Work', sentence: 'Our supply chain proved resilient despite global shipping disruptions.' },
        { context: 'Conversation', sentence: 'She showed a resilient spirit after facing so many setbacks.' }
      ];
    } else if (clean === 'ubiquitous') {
      return [
        { context: 'Everyday', sentence: 'Smartphones have become ubiquitous in modern society.' },
        { context: 'Work', sentence: 'High-speed internet is now ubiquitous across office workspaces.' },
        { context: 'Conversation', sentence: 'Coffee shops seem ubiquitous on almost every corner in this city.' }
      ];
    } else if (clean === 'hypothetical') {
      return [
        { context: 'Academic', sentence: 'The professor presented a hypothetical scenario to test our problem-solving skills.' },
        { context: 'Conversation', sentence: "Let's talk about a hypothetical situation where budget is not an issue." },
        { context: 'Work', sentence: 'We evaluated several hypothetical market conditions before investing.' }
      ];
    }

    // If API provided authentic examples, keep them!
    if (existingApiExamples && existingApiExamples.length >= 2) {
      return existingApiExamples.slice(0, 3);
    }

    // Domain-aware and Part-of-Speech Natural Sentence Fallback Generator
    if (clean === 'gourmand') {
      return [
        { context: 'Everyday', sentence: 'My uncle is a true gourmand who visits a new gourmet restaurant every weekend.' },
        { context: 'Work', sentence: 'The food critic and self-described gourmand gave a stellar review to the new tasting menu.' },
        { context: 'Academic', sentence: 'Culinary historians study how European gourmands influenced modern fine dining traditions.' }
      ];
    } else if (clean === 'parsimonious') {
      return [
        { context: 'Everyday', sentence: 'My parsimonious roommate checks every receipt and reuses paper bags to save pennies.' },
        { context: 'Work', sentence: 'The director maintained a parsimonious budget policy, requiring approval for every small expense.' },
        { context: 'Academic', sentence: 'Economists analyzed how parsimonious household spending impacts post-recession retail growth.' }
      ];
    }

    if (pos === 'adverb') {
      return [
        { context: 'Everyday', sentence: `She ${clean} checks her phone during dinner because she expects an urgent call.` },
        { context: 'Work', sentence: `The team ${clean} completes audits ahead of schedule when well-prepared.` },
        { context: 'Conversation', sentence: `I ${clean} notice that happening when we discuss this topic.` }
      ];
    } else if (pos === 'adjective') {
      return [
        { context: 'Everyday', sentence: `His ${clean} approach to problem-solving helped resolve the issue quickly.` },
        { context: 'Work', sentence: `The manager gave a ${clean} presentation that convinced the executive team.` },
        { context: 'Academic', sentence: `Researchers presented a ${clean} model to explain the unexpected findings.` }
      ];
    } else if (pos === 'verb') {
      return [
        { context: 'Everyday', sentence: `She decided to ${clean} her plans clearly so everyone understood.` },
        { context: 'Work', sentence: `The director asked the team to ${clean} their quarterly goals during the review.` },
        { context: 'Academic', sentence: `Scientists hope to ${clean} new data during the upcoming clinical trial.` }
      ];
    } else if (pos === 'noun') {
      return [
        { context: 'Everyday', sentence: `Her passion for ${clean} was obvious to everyone who spent time with her.` },
        { context: 'Work', sentence: `The executive team discussed strategies to manage challenges related to ${clean}.` },
        { context: 'Academic', sentence: `Scholars published a comprehensive paper analyzing the broader effects of ${clean}.` }
      ];
    }

    return [
      { context: 'Everyday', sentence: `Understanding ${clean} helps in real-life conversations.` },
      { context: 'Work', sentence: `The executive discussed ${clean} as a key focus area during the review.` }
    ];
  },

  // PURE SIMPLE ENGLISH ENGINE — NO DICTIONARY JARGON OR SELF-REFERENTIAL RE-USE
  generatePureSimpleEnglish(word: string, def: string, pos: string, _synonyms?: string[]): string {
    if (!def) return '';

    const cleanWord = word.toLowerCase();

    // Explicit 5th-grade translations for core terms
    if (cleanWord === 'cacophony') {
      return 'Cacophony means a loud, messy clash of harsh noises happening all at once, like car horns, construction drills, and shouting on a crowded street.';
    } else if (cleanWord === 'seldom') {
      return 'Seldom means almost never, or not very often. If you seldom do something, it happens only once in a long while.';
    } else if (cleanWord === 'ephemeral') {
      return 'Ephemeral describes something that exists for only a brief moment before fading away, like a rainbow or a shooting star.';
    } else if (cleanWord === 'resilient') {
      return 'Resilient describes someone or something that can stay strong and bounce back quickly after going through hard times.';
    } else if (cleanWord === 'ubiquitous') {
      return 'Ubiquitous describes something that seems to be everywhere at the same time, so you see it wherever you look.';
    } else if (cleanWord === 'hypothetical') {
      return 'Hypothetical describes an imagined situation or guess used to test an idea, not something that has actually happened yet.';
    } else if (cleanWord === 'meticulous') {
      return 'Meticulous describes someone who pays extreme attention to tiny details to ensure everything is clean and error-free.';
    } else if (cleanWord === 'diligent') {
      return 'Diligent describes a worker or student who shows steady, careful effort in completing their work.';
    } else if (cleanWord === 'eloquent') {
      return 'Eloquent describes speech or writing that is clear, expressive, and powerful enough to move an audience.';
    } else if (cleanWord === 'pragmatic') {
      return 'Pragmatic describes a mindset focused on real solutions that actually work, rather than ideal rules.';
    } else if (cleanWord === 'gourmand') {
      return 'A gourmand is a person who deeply loves eating good food and truly enjoys rich, delicious meals.';
    } else if (cleanWord === 'parsimonious') {
      return 'Parsimonious describes someone who is extremely unwilling to spend money, use resources, or share.';
    } else if (cleanWord === 'serendipity') {
      return 'Serendipity means finding good or pleasant things by lucky accident, when you were not even looking for them.';
    } else if (cleanWord === 'quixotic') {
      return 'Quixotic describes ideas or plans that are wildly idealistic, romantic, and noble, but totally impractical in real life.';
    } else if (cleanWord === 'schadenfreude') {
      return 'Schadenfreude is the secret feeling of pleasure someone gets from seeing another person experience bad luck or embarrassment.';
    } else if (cleanWord === 'defenestration') {
      return 'Defenestration is the act of throwing someone or something out of a window.';
    }

    let cleanDef = cleanDictionaryDefinition(def, word);

    // Strip self-referential terms (e.g., parsimonious -> parsimony)
    if (cleanWord.startsWith('parsimon') && cleanDef.toLowerCase().includes('parsimony')) {
      cleanDef = 'extremely unwilling to spend money, use resources, or share';
    }

    let simplified = simplifyFormalEnglish(cleanDef);
    simplified = simplified.charAt(0).toLowerCase() + simplified.slice(1);
    const capitalizeWord = word.charAt(0).toUpperCase() + word.slice(1);

    if (pos === 'adverb') {
      const stripped = simplified.replace(/^(in a|in an)\s+/i, '').replace(/\s+(manner|way)$/i, '');
      return `Doing something ${word} means doing it ${stripped}. In plain words, it describes how an action is carried out.`;
    } else if (pos === 'adjective') {
      const stripped = simplified.replace(/^(being|having|characterized by|marked by|known for)\s+/i, '');
      return `When someone or something is ${word}, it means they are ${stripped}.`;
    } else if (pos === 'verb') {
      const stripped = simplified.replace(/^to\s+/i, '');
      return `To ${word} means to ${stripped}.`;
    } else if (pos === 'noun') {
      if (simplified.startsWith('the skill of ') || simplified.startsWith('the process of ') || simplified.startsWith('the feeling of ')) {
        return `${capitalizeWord} is ${simplified}. In everyday life, it is all about how this is practiced or experienced.`;
      }
      if (simplified.startsWith('someone who ') || simplified.startsWith('a person who ')) {
        return `A ${word} is ${simplified.replace(/^a person who /i, 'someone who ')}.`;
      }
      if (simplified.startsWith('a tool used to ') || simplified.startsWith('a device used to ')) {
        return `A ${word} is ${simplified}.`;
      }
      if (simplified.startsWith('a ') || simplified.startsWith('an ') || simplified.startsWith('the ')) {
        return `In simple English, ${word} is ${simplified}.`;
      }
      return `${capitalizeWord} refers to ${simplified}.`;
    }

    return `${capitalizeWord} means ${simplified}.`;
  },

  // PURE VIVID MENTAL IMAGE ENGINE — ZERO DICTIONARY REUSE
  generatePureVividMentalImage(word: string, def: string, pos: string, _synonyms?: string[], _index?: number): string {
    const cleanWord = word.toLowerCase();
    const lowerDef = def.toLowerCase();

    // Specific word overrides
    if (cleanWord === 'cacophony') {
      return 'Picture being trapped in a traffic jam where car horns blare, jackhammers pound the pavement, and sirens scream all at once.';
    } else if (cleanWord === 'seldom') {
      return 'Think of how often it snows in a hot desert — it almost never happens.';
    } else if (cleanWord === 'ephemeral') {
      return 'Think of a shimmering soap bubble floating through the air — it looks beautiful for three seconds, then pops and vanishes.';
    } else if (cleanWord === 'resilient') {
      return 'Think of a rubber ball — no matter how hard you slam it into the pavement, it bounces right back into your hands.';
    } else if (cleanWord === 'ubiquitous') {
      return 'Think of smartphones on a crowded morning train — almost everywhere you glance, someone is looking at one.';
    } else if (cleanWord === 'hypothetical') {
      return 'Think of asking "What would you do if you won a million dollars?" — you are imagining a fun scenario, not spending real cash yet.';
    } else if (cleanWord === 'meticulous') {
      return 'Think of a watchmaker carefully placing microscopic gears using tiny tweezers and inspecting every notch with a magnifying glass.';
    } else if (cleanWord === 'diligent') {
      return 'Think of an ant steadily carrying crumbs across the sidewalk all afternoon without ever stopping or giving up.';
    } else if (cleanWord === 'eloquent') {
      return 'Think of a speaker whose words are so clear and moving that an entire restless room immediately goes quiet to listen.';
    } else if (cleanWord === 'pragmatic') {
      return 'Think of choosing comfortable sneakers for a 10-mile walk instead of stylish shoes that give you blisters — prioritizing real comfort over appearance.';
    } else if (cleanWord === 'gourmand') {
      return 'Imagining a friend at a big party happily tasting every dish on the buffet table and asking the host for the recipes.';
    } else if (cleanWord === 'parsimonious') {
      return 'Watching someone split a group dinner check down to the exact penny so they don\'t overpay by a single cent.';
    } else if (cleanWord === 'quixotic') {
      return 'Imagining someone trying to stop a thunderstorm with a beach umbrella because they have a romantic belief they can do it.';
    } else if (cleanWord === 'serendipity') {
      return 'Reaching into an old winter coat pocket for a tissue and unexpectedly pulling out a 50-dollar bill you forgot you had.';
    } else if (cleanWord === 'defenestration') {
      return 'Watching someone dramatically heave a broken, smoking office printer straight out of a second-story window.';
    } else if (cleanWord === 'schadenfreude') {
      return 'Hiding a secret smile when a smug rival who boasted all week trips over their own shoelace.';
    }

    // 1. Persuasion / Debate / Rhetoric / Influence
    if (lowerDef.includes('persuad') || lowerDef.includes('influence') || lowerDef.includes('rhetoric') || lowerDef.includes('debate') || lowerDef.includes('convince') || lowerDef.includes('argument')) {
      return `Picture a speaker choosing their words so cleverly that a room full of doubtful listeners nods in agreement.`;
    }

    // 2. Sound / Noise
    if (lowerDef.includes('sound') || lowerDef.includes('noise') || lowerDef.includes('voice') || lowerDef.includes('music') || lowerDef.includes('loud') || lowerDef.includes('clash') || lowerDef.includes('tone') || lowerDef.includes('dissonan') || lowerDef.includes('discord')) {
      return `Picture standing in a room where loud, clashing noises overpower everything else and you have to cover your ears.`;
    }

    // 3. Time / Frequency / Duration
    if (lowerDef.includes('time') || lowerDef.includes('short') || lowerDef.includes('long') || lowerDef.includes('brief') || lowerDef.includes('often') || lowerDef.includes('rare') || lowerDef.includes('infrequent')) {
      return `A quick flash of lightning on a dark night — here for a split second, then gone before you can blink.`;
    }

    // 4. Care / Precision / Detail
    if (lowerDef.includes('detail') || lowerDef.includes('careful') || lowerDef.includes('precise') || lowerDef.includes('thorough') || lowerDef.includes('attention')) {
      return `Inspecting every seam of a jacket under a bright magnifying lamp to make sure not a single loose thread is left.`;
    }

    // 5. Speech / Communication
    if (lowerDef.includes('speech') || lowerDef.includes('talk') || lowerDef.includes('speak') || lowerDef.includes('word') || lowerDef.includes('express') || lowerDef.includes('voice')) {
      return `Telling a story so vividly around a campfire that everyone stops chatting and leans in to hear every word.`;
    }

    // 6. Strength / Resistance / Flexibility
    if (lowerDef.includes('strong') || lowerDef.includes('power') || lowerDef.includes('tough') || lowerDef.includes('recover') || lowerDef.includes('difficult')) {
      return `A sturdy palm tree bending almost flat against hurricane winds, then standing right back up once the storm clears.`;
    }

    // 7. Mind / Thought / Ideas
    if (lowerDef.includes('mind') || lowerDef.includes('idea') || lowerDef.includes('thought') || lowerDef.includes('reason') || lowerDef.includes('logic') || lowerDef.includes('believe')) {
      return `Connecting the final two pieces of a difficult puzzle and suddenly seeing the whole picture come together.`;
    }

    // 8. Generosity / Emotion / Heart
    if (lowerDef.includes('kind') || lowerDef.includes('give') || lowerDef.includes('generous') || lowerDef.includes('feeling') || lowerDef.includes('love') || lowerDef.includes('help')) {
      return `Holding an elevator door for someone running late with armfuls of groceries without them having to ask.`;
    }

    const cleanDef = cleanDictionaryDefinition(def, word).toLowerCase();
    const simplified = simplifyFormalEnglish(cleanDef);

    if (pos === 'verb') {
      return `Imagine taking a deliberate step to ${simplified.replace(/^to\s+/i, '')} right when it counts most.`;
    } else if (pos === 'adjective') {
      return `Imagine walking into a room and discovering something that is completely ${simplified.replace(/^(being|having|known for)\s+/i, '')}.`;
    } else if (pos === 'adverb') {
      return `Picture someone handling a tricky situation where they act ${simplified.replace(/^(in a|in an)\s+/i, '').replace(/\s+(manner|way)$/i, '')}.`;
    }

    return `Imagine a real-life situation where ${simplified} comes into play and everyone notices.`;
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
    } else if (pos === 'adverb') {
      return [
        `Use to modify verbs or adjectives when describing how or how often an event occurs.`,
        `Use at the start or middle of sentences to emphasize timing or manner.`
      ];
    }

    return [
      `Use when expressing ideas related to ${word}${syn1}.`,
      `Use to elevate your spoken or written English vocabulary.`
    ];
  },

  generateWhenNotToUse(word: string, pos: string, synonyms: string[]): string[] {
    const syn0 = synonyms[0] ? ` (${synonyms[0]})` : '';
    if (pos === 'adjective') {
      return [
        `Avoid using "${word}" when describing physical objects that completely lack this quality.`,
        `Do not confuse "${word}" with ${synonyms[0] || 'opposite terms'} when precise distinctions matter.`
      ];
    } else if (pos === 'verb') {
      return [
        `Do not use "${word}" for passive situations where no active effort or change occurs.`,
        `Avoid using "${word}" as a noun without converting it to its proper noun form.`
      ];
    } else if (pos === 'noun') {
      return [
        `Do not use "${word}" when describing a personal action rather than a state, object, or concept${syn0}.`,
        `Avoid substituting "${word}" for unrelated general vocabulary.`
      ];
    }
    return [
      `Avoid using "${word}" in informal slang when a simpler everyday word is expected${syn0}.`,
      `Do not use "${word}" out of context in unrelated technical fields.`
    ];
  },

  generateCommonUseExample(word: string, pos: string, def: string, synonyms: string[]): string {
    const cleanWord = word.toLowerCase();
    const cleanDef = def.replace(/^(Relating to|Characterized by|The quality of|The act of)\s+/i, '').replace(/\.$/, '').toLowerCase();
    const synHint = synonyms.length > 0 && synonyms[0] !== cleanWord ? ` (similar to ${synonyms[0]})` : '';

    if (cleanWord === 'hypothetical') {
      return 'Asking someone what they would do if they won the lottery is posing a "hypothetical question".';
    } else if (cleanWord === 'resilient') {
      return 'A startup that bounces back quickly after losing funding is described as being "resilient".';
    } else if (cleanWord === 'morbid') {
      return 'Someone who is overly obsessed with reading disaster news has a "morbid fascination".';
    } else if (cleanWord === 'candid') {
      return 'A manager who speaks the complete truth without hiding uncomfortable facts is giving a "candid review".';
    } else if (cleanWord === 'meticulous') {
      return 'A surgeon who double-checks every tool before an operation shows "meticulous preparation".';
    }

    if (pos === 'adjective') {
      return `Someone or something displaying ${cleanDef}${synHint} in daily life is described using "${word}".`;
    } else if (pos === 'verb') {
      return `Taking direct action to ${cleanDef}${synHint} in your work is how you "${word}".`;
    } else if (pos === 'noun') {
      return `Experiencing a situation involving ${cleanDef}${synHint} is a classic example of "${word}".`;
    }

    return `Using "${word}" in conversation helps describe a scenario involving ${cleanDef}${synHint}.`;
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
    } else if (pos === 'adverb') {
      return [
        `${capitalWord} observed`,
        `Quite ${word}`,
        `Used ${word}`,
        `${capitalWord} if ever`
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

    return `Anchor: ${word.toUpperCase()} starts with '${firstLetter}'. Connect it to "${def.slice(0, 35)}...".`;
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

try {
  dictionaryService.purgeCorruptedCache();
} catch (e) {
  // safe fallback
}

