import { WordEntry } from '../models/word';
import { simplifyFormalEnglish, cleanDictionaryDefinition } from '../utils/simplificationEngine';

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

  async callGeminiApi(prompt: string, temperature: number = 0.7, maxTokens: number = 3000): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    // Use models available on current Gemini API key, ordered by availability and reliability
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens
              }
            })
          }
        );

        if (response.ok) {
          const data: GeminiApiResponse = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return rawText;
          }
        } else if (response.status === 429 || response.status === 404 || response.status === 503) {
          console.warn(`Gemini model ${model} status ${response.status}, trying fallback...`);
          continue;
        }
      } catch (err) {
        console.warn(`Gemini model ${model} fetch failed:`, err);
      }
    }

    return null;
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
      const prompt = `You are an expert 5th-grade ELI5 educator and master lexicographer for the Lexora dictionary app.
Word: "${entry.word}"
Part of Speech: "${pos}"
Original Dictionary Definition: "${primaryDef}"
${synList ? `Target Synonyms to Explain: ${synList}` : ''}

Task: Generate a rich, natural 5th-grade ELI5 plain English breakdown for "${entry.word}".
CRITICAL RULES FOR "simple" & "thinkOfItAs":
1. "simple": Write a 1-2 sentence plain English breakdown of what "${entry.word}" means in real life.
   - DO NOT copy, quote, or mirror the original dictionary wording.
   - Use simple words a 10-year-old child easily understands.
   - Break down complex terms into practical concepts (e.g. for "rhetoric", explain that it is the skill of picking words cleverly to convince people to agree with you).
   - NEVER use the word "${entry.word}" in its own explanation.
2. "thinkOfItAs": Write an ACTIVE, VIVID real-world scene or analogy starting with "Picture..." or "Imagine...".
3. "commonUseExample": Write a practical situational scenario or quote showing how people actually use the word in real life.
4. "examples": Provide 3 PRACTICAL, REAL-WORLD context sentences (Everyday, Work, Academic).

CRITICAL RULES FOR SYNONYMS:
- Provide 3 to 5 relevant synonyms.
- For EACH synonym:
  - "simpleDefinition": Write a short 1-sentence 5th-grade ELI5 explanation of what that synonym means without self-referential terms.
  - "distinction": Write a VERY SHORT, SIMPLE 5-10 word note directly connecting it to "${entry.word}".

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "dictionaryDefinition": "Formal standard dictionary definition",
  "simple": "A clear, non-self-referential 5th-grade ELI5 explanation that breaks down the concept into everyday words",
  "thinkOfItAs": "An active visual picture or action phrase starting with Picture or Imagine",
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

      const rawText = await this.callGeminiApi(prompt, 0.7, 3000);
      if (rawText) {
        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed: AIErichedWordDetails & { dictionaryDefinition?: string; examples?: WordEntry['examples'] } = JSON.parse(cleanedText);

        if (parsed.dictionaryDefinition && (!entry.definitions[0]?.dictionary || entry.definitions[0].dictionary.startsWith('An English vocabulary term referring to'))) {
          entry.definitions[0] = {
            ...entry.definitions[0],
            dictionary: parsed.dictionaryDefinition
          };
        }

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
    } catch (err) {
      console.warn('Gemini API word enrichment failed, keeping default entry', err);
    }

    return entry;
  },

  // 1b. Full Word Entry AI Generation (Used when external dictionary APIs fail)
  async generateFullWordWithAI(word: string): Promise<WordEntry | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanWord = word.trim().toLowerCase();
    try {
      const prompt = `You are an authoritative master lexicographer for the Lexora dictionary app.
