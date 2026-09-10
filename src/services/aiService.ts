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

export const aiService = {
  getApiKey(): string {
    return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
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

    // Creative dynamic multi-angle fallback generator
    return this.generateDynamicLocalVariant(word, definition, partOfSpeech);
  },

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
