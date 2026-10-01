/**
 * Generic Plain-English Simplification Engine
 * Deconstructs formal, academic dictionary definitions into 5th-grade ELI5 conversational English.
 */

export const DICTIONARY_PHRASE_SIMPLIFICATIONS: [RegExp, string][] = [
  // 1. Starter formulas and category headers
  [/^(the\s+)?(art|craft|practice|science|study|discipline)\s+of\s+/i, 'the skill of '],
  [/^(the\s+)?(act|action|process|practice|operation|habit)\s+of\s+/i, 'the process of '],
  [/^(the\s+)?(quality|state|condition)\s+of\s+(being\s+)?/i, 'being '],
  [/^(the\s+)?(ability|capacity|power)\s+to\s+/i, 'being able to '],
  [/^(a\s+|an\s+|the\s+)?(person|individual|someone|one)\s+(who|that)\s+/i, 'someone who '],
  [/^(a\s+|an\s+|the\s+)?(device|tool|instrument|machine|object)\s+(used\s+(for|to)|that)\s+/i, 'a tool used to '],
  [/^(characterized\s+by|marked\s+by|distinguished\s+by|exhibiting|showing)\s+/i, 'known for '],
  [/^(relating\s+to|pertaining\s+to|associated\s+with|having\s+to\s+do\s+with|concerned\s+with)\s+/i, 'having to do with '],
  [/^(used\s+to\s+describe|denoting|designating|signifying)\s+/i, 'describes '],
  [/^(in\s+a\s+manner\s+that\s+is|in\s+a\s+way\s+that\s+is)\s+/i, 'in a way that is '],
  [/^(an?\s+abnormal\s+fear\s+of|an?\s+extreme\s+fear\s+of)\s+/i, 'an extreme, irrational fear of '],

  // 2. High-register clauses and prepositional phrases
  [/\bas a means to\b/gi, 'in order to'],
  [/\bpublic speaking\b/gi, 'speaking in front of an audience or crowd'],
  [/\bfor the purpose of\b/gi, 'to'],
  [/\bwith the intention of\b/gi, 'aiming to'],
  [/\bwith the aim of\b/gi, 'hoping to'],
  [/\bcapable of being\b/gi, 'can be'],
  [/\bcapable of\b/gi, 'able to'],
  [/\bsusceptible to\b/gi, 'easily affected or harmed by'],
  [/\bin accordance with\b/gi, 'following'],
  [/\bin the nature of\b/gi, 'like'],
  [/\ba large number of\b/gi, 'a huge amount of'],
  [/\ba lack of\b/gi, 'not having enough'],
  [/\bto a great degree\b/gi, 'very much'],
  [/\bgive rise to\b/gi, 'lead to or cause'],
  [/\btake place\b/gi, 'happen'],
  [/\bprior to\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
  [/\bin order to\b/gi, 'to'],
  [/\bin an effort to\b/gi, 'trying to'],
  [/\bwith respect to\b/gi, 'about'],
  [/\bby virtue of\b/gi, 'because of'],
  [/\bin spite of\b/gi, 'even though'],
  [/\bwithout regard to\b/gi, 'ignoring'],
  [/\bto be found\b/gi, 'to be seen'],
  [/\bto the exclusion of\b/gi, 'leaving out'],
  [/\bhaving a tendency to\b/gi, 'tending to'],
  [/\bdesigned to\b/gi, 'made to'],
  [/\bto make something less ([a-z]+)\b/gi, 'to soften or reduce how $1 something is'],
  [/\bless severe\b/gi, 'less harsh and easier to handle'],
  [/\bwithout fear\b/gi, 'fearlessly'],
  [/\bin a ([a-z]+) and ([a-z]+) manner\b/gi, 'in a $1 and $2 way'],
  [/\bin an? ([a-z]+) manner\b/gi, 'in an $1 way']
];

export const FORMAL_TO_SIMPLE_MAP: Record<string, string> = {
  // Speech, Persuasion & Communication
  'persuade': 'convince people to agree',
  'persuading': 'convincing people to agree',
  'persuasion': 'convincing people to agree',
  'persuasive': 'convincing and believable',
  'influence': 'sway how others think',
  'influencing': 'swaying how others think',
  'convey': 'share',
  'conveying': 'sharing',
  'articulate': 'express clearly',
  'articulating': 'expressing clearly',
  'eloquent': 'fluent, persuasive, and moving',
  'eloquence': 'expressive and persuasive speaking',
  'oratory': 'public speaking',
  'orator': 'skilled public speaker',
  'discourse': 'conversation or discussion',
  'rhetorical': 'designed to persuade or impress',

  // Sound & Acoustics
  'discordant': 'harsh and clashing',
  'dissonance': 'harsh, clashing sounds',
  'dissonant': 'harsh and clashing',
  'cacophonous': 'noisy and harsh',
  'cacophony': 'loud, harsh clash of noises',
  'acoustics': 'sound quality',
  'acoustic': 'sound',
  'clamor': 'loud, confusing noise',
  'strident': 'harsh and grating',

  // Actions & Verbs
  'manipulate': 'unfairly control',
  'manipulating': 'unfairly controlling',
  'manipulation': 'unfair control',
  'deception': 'tricking people',
  'deceitful': 'dishonest',
  'coercion': 'forcing someone against their will',
  'coerce': 'force someone against their will',
  'ameliorate': 'make better',
  'mitigate': 'lessen the harm of',
  'alleviate': 'ease or relieve',
  'exacerbate': 'make much worse',
  'diminish': 'lessen or shrink',
  'augment': 'increase or add to',
  'facilitate': 'help make easier',
  'utilize': 'use',
  'utilizing': 'using',
  'commence': 'start',
  'terminate': 'bring to an end',
  'endeavor': 'try hard',
  'persevere': 'keep pushing forward',
  'abstain': 'choose not to do something',
  'advocate': 'publicly speak up for',
  'advocating': 'publicly speaking up for',
  'impair': 'damage or weaken',
  'withstand': 'stay strong through',
  'quarrel': 'argue angrily',
  'quarreling': 'arguing angrily',
  'antagonize': 'provoke or annoy',
  'antagonizing': 'provoking or annoying',
  'hostile': 'unfriendly and aggressive',
  'hostility': 'anger and aggression',
  'severe': 'harsh or intense',
  'severity': 'harshness',

  // Qualities & Adjectives
  'incongruous': 'out of place',
  'incongruity': 'not fitting in',
  'phenomenon': 'event or occurrence',
  'unplanned': 'accidental',
  'unintended': 'not planned',
  'unsought': 'unexpected',
  'insightful': 'clever and perceptive',
  'recognition': 'noticing',
  'circumstance': 'situation',
  'circumstances': 'situations',
  'chivalric': 'old-fashioned hero-like',
  'idealistic': 'dreamy and unrealistic',
  'impractical': 'not realistic',
  'deliberately': 'on purpose',
  'deliberate': 'intentional',
  'malicious': 'mean-spirited',
  'misfortune': 'bad luck or trouble',
  'counterempathy': 'lack of sympathy',
  'superfluous': 'extra and unnecessary',
  'anachronistic': 'out of place in time',
  'proclivity': 'strong natural habit',
  'propensity': 'natural tendency',
  'predisposition': 'tendency',
  'tendency': 'habit',
  'disposition': 'natural personality or mood',
  'temperament': 'natural mood',
  'aberration': 'unusual difference',
  'anomalous': 'unusual',
  'anomaly': 'rare exception',
  'pernicious': 'very harmful',
  'esoteric': 'known to only a few people',
  'lucid': 'clear and easy to understand',
  'taciturn': 'quiet and rarely speaking',
  'loquacious': 'very talkative',
  'voracious': 'huge and greedy',
  'belligerent': 'hostile and ready to fight',
  'pugnacious': 'eager to fight',
  'benevolent': 'kind and caring',
  'malevolent': 'mean and hateful',
  'magnanimous': 'very generous and forgiving',
  'ostentatious': 'flashy and showing off',
  'precocious': 'advanced at a very young age',
  'recalcitrant': 'stubbornly refusing to obey',
  'epiphany': 'sudden "aha!" moment',
  'zenith': 'highest peak',
  'nadir': 'lowest point',
  'myriad': 'countless number of',
  'plethora': 'huge overload of',
  'scarcity': 'shortage',
  'frugal': 'careful with money',
  'affluent': 'wealthy',
  'indigent': 'very poor',
  'destitute': 'having nothing',
  'transient': 'lasting for only a short time',
  'transitory': 'lasting for only a brief period',
  'immutable': 'unchangeable',
  'malleable': 'easy to bend or shape',
  'tenacious': 'never giving up',
  'audacious': 'bold and daring',
  'trepidation': 'nervous fear',
  'apprehension': 'worry about what is coming',
  'indolent': 'lazy',
  'lethargic': 'sluggish and lacking energy',
  'vivacious': 'cheerful and lively',
  'euphoric': 'overjoyed',
  'morose': 'gloomy and grumpy',
  'sycophant': 'flatterer or kiss-up',
  'infrequently': 'not very often',
  'rarely': 'almost never',
  'frequently': 'very often or regularly',
  'evanescent': 'quick to vanish',
  'omnipresent': 'seen or found everywhere',
  'ubiquitous': 'found everywhere',
  'resilient': 'able to bounce back quickly',
  'reluctant': 'unwilling or hesitant',
  'versatile': 'flexible and good at many things',
  'inevitable': 'certain to happen no matter what',
  'hypothetical': 'imagined rather than real',
  'supposition': 'an educated guess',
  'conjecture': 'an opinion formed without full proof',
  'meticulous': 'extremely careful with small details',
  'diligent': 'hardworking and persistent',
  'pragmatic': 'focused on practical results',
  'scrutiny': 'close and critical inspection',
  'adversity': 'hard times or difficulty',
  'difficult conditions': 'hard situations',
  'pertaining to': 'about',
  'relating to': 'about',
  'characterized by': 'known for',
  'having the nature of': 'being like',
  'state of being': 'feeling of being',
  'used to describe': 'means',
  'in a manner that is': 'in a way that is',
  'precision': 'exactness',
  'fluency': 'smoothness',
  'hesitant': 'not sure',
  'adaptable': 'able to change easily',
  'unavoidable': 'cannot be stopped',
  'inspection': 'checking',
  'temporary': 'short-lived',
  'duration': 'length of time',
  'extent': 'how much',
  'manifest': 'show clearly',
  'magnitude': 'size',
  'paramount': 'top priority',
  'predominant': 'main',
  'prevalent': 'widespread and common',
  'comprehensive': 'complete and thorough',
  'arbitrary': 'random without a clear reason',
  'fundamental': 'basic and essential',
  'consequence': 'result',
  'consequences': 'results',
  'ambiguous': 'unclear with multiple meanings',
  'superficial': 'only on the surface',
  'substantial': 'large and meaningful',
  'monotonous': 'dull and repetitive',
  'indispensable': 'essential and impossible to do without',
  'trivial': 'small and not really important',
  'vulnerable': 'easy to hurt or attack',
  'prominent': 'well-known and easily noticed'
};

export function cleanDictionaryDefinition(def: string, word: string): string {
  if (!def) return '';

  const cleanWord = word.toLowerCase();

  let cleaned = def
    // Strip parenthetical guides like (grammar), (archaic), (formal)
    .replace(/^\s*\([^)]*\)\s*/g, '')
    // Strip trailing semicolon clauses if circular
    .replace(/;\s*also\s*:.*$/i, '')
    // Clean trailing periods and spaces
    .replace(/[\.\s]+$/, '');

  // Strip circular references e.g. "rhetoric: of or pertaining to rhetoric"
  if (cleaned.includes(';')) {
    const clauses = cleaned.split(';').map(c => c.trim()).filter(Boolean);
    const rootPrefix = cleanWord.length > 4 ? cleanWord.slice(0, 4) : cleanWord;
    const nonCircular = clauses.find(c => !c.toLowerCase().includes(rootPrefix));
    if (nonCircular) cleaned = nonCircular;
  }

  return cleaned;
}

