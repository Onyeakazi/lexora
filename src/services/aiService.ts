import { storageService } from './storageService';
import { UserSettings } from '../models/user';

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

// Fallback pool of high-entropy creative layman analogies when API key is unavailable or offline
const CREATIVE_ANALOGY_TEMPLATES: Record<string, LaymanRegenerationResult[]> = {
  default: [
    {
      simple: 'Imagine explaining this to a 10-year-old: it describes a specific action, object, or feeling that stands out clearly whenever it happens.',
      thinkOfItAs: 'Spotlight turning on in a dark room — suddenly making everything clear.'
    },
    {
      simple: 'In plain everyday talk, this means getting right to the point without any complicated rules or fancy jargon.',
      thinkOfItAs: 'Taking the shortcut path through the park instead of the long paved road.'
    },
    {
      simple: 'Think of this as a core building block in conversation: it gives a clear label to something you see or do every single day.',
      thinkOfItAs: 'A bright label stuck on a jar so you know exactly what is inside.'
    }
  ]
};

export const aiService = {
  getApiKey(): string {
    const settings = storageService.get<UserSettings>('lexora_user_settings', {} as UserSettings);
    return settings.geminiApiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
  },

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
- Make it totally distinct and easy for a beginner to grasp.
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
                temperature: 0.95, // High creativity for diverse spins
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
        console.warn('Gemini API spin generation failed or offline, falling back to local generator', err);
      }
    }

    // Creative dynamic local generator (ensures the spin button ALWAYS works)
    return this.generateDynamicLocalVariant(word, definition, partOfSpeech);
  },

  generateDynamicLocalVariant(word: string, def: string, pos: string): LaymanRegenerationResult {
    const cleanWord = word.toLowerCase();
    const cleanDef = def.replace(/^(Relating to|Characterized by|The quality of|The act of)\s+/i, '').replace(/\.$/, '');

    const defaults = CREATIVE_ANALOGY_TEMPLATES['default'] || [];
    const templateMatch = defaults[Math.floor(Math.random() * defaults.length)];

    const visualMetaphors = [
      `Think of ${cleanWord} (${pos}) like a high-definition zoom lens — highlighting "${cleanDef}" in vivid detail.`,
      `Picture a real-life scene where someone is actively experiencing ${cleanWord} — prioritizing real results over talk.`,
      `Imagine how a cartoon character would demonstrate ${cleanWord} in 3 seconds flat.`,
      `Think of a light switch turning on — instantly connecting ${cleanWord} to "${cleanDef}".`,
      templateMatch ? templateMatch.thinkOfItAs : `Picture a clear real-life scene representing ${cleanWord}.`
    ];

    const simplePhrasings = [
      `Put simply, ${word} functions as a ${pos} referring to ${cleanDef.toLowerCase()} without any added fuss.`,
      `In plain 5th-grade English, when you encounter ${word}, think directly of ${cleanDef.toLowerCase()}.`,
      `At its core, ${word} describes the exact moment or quality of being ${cleanDef.toLowerCase()}.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} means breaking down ${cleanDef.toLowerCase()} into terms anyone can relate to.`,
      templateMatch ? templateMatch.simple : `${word} refers to ${cleanDef}.`
    ];

    const randomMetaphor = visualMetaphors[Math.floor(Math.random() * visualMetaphors.length)];
    const randomSimple = simplePhrasings[Math.floor(Math.random() * simplePhrasings.length)];

    return {
      simple: randomSimple,
      thinkOfItAs: randomMetaphor
    };
  }
};
