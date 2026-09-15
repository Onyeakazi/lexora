import { WordEntry } from '../models/word';

interface GeminiResponsePart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiResponsePart[];
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

export interface LaymanRegenerationResult {
  simple: string;
  thinkOfItAs: string;
}

export interface AISynonymItem {
  word: string;
  simpleDefinition: string;
  distinction?: string;
}

export interface AIErichedWordDetails {
  simple: string;
  thinkOfItAs: string;
  commonUseExample: string;
  whenToUse: string[];
  whenNotToUse: string[];
  memoryTip?: string;
  synonyms?: AISynonymItem[];
}

export const aiService = {
  getApiKey(): string {
    return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  },

  isAIEnabled(): boolean {
    return this.getApiKey().length > 0;
  },

  // 1. Full Word Entry AI Enrichment (Used automatically when searching any word across Lexora)
  async enrichWordEntryWithAI(entry: WordEntry): Promise<WordEntry> {
    const apiKey = this.getApiKey();
    if (!apiKey) return entry;

    const primaryDef = entry.definitions[0]?.dictionary || `The word ${entry.word}`;
    const pos = entry.partOfSpeech.join(', ') || 'word';
    const synList = entry.synonyms && entry.synonyms.length > 0 
      ? entry.synonyms.map(s => s.word).join(', ') 
      : '';

    try {
      const prompt = `You are the master ELI5 AI lexicographer for Lexora dictionary.
Word: "${entry.word}"
Part of Speech: "${pos}"
Original Definition: "${primaryDef}"
${synList ? `Target Synonyms to Explain: ${synList}` : ''}

Task: Generate a rich, natural 5th-grade ELI5 plain English breakdown for "${entry.word}" and its synonyms.
CRITICAL RULES FOR DEFINITION & EXAMPLES:
1. "simple": Write a direct, conversational 5th-grade ELI5 explanation of what "${entry.word}" means and does in real life. NEVER explain a word using its root word or self-referential term (e.g. NEVER use 'parsimony' when explaining 'parsimonious', NEVER use '${entry.word}' in its own definition). Use plain, clear English (e.g. 'extremely unwilling to spend money, use resources, or share'). DO NOT use meta templates like 'At its heart' or 'Think of X as'.
2. "thinkOfItAs": Write an ACTIVE real-life action phrase or vivid scenario describing what experiencing or doing this feels like (e.g., 'Watching someone carefully split a dinner bill down to the exact penny to avoid paying an extra dime'). Start with an active verb or vivid action phrase!
3. "commonUseExample": Write a practical situational scenario or quoted dialogue showing how people actually use or experience the word (e.g., '\'I can\'t take the elevator, let\'s use the stairs.\' — Someone managing claustrophobia in a building.').
4. "examples": Provide 3 PRACTICAL, REAL-WORLD context sentences (Everyday, Work, Academic). Show real people in real situations. DO NOT write generic templates like 'He took the stairs because...' or 'Understanding the concept of...'.

CRITICAL RULES FOR SYNONYMS:
- Provide 3 to 5 relevant synonyms.
- For EACH synonym:
  - "simpleDefinition": Write a short 1-sentence 5th-grade ELI5 explanation of what that synonym means without self-referential terms.
  - "distinction": Write a VERY SHORT, SIMPLE 5-10 word note directly connecting it to "${entry.word}" (e.g. 'More scary and creepy than ${entry.word}', 'Focuses on hurting feelings, unlike ${entry.word}', or 'Broader than ${entry.word}').

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "simple": "A clear, non-self-referential 5th-grade ELI5 explanation",
  "thinkOfItAs": "An active visual picture or action phrase",
  "commonUseExample": "An authentic situational sentence or quote",
  "examples": [
    { "context": "Everyday", "sentence": "Practical real-life sentence showing real people in action." },
    { "context": "Work", "sentence": "Practical workplace sentence showing real people at work." },
    { "context": "Academic", "sentence": "Practical formal/study sentence showing real research or study." }
  ],
  "whenToUse": ["Clear bullet point on when to use this word", "Second clear situation to use"],
  "whenNotToUse": ["Clear caution bullet point on when NOT to use", "Common confusion to avoid"],
  "memoryTip": "A memorable 1-sentence mnemonic anchor",
  "synonyms": [
    {
      "word": "synonym word name",
      "simpleDefinition": "Short 5th-grade definition of this synonym",
      "distinction": "Short simple 5-10 word note comparing directly to ${entry.word}"
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3500
            }
          })
        }
      );

      if (response.ok) {
        const data: GeminiApiResponse = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed: AIErichedWordDetails & { examples?: WordEntry['examples'] } = JSON.parse(cleanedText);

          if (parsed.simple) {
            entry.definitions[0] = {
              ...entry.definitions[0],
              simple: parsed.simple,
              thinkOfItAs: parsed.thinkOfItAs || entry.definitions[0]?.thinkOfItAs
            };
          }
          if (parsed.commonUseExample) entry.commonUseExample = parsed.commonUseExample;
          if (parsed.examples && Array.isArray(parsed.examples) && parsed.examples.length > 0) {
            entry.examples = parsed.examples;
          }
          if (parsed.whenToUse && parsed.whenToUse.length > 0) entry.whenToUse = parsed.whenToUse;
          if (parsed.whenNotToUse && parsed.whenNotToUse.length > 0) entry.whenNotToUse = parsed.whenNotToUse;
          if (parsed.memoryTip) entry.memoryTip = parsed.memoryTip;
          if (parsed.synonyms && Array.isArray(parsed.synonyms) && parsed.synonyms.length > 0) {
            entry.synonyms = parsed.synonyms.map(syn => ({
              word: syn.word,
              simpleDefinition: syn.simpleDefinition,
              distinction: syn.distinction
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API word enrichment failed, keeping default entry', err);
    }

    return entry;
  },

  // 2. Layman Spin Generator (Used by the Spin AI Explanation button in Word Details)
  async generateLaymanExplanation(
    word: string,
    definition: string,
    partOfSpeech: string
  ): Promise<LaymanRegenerationResult> {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are an expert ELI5 educator for the Lexora dictionary app.
Word: "${word}"
Part of Speech: "${partOfSpeech}"
Original Definition: "${definition}"

Task: Generate a BRAND NEW, FRESH, and PRACTICAL layman breakdown for "${word}".
Requirements:
1. "simple": Write a direct, clear 5th-grade ELI5 explanation of what "${word}" means or does in real life. NEVER explain "${word}" using its root word or self-referential terms. DO NOT use generic meta phrases like 'Think of X as' or 'At its heart'.
2. "thinkOfItAs": Write an ACTIVE real-world action phrase or vivid scene (e.g., 'talking to yourself out loud so everyone knows your inner thoughts' or 'watching someone calculate a tip down to the penny'). Start with an active verb or vivid action phrase!

Return ONLY valid JSON:
{"simple": "...", "thinkOfItAs": "..."}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.95,
                maxOutputTokens: 1500
              }
            })
          }
        );

        if (response.ok) {
          const data: GeminiApiResponse = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedText);
            if (parsed.simple && parsed.thinkOfItAs) {
              return {
                simple: parsed.simple,
                thinkOfItAs: parsed.thinkOfItAs
              };
            }
          }
        }
      } catch (err) {
        console.warn('Gemini API spin generation failed, falling back to multi-angle generator', err);
      }
    }

    return this.generateDynamicLocalVariant(word, definition, partOfSpeech);
  },

  // 3. Dynamic Local Multi-Angle Generator (Fallback when API key is missing or offline)
  generateDynamicLocalVariant(word: string, def: string, pos: string): LaymanRegenerationResult {
    let cleanDef = def
      .replace(/^\s*\([^)]*\)\s*/g, '')
      .replace(/^(Relating to|Characterized by|The quality of|The act of|Having the nature of|State of being|Used to describe|In a manner that is|An abnormal fear of|A fear of|Extremely|Being|Exhibiting)\s+/i, '')
      .replace(/\.$/, '')
      .trim();

    const cleanWord = word.toLowerCase();

    // Sanitize self-referential terms (e.g., parsimonious -> parsimony)
    if (cleanWord.startsWith('parsimon') && cleanDef.toLowerCase().includes('parsimony')) {
      cleanDef = cleanDef.replace(/exhibiting parsimony;?\s*/i, '').replace(/parsimony;?\s*/i, '');
      if (!cleanDef) cleanDef = 'extremely unwilling to spend money, use resources, or share';
    } else if (cleanWord === 'gourmand' && cleanDef.toLowerCase().includes('gourmand')) {
      cleanDef = 'a person who deeply loves eating good food and enjoys rich meals';
    } else if (cleanDef.includes(';')) {
      // Pick non-circular clause if first clause contains root word
      const clauses = cleanDef.split(';').map(c => c.trim()).filter(Boolean);
      const rootPrefix = cleanWord.length > 4 ? cleanWord.slice(0, 4) : cleanWord;
      const nonCircular = clauses.find(c => !c.toLowerCase().includes(rootPrefix));
      if (nonCircular) cleanDef = nonCircular;
    }

    cleanDef = cleanDef.charAt(0).toLowerCase() + cleanDef.slice(1);
    const capWord = word.charAt(0).toUpperCase() + word.slice(1);

    if (pos === 'verb') {
      return {
        simple: `To ${word} means to ${cleanDef}. It describes taking direct action in a situation.`,
        thinkOfItAs: `Taking a deliberate step to ${cleanDef} right when it counts.`
      };
    } else if (pos === 'noun') {
      return {
        simple: `${capWord} refers to ${cleanDef}. It describes a real-life state, person, or condition.`,
        thinkOfItAs: `Observing ${cleanDef} in a real situation.`
      };
    } else if (pos === 'adjective') {
      return {
        simple: `${capWord} describes someone or something that is ${cleanDef}.`,
        thinkOfItAs: `Watching someone or something being ${cleanDef} in action.`
      };
    }

    return {
      simple: `In plain English, "${word}" means ${cleanDef}.`,
      thinkOfItAs: `Noticing ${cleanDef} happening in real life.`
    };
  }
};
