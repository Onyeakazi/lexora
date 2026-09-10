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
      const prompt = `You are the master AI lexicographer for Lexora dictionary.
Word: "${entry.word}"
Part of Speech: "${pos}"
Original Definition: "${primaryDef}"
${synList ? `Target Synonyms to Explain: ${synList}` : ''}

Task: Generate a rich 5th-grade plain English breakdown for "${entry.word}" and its synonyms.
CRITICAL INSTRUCTIONS FOR SYNONYMS:
- Provide 3 to 5 relevant synonyms.
- For EACH synonym:
  - "simpleDefinition": Write a clear 1-sentence 5th-grade plain English explanation of what that synonym means. DO NOT use generic phrases like "Refers to X in plain English".
  - "distinction": Write a specific 1-sentence explanation of how that synonym differs in tone, intensity, or context from "${entry.word}". DO NOT use generic formulas like "emphasizes X characteristics".

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "simple": "A clear, 5th-grade ELI5 explanation without formal dictionary jargon",
  "thinkOfItAs": "A vivid, intuitive real-life visual picture or metaphor",
  "commonUseExample": "An authentic situational sentence connecting a real scenario to the word in quote marks (e.g. 'Someone obsessed with reading disaster news has a \"morbid fascination\".')",
  "whenToUse": ["Clear bullet point on when to use this word", "Second clear situation to use"],
  "whenNotToUse": ["Clear caution bullet point on when NOT to use", "Common confusion to avoid"],
  "memoryTip": "A memorable 1-sentence mnemonic anchor",
  "synonyms": [
    {
      "word": "synonym word name",
      "simpleDefinition": "Specific plain English explanation of what this synonym means",
      "distinction": "Specific difference in nuance, intensity, or tone compared to ${entry.word}"
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (response.ok) {
        const data: GeminiApiResponse = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed: AIErichedWordDetails = JSON.parse(cleanedText);

          if (parsed.simple) {
            entry.definitions[0] = {
              ...entry.definitions[0],
              simple: parsed.simple,
              thinkOfItAs: parsed.thinkOfItAs || entry.definitions[0]?.thinkOfItAs
            };
          }
          if (parsed.commonUseExample) entry.commonUseExample = parsed.commonUseExample;
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
        const prompt = `You are an expert ELI5 (Explain Like I'm 5) educator for the Lexora dictionary app.
Word: "${word}"
Part of Speech: "${partOfSpeech}"
Original Definition: "${definition}"

Task: Generate a BRAND NEW, FRESH, and UNIQUE layman explanation in 5th-grade plain English, along with a vivid real-life visual analogy ("Think of it as...").
Rules:
- DO NOT reuse formal dictionary jargon.
- Make it totally distinct, engaging, and easy for a beginner to grasp.
- Return ONLY valid JSON in this exact structure without markdown backticks:
{"simple": "...", "thinkOfItAs": "..."}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.95,
                maxOutputTokens: 300
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
    const cleanDef = def
      .replace(/^\s*\([^)]*\)\s*/g, '')
      .replace(/^(Relating to|Characterized by|The quality of|The act of|Having the nature of)\s+/i, '')
      .replace(/\.$/, '')
      .trim();

    const angles: LaymanRegenerationResult[] = [
      {
        simple: `Think of "${word}" as describing something that is completely focused on ${cleanDef.toLowerCase()}. In simple terms, when you see this happen, it means ${cleanDef.toLowerCase()} without extra complication.`,
        thinkOfItAs: `Picture a high-definition zoom lens pointing straight at ${cleanDef.toLowerCase()} — isolating this exact trait from everything else.`
      },
      {
        simple: `If you were explaining "${word}" to a 5th grader: it is a ${pos} used when something or someone exhibits ${cleanDef.toLowerCase()}.`,
        thinkOfItAs: `Think of a bright yellow highlighter marking "${cleanDef.toLowerCase()}" in a book so it jumps off the page.`
      },
      {
        simple: `In plain everyday English, using "${word}" is the quickest way to describe ${cleanDef.toLowerCase()} without needing long formal explanations.`,
        thinkOfItAs: `Picture a light switch clicking on in a dark room — instantly connecting "${word}" with ${cleanDef.toLowerCase()}.`
      },
      {
        simple: `At its heart, "${word}" captures the exact feeling or situation of ${cleanDef.toLowerCase()} in a single clear word.`,
        thinkOfItAs: `Imagine how a cartoon scene would demonstrate ${cleanDef.toLowerCase()} in 3 seconds flat with zero spoken words.`
      },
      {
        simple: `When people use "${word}", they are pointing out an instance of ${cleanDef.toLowerCase()} in action.`,
        thinkOfItAs: `Think of taking the shortcut path through the park — direct, clear, and focused on ${cleanDef.toLowerCase()}.`
      }
    ];

    const randomIndex = Math.floor(Math.random() * angles.length);
    return angles[randomIndex];
  }
};