Provide a complete, authentic dictionary entry for the English word or phrase: "${cleanWord}".

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "partOfSpeech": ["noun"],
  "dictionaryDefinition": "Formal authoritative 1-sentence dictionary definition of ${cleanWord}.",
  "simple": "A clear, 5th-grade plain English explanation of what it means in real life. DO NOT copy the dictionary definition.",
  "thinkOfItAs": "A vivid real-life action phrase starting with Picture or Imagine representing ${cleanWord}.",
  "ipa": "/ˈ${cleanWord}/",
  "phonetic": "phonetic respelling",
  "usageExplanation": "\"${cleanWord}\" functions as a ...",
  "commonUseExample": "Authentic situational quote or sentence showing ${cleanWord}.",
  "examples": [
    { "context": "Everyday", "sentence": "Real-life sentence showing real people." },
    { "context": "Work", "sentence": "Real workplace sentence showing real people at work." },
    { "context": "Academic", "sentence": "Real academic/formal sentence." }
  ],
  "whenToUse": ["When to use bullet 1", "When to use bullet 2"],
  "whenNotToUse": ["When not to use bullet 1", "When not to use bullet 2"],
  "memoryTip": "A memorable 1-sentence mnemonic anchor",
  "synonyms": [
    {
      "word": "synonym word",
      "simpleDefinition": "Plain English definition of synonym",
      "distinction": "5-10 word note comparing directly to ${cleanWord}"
    }
  ]
}`;

      const rawText = await this.callGeminiApi(prompt, 0.6, 3000);
      if (rawText) {
        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        const posList = (parsed.partOfSpeech || ['noun']).map((p: string) => p.toLowerCase());
        const primaryDef = parsed.dictionaryDefinition || `Definition of ${cleanWord}.`;

        return {
          id: cleanWord,
          word: cleanWord,
          partOfSpeech: posList,
          definitions: [
            {
              dictionary: primaryDef,
              simple: parsed.simple || `${cleanWord} in plain terms.`,
              thinkOfItAs: parsed.thinkOfItAs || `Picture ${cleanWord} in real life.`
            }
          ],
          pronunciation: {
            british: { ipa: parsed.ipa || `/ˈ${cleanWord}/`, phonetic: parsed.phonetic || cleanWord },
            american: { ipa: parsed.ipa || `/ˈ${cleanWord}/`, phonetic: parsed.phonetic || cleanWord }
          },
          usage: {
            isVerb: posList.includes('verb'),
            explanation: parsed.usageExplanation || `"${cleanWord}" is used as a ${posList.join('/')}.`
          },
          examples: parsed.examples || [
            { context: 'Everyday', sentence: `She used the word "${cleanWord}" in a normal conversation.` },
            { context: 'Work', sentence: `The team applied "${cleanWord}" to their current project.` },
            { context: 'Academic', sentence: `Scholars have analyzed the significance of "${cleanWord}".` }
          ],
          whenToUse: parsed.whenToUse || [`When discussing ${cleanWord}`],
          whenNotToUse: parsed.whenNotToUse || [`Do not use when speaking about unrelated matters`],
          commonPhrases: [`Understanding ${cleanWord}`, `A key example of ${cleanWord}`],
          synonyms: parsed.synonyms || [],
          commonUseExample: parsed.commonUseExample,
          memoryTip: parsed.memoryTip || `Remember: ${cleanWord.toUpperCase()} starts with '${cleanWord.charAt(0).toUpperCase()}'.`,
          practiceQuestions: [
            {
              id: `${cleanWord}-q1`,
              wordId: cleanWord,
              type: 'multiple-choice',
              question: `What is the meaning of "${cleanWord}"?`,
              options: [primaryDef, 'An unrelated musical term', 'A mathematical constant'],
              correctAnswerIndex: 0,
              explanation: `"${cleanWord}" means: ${primaryDef}`
            }
          ]
        };
      }
    } catch (err) {
      console.warn('Gemini full word generation error', err);
    }
    return null;
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
1. "simple": Write a direct, clear 5th-grade ELI5 explanation of what "${word}" means or does in real life. Use ONLY simple, everyday words that a 10-year-old child easily understands. DO NOT use strong, difficult, academic, or formal vocabulary (e.g. NEVER use words like "discordant", "dissonance", "manifestation", "predisposition", etc. — translate them into plain English like "harsh clashing noise", "sign", "natural tendency"). NEVER copy the dictionary wording. NEVER explain "${word}" using its root word or self-referential terms. DO NOT use generic boilerplate like 'It describes a real-life state' or 'At its heart'.
2. "thinkOfItAs": Write an ACTIVE, VIVID real-world scene or analogy starting with "Picture..." or "Imagine...". NEVER say 'Observing X in real life'.

Return ONLY valid JSON:
{"simple": "...", "thinkOfItAs": "..."}`;

        const rawText = await this.callGeminiApi(prompt, 0.95, 1500);
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
      } catch (err) {
        console.warn('Gemini API spin generation failed, falling back to multi-angle generator', err);
      }
    }

    return this.generateDynamicLocalVariant(word, definition, partOfSpeech);
  },

  // 3. Dynamic Local Multi-Angle Generator (Fallback when API key is missing or offline)
  generateDynamicLocalVariant(word: string, def: string, pos: string): LaymanRegenerationResult {
    const cleanWord = word.toLowerCase();

    // Specific handcrafted ELI5 overrides
    if (cleanWord === 'cacophony') {
      return {
        simple: 'Cacophony means a loud, messy clash of harsh noises happening all at once, like car horns, construction drills, and shouting on a crowded street.',
        thinkOfItAs: 'Picture being trapped in a traffic jam where car horns blare, jackhammers pound the pavement, and sirens scream all at once.'
      };
    } else if (cleanWord === 'seldom') {
      return {
        simple: 'Seldom means almost never, or not very often. If you seldom do something, it happens only once in a long while.',
        thinkOfItAs: 'Think of how often it snows in a hot desert — it almost never happens.'
      };
    } else if (cleanWord === 'ephemeral') {
      return {
        simple: 'Ephemeral describes something that exists for only a brief moment before fading away, like a rainbow or a shooting star.',
        thinkOfItAs: 'Watching a shimmering soap bubble float across the yard for two seconds before popping into thin air.'
      };
    } else if (cleanWord === 'resilient') {
      return {
        simple: 'Resilient describes someone or something that can stay strong and bounce back quickly after going through hard times.',
        thinkOfItAs: 'A rubber ball bouncing right back up into your hands no matter how hard it hits the pavement.'
      };
    } else if (cleanWord === 'ubiquitous') {
      return {
        simple: 'Ubiquitous describes something that seems to be everywhere at the same time, so you see it wherever you look.',
        thinkOfItAs: 'Like smartphones on a crowded morning train — almost everywhere you look, someone is holding one.'
      };
    } else if (cleanWord === 'pragmatic') {
      return {
        simple: 'Pragmatic describes a mindset focused on real solutions that actually work in everyday life, rather than ideal theories.',
        thinkOfItAs: 'Wearing comfortable sneakers for a 10-mile walk instead of stylish dress shoes that give you blisters.'
      };
    } else if (cleanWord === 'serendipity') {
      return {
        simple: 'Serendipity means finding good or pleasant things by lucky accident, when you were not even looking for them.',
        thinkOfItAs: 'Reaching into an old winter coat pocket for a tissue and unexpectedly pulling out a 50-dollar bill you forgot you had.'
      };
    }

    let cleanDef = cleanDictionaryDefinition(def, word);

    // Strip self-referential terms (e.g., parsimonious -> parsimony)
    if (cleanWord.startsWith('parsimon') && cleanDef.toLowerCase().includes('parsimony')) {
      cleanDef = 'extremely unwilling to spend money, use resources, or share';
    } else if (cleanWord === 'gourmand' && cleanDef.toLowerCase().includes('gourmand')) {
      cleanDef = 'a person who deeply loves eating good food and enjoys rich meals';
    }

    let simplified = simplifyFormalEnglish(cleanDef);
    simplified = simplified.charAt(0).toLowerCase() + simplified.slice(1);
    const capWord = word.charAt(0).toUpperCase() + word.slice(1);

    const lowerDef = cleanDef.toLowerCase();
    let think = `Imagine a real-life situation where ${simplified} comes into play and everyone notices.`;

    if (lowerDef.includes('persuad') || lowerDef.includes('influence') || lowerDef.includes('rhetoric') || lowerDef.includes('debate') || lowerDef.includes('convince') || lowerDef.includes('argument')) {
      think = `Picture a speaker choosing their words so cleverly that a room full of doubtful listeners nods in agreement.`;
    } else if (lowerDef.includes('sound') || lowerDef.includes('noise') || lowerDef.includes('voice') || lowerDef.includes('clash') || lowerDef.includes('loud') || lowerDef.includes('dissonan')) {
      think = `Picture being in a noisy space where loud, clashing sounds overpower everything else.`;
    } else if (lowerDef.includes('time') || lowerDef.includes('brief') || lowerDef.includes('short') || lowerDef.includes('moment')) {
      think = `A quick flash of lightning on a dark night — here for a split second, then gone.`;
    } else if (lowerDef.includes('careful') || lowerDef.includes('detail') || lowerDef.includes('precise')) {
      think = `Inspecting every seam of a project under a bright lamp so not a single mistake slips through.`;
    } else if (lowerDef.includes('strong') || lowerDef.includes('power') || lowerDef.includes('tough') || lowerDef.includes('recover')) {
      think = `A sturdy palm tree bending almost flat against hurricane winds, then standing right back up once the storm clears.`;
    }

    if (pos === 'verb') {
      const stripped = simplified.replace(/^to\s+/i, '');
      return {
        simple: `To ${word} means to ${stripped}.`,
        thinkOfItAs: think || `Imagine taking a deliberate step to ${stripped} right when it counts.`
      };
    } else if (pos === 'noun') {
      let simpleText: string;
      if (simplified.startsWith('the skill of ') || simplified.startsWith('the process of ') || simplified.startsWith('the feeling of ')) {
        simpleText = `${capWord} is ${simplified}. In everyday life, it is all about how this is practiced or experienced.`;
      } else if (simplified.startsWith('someone who ') || simplified.startsWith('a person who ')) {
        simpleText = `A ${word} is ${simplified.replace(/^a person who /i, 'someone who ')}.`;
      } else if (simplified.startsWith('a tool used to ') || simplified.startsWith('a device used to ')) {
        simpleText = `A ${word} is ${simplified}.`;
      } else if (simplified.startsWith('a ') || simplified.startsWith('an ') || simplified.startsWith('the ')) {
        simpleText = `In simple English, ${word} is ${simplified}.`;
      } else {
        simpleText = `${capWord} refers to ${simplified}.`;
      }

      return {
        simple: simpleText,
        thinkOfItAs: think
      };
    } else if (pos === 'adjective') {
      const stripped = simplified.replace(/^(being|having|characterized by|marked by|known for)\s+/i, '');
      return {
        simple: `When something or someone is ${word}, they are ${stripped}.`,
        thinkOfItAs: think || `Imagine encountering something that is completely ${stripped}.`
      };
    }

    return {
      simple: `${capWord} means ${simplified}.`,
      thinkOfItAs: think
    };
  }
};