export function simplifyFormalEnglish(text: string): string {
  if (!text) return '';
  let result = text;

  // 1. Phrase-level simplifications first (multi-word patterns)
  for (const [pattern, replacement] of DICTIONARY_PHRASE_SIMPLIFICATIONS) {
    result = result.replace(pattern, replacement);
  }

  // 2. Word-level vocabulary simplifications (sorted by length descending)
  const sortedKeys = Object.keys(FORMAL_TO_SIMPLE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, FORMAL_TO_SIMPLE_MAP[key]);
  }

  // 3. Clean up spaces and punctuation
  result = result
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:?!])/g, '$1')
    .trim();

  return result;
}

export function isVerbatimDuplicate(simple: string, dictionary: string): boolean {
  if (!simple || !dictionary) return false;

  const cleanSimple = simple.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanDict = dictionary.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanSimple || !cleanDict) return false;
  if (cleanSimple === cleanDict) return true;

  // Check if simple is merely "[word] is [dictionary]" or "[word] means [dictionary]"
  const strippedSimple = cleanSimple.replace(/^[a-z]+ (is|means|refers to) /, '').trim();
  if (strippedSimple === cleanDict) return true;

  // Word token overlap check
  const dictWords = cleanDict.split(' ').filter(w => w.length > 2);
  const simpleWords = cleanSimple.split(' ').filter(w => w.length > 2);

  if (dictWords.length >= 5) {
    let matches = 0;
    for (const dw of dictWords) {
      if (simpleWords.includes(dw)) matches++;
    }
    const ratio = matches / dictWords.length;
    // If simple is composed of > 80% identical dictionary words in nearly identical count
    if (ratio > 0.8 && Math.abs(simpleWords.length - dictWords.length) <= 3) {
      return true;
    }
  }

  return false;
}
