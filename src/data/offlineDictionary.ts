import { WordEntry } from '../models/word';

export const OFFLINE_DICTIONARY_DATA: Record<string, WordEntry> = {
  'ambiguity': {
    id: 'ambiguity',
    word: 'ambiguity',
    partOfSpeech: ['noun'],
    definitions: [
      {
        dictionary: 'The quality of being open to more than one interpretation; inexactness.',
        simple: 'Ambiguity means something is unclear or can be understood in more than one way, so people might get confused about what it really means.',
        thinkOfItAs: 'A signpost at a fork in the road pointing in two directions at once.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˌæm.bɪˈɡjuː.ə.ti/', phonetic: 'am-bi-GYOO-uh-tee' },
      american: { ipa: '/ˌæm.bɪˈɡjutu.ə.t̬i/', phonetic: 'am-bi-GYOO-ih-tee' }
    },
    usage: {
      isVerb: false,
      explanation: '"Ambiguity" is a noun. Use it when talking about statements, instructions, or rules that are not clear enough to have just one single meaning.'
    },
    examples: [
      { context: 'Work', sentence: 'The contract contained ambiguity regarding payment deadlines, leading to a minor dispute.' },
      { context: 'Everyday', sentence: 'Her answer was full of ambiguity, so I still did not know if she was coming to the party.' },
      { context: 'Academic', sentence: 'Poets often intentionally use ambiguity to encourage readers to reflect on multiple meanings.' }
    ],
    whenToUse: [
      'Describing instructions or rules that could be misunderstood',
      'Pointing out vague phrasing in agreements or emails',
      'Discussing art or literature open to multiple interpretations'
    ],
    whenNotToUse: [
      'Describing a simple lie or false statement',
      'Describing physical darkness or low visibility'
    ],
    commonPhrases: ['Moral ambiguity', 'Avoid ambiguity', 'Legal ambiguity', 'Resolve ambiguity'],
    synonyms: [
      { word: 'Uncertainty', distinction: 'Refers to lack of knowledge rather than double meanings.' },
      { word: 'Vagueness', distinction: 'Refers to lack of detail rather than having multiple meanings.' }
    ],
    antonyms: ['Clarity', 'Certainty', 'Precision', 'Directness']
  },
  'articulate': {
    id: 'articulate',
    word: 'articulate',
    partOfSpeech: ['adjective', 'verb'],
    definitions: [
      {
        dictionary: 'Having or showing the ability to speak fluently and coherently.',
        simple: 'Being articulate means you can express your thoughts and feelings clearly in words so everyone understands you easily.',
        thinkOfItAs: 'A radio tuned to a crystal-clear frequency with zero static.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ɑːˈtɪk.jə.lət/', phonetic: 'ar-TIK-yoo-lut' },
      american: { ipa: '/ɑːrˈtɪk.jə.lət/', phonetic: 'ar-TIK-yuh-lit' }
    },
    usage: {
      isVerb: true,
      explanation: 'As an adjective, it describes someone who speaks clearly. As a verb ("artic-yoo-late"), it means the action of explaining an idea clearly.'
    },
    examples: [
      { context: 'Work', sentence: 'She was so articulate during the interview that the hiring panel chose her immediately.' },
      { context: 'Everyday', sentence: 'Even though he was upset, he managed to articulate his feelings calmly.' },
      { context: 'Academic', sentence: 'The author articulates complex philosophical arguments in simple everyday prose.' }
    ],
    whenToUse: [
      'Praising someone who explains ideas clearly and effectively',
      'Describing speech that is easy to follow and convincing',
      'Encouraging someone to put complex feelings into words'
    ],
    whenNotToUse: [
      'Describing loud or noisy speaking',
      'Describing written text that is simply long'
    ],
    commonPhrases: ['Articulate speaker', 'Articulate a vision', 'Clear and articulate'],
    synonyms: [
      { word: 'Eloquent', distinction: 'Emphasizes emotional impact and beauty in speech.' },
      { word: 'Fluent', distinction: 'Focuses on smooth flow without pauses.' }
    ],
    antonyms: ['Inarticulate', 'Hesitant', 'Mumbled', 'Vague']
  },
  'audacious': {
    id: 'audacious',
    word: 'audacious',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Showing a willingness to take surprisingly bold risks.',
        simple: 'Audacious describes someone or an idea that is extremely bold, daring, and fearless, often surprising everyone.',
        thinkOfItAs: 'A tightrope walker crossing between two skyscrapers without a net.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ɔːˈdeɪ.ʃəs/', phonetic: 'aw-DAY-shus' },
      american: { ipa: '/ɑːˈdeɪ.ʃəs/', phonetic: 'aw-DAY-shus' }
    },
    usage: {
      isVerb: false,
      explanation: '"Audacious" is an adjective. It can be positive (meaning brave and innovative) or negative (meaning rude and impudent).'
    },
    examples: [
      { context: 'Work', sentence: 'The startup launched an audacious campaign to challenge the industry leader.' },
      { context: 'Conversation', sentence: 'It was an audacious goal to complete the marathon with only two weeks of training.' },
      { context: 'Everyday', sentence: 'The thief made an audacious attempt to rob the bank in broad daylight.' }
    ],
    whenToUse: [
      'Describing bold, high-risk plans that aim high',
      'Praising courageous or revolutionary ideas',
      'Calling out surprisingly disrespectful or brazen behavior'
    ],
    whenNotToUse: [
      'Describing safe, routine daily tasks',
      'Describing simple accidental mistakes'
    ],
    commonPhrases: ['Audacious goal', 'Audacious plan', 'Audacious move'],
    synonyms: [
      { word: 'Bold', distinction: 'General willingness to take risks.' },
      { word: 'Daring', distinction: 'Emphasizes excitement and adventure in risk-taking.' }
    ],
    antonyms: ['Timid', 'Cautious', 'Fearful', 'Modest']
  },
  'benevolent': {
    id: 'benevolent',
    word: 'benevolent',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Well meaning and kindly; serving a charitable rather than a profit-making purpose.',
        simple: 'Benevolent describes a person, organization, or gesture that is kind, generous, and genuinely cares about helping others.',
        thinkOfItAs: 'A warm fireplace on a freezing night offering shelter to everyone.'
      }
    ],
    pronunciation: {
      british: { ipa: '/bəˈnev.əl.ənt/', phonetic: 'buh-NEV-uh-luhnt' },
      american: { ipa: '/bəˈnev.əl.ənt/', phonetic: 'buh-NEV-uh-luhnt' }
    },
    usage: {
      isVerb: false,
      explanation: '"Benevolent" is an adjective. Use it when talking about people, leaders, or non-profit organizations acting out of goodwill.'
    },
    examples: [
      { context: 'Everyday', sentence: 'The benevolent neighbor cooked meals for the elderly couple down the street.' },
      { context: 'Work', sentence: 'The company established a benevolent foundation to support local school programs.' },
      { context: 'Academic', sentence: 'Historians debated whether the ruler was a benevolent dictator or a tyrant.' }
    ],
    whenToUse: [
      'Describing charitable organizations or donors',
      'Praising kind actions motivated by genuine compassion',
      'Describing leaders who care for the well-being of their people'
    ],
    whenNotToUse: [
      'Describing actions done purely for personal gain or profit',
      'Describing strict rules or enforcement'
    ],
    commonPhrases: ['Benevolent organization', 'Benevolent smile', 'Benevolent act'],
    synonyms: [
      { word: 'Charitable', distinction: 'Specifically relates to giving money or help to those in need.' },
      { word: 'Generous', distinction: 'Focuses on giving freely of resources.' }
    ],
    antonyms: ['Malevolent', 'Cruel', 'Selfish', 'Hostile']
  },
  'candid': {
    id: 'candid',
    word: 'candid',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Truthful and straightforward; frank.',
        simple: 'Candid means being completely honest and direct, sharing your real thoughts without hiding anything or holding back.',
        thinkOfItAs: 'An unedited photo taken when nobody was posing.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈkæn.dɪd/', phonetic: 'KAN-did' },
      american: { ipa: '/ˈkæn.dɪd/', phonetic: 'KAN-did' }
    },
    usage: {
      isVerb: false,
      explanation: '"Candid" is an adjective. It is often used to describe honest conversations, opinions, feedback, or spontaneous photos.'
    },
    examples: [
      { context: 'Work', sentence: 'During the performance review, my manager gave me candid feedback on my work.' },
      { context: 'Conversation', sentence: 'To be candid with you, I do not think this project will finish by Friday.' },
      { context: 'Everyday', sentence: 'I prefer candid snapshots over staged family portraits.' }
    ],
    whenToUse: [
      'Asking for or giving honest, unfiltered advice',
      'Describing unscripted, natural conversations or photos',
      'Signaling sincerity before speaking tough truths'
    ],
    whenNotToUse: [
      'Describing intentionally rude or insulting attacks',
      'Describing formal scripted speeches'
    ],
    commonPhrases: ['To be candid', 'Candid conversation', 'Candid feedback', 'Candid camera'],
    synonyms: [
      { word: 'Frank', distinction: 'Emphasizes directness, sometimes bordering on bluntness.' },
      { word: 'Honest', distinction: 'General truthfulness without deceit.' }
    ],
    antonyms: ['Deceitful', 'Evasive', 'Guarded', 'Insincere']
  },
  'cognitive': {
    id: 'cognitive',
    word: 'cognitive',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Relating to cognition; concerned with the act or process of knowing, perceiving, etc.',
        simple: 'Cognitive relates to how your brain thinks, learns, remembers, and understands information about the world.',
        thinkOfItAs: 'The internal processor and RAM inside your computer brain.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈkɒɡ.nə.tɪv/', phonetic: 'KOG-nuh-tiv' },
      american: { ipa: '/ˈkɑːɡ.nə.tɪv/', phonetic: 'KAHG-nuh-tiv' }
    },
    usage: {
      isVerb: false,
      explanation: '"Cognitive" is an adjective. It is frequently paired with terms like "skills", "load", "development", or "decline".'
    },
    examples: [
      { context: 'Academic', sentence: 'Puzzles and reading help improve cognitive function in older adults.' },
      { context: 'Work', sentence: 'Too many notifications create high cognitive load, making it hard to concentrate.' },
      { context: 'Everyday', sentence: 'Sleep deprivation has a noticeable negative impact on cognitive performance.' }
    ],
    whenToUse: [
      'Discussing mental processes like thinking, learning, and memory',
      'Talking about brain health, psychology, or problem-solving skills',
      'Describing tasks that require deep concentration'
    ],
    whenNotToUse: [
      'Describing physical bodily strength or stamina',
      'Describing emotional feelings like sadness or anger'
    ],
    commonPhrases: ['Cognitive skills', 'Cognitive load', 'Cognitive development', 'Cognitive bias'],
    synonyms: [
      { word: 'Mental', distinction: 'Broader term covering all mind-related experiences.' },
      { word: 'Intellectual', distinction: 'Pertains specifically to higher reasoning and scholarship.' }
    ],
    antonyms: ['Physical', 'Sensory', 'Emotional']
  },
  'conjecture': {
    id: 'conjecture',
    word: 'conjecture',
    partOfSpeech: ['noun', 'verb'],
    definitions: [
      {
        dictionary: 'An opinion or conclusion formed on the basis of incomplete information.',
        simple: 'Conjecture is a guess or opinion formed without having all the facts to prove it yet.',
        thinkOfItAs: 'Guessing the ending of a mystery movie at the 15-minute mark.'
      }
    ],
    pronunciation: {
      british: { ipa: '/kənˈdʒek.tʃər/', phonetic: 'kuhn-JEK-cher' },
      american: { ipa: '/kənˈdʒek.tʃɚ/', phonetic: 'kuhn-JEK-cher' }
    },
    usage: {
      isVerb: true,
      explanation: 'Use as a noun to mean "an educated guess", or as a verb to mean "to guess based on limited evidence".'
    },
    examples: [
      { context: 'Work', sentence: 'Without actual sales figures, any estimate for next quarter is pure conjecture.' },
      { context: 'Academic', sentence: 'Scientists cautioned that theories about extraterrestrial life remain conjecture.' },
      { context: 'Conversation', sentence: 'That rumor about the merger is just office conjecture at this point.' }
    ],
    whenToUse: [
      'Pointing out that a statement is an unproven guess',
      'Separating confirmed facts from speculations',
      'Formulating hypotheses before research data is complete'
    ],
    whenNotToUse: [
      'Describing verified scientific laws or proven facts',
      'Describing eyewitness testimony'
    ],
    commonPhrases: ['Pure conjecture', 'Matter of conjecture', 'Mere conjecture'],
    synonyms: [
      { word: 'Speculation', distinction: 'Emphasizes deep reasoning based on incomplete clues.' },
      { word: 'Surmise', distinction: 'Implies forming a quick hunch.' }
    ],
    antonyms: ['Fact', 'Proof', 'Certainty', 'Evidence']
  },
  'diligent': {
    id: 'diligent',
    word: 'diligent',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Having or showing care and conscientiousness in one\'s work or duties.',
        simple: 'Diligent describes someone who works hard, stays focused, and pays careful attention to doing a job right.',
        thinkOfItAs: 'An ant steadily carrying supplies back to the hill without giving up.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈdɪl.ɪ.dʒənt/', phonetic: 'DIL-ih-juhnt' },
      american: { ipa: '/ˈdɪl.ə.dʒənt/', phonetic: 'DIL-uh-juhnt' }
    },
    usage: {
      isVerb: false,
      explanation: '"Diligent" is an adjective. Describe employees, students, researchers, or efforts that are persistent and thorough.'
    },
    examples: [
      { context: 'Work', sentence: 'Thanks to her diligent effort, the audit was completed ahead of schedule.' },
      { context: 'Academic', sentence: 'Diligent students who review notes daily tend to score higher on exams.' },
      { context: 'Everyday', sentence: 'He was diligent about washing his hands and keeping his workspace clean.' }
    ],
    whenToUse: [
      'Praising persistent, high-quality work habits',
      'Describing thorough research or background checks',
      'Commending steady effort over long periods'
    ],
    whenNotToUse: [
      'Describing fast but sloppy rush work',
      'Describing passive relaxation'
    ],
    commonPhrases: ['Diligent worker', 'Diligent search', 'Due diligence', 'Diligent effort'],
    synonyms: [
      { word: 'Hardworking', distinction: 'Everyday word for putting in strong effort.' },
      { word: 'Meticulous', distinction: 'Focuses specifically on extreme care with small details.' }
    ],
    antonyms: ['Lazy', 'Careless', 'Negligent', 'Slothful']
  },
  'eloquent': {
    id: 'eloquent',
    word: 'eloquent',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Fluent or persuasive in speaking or writing.',
        simple: 'Eloquent describes speech or writing that is beautiful, moving, and clear enough to deeply touch people.',
        thinkOfItAs: 'A master musician playing a solo that moves an auditorium to silence.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈel.ə.kwənt/', phonetic: 'EL-uh-kwuhnt' },
      american: { ipa: '/ˈel.ə.kwənt/', phonetic: 'EL-uh-kwuhnt' }
    },
    usage: {
      isVerb: false,
      explanation: '"Eloquent" is an adjective used to compliment persuasive speakers, memorable speeches, or expressive writing.'
    },
    examples: [
      { context: 'Work', sentence: 'The CEO delivered an eloquent speech that restored investor confidence.' },
      { context: 'Everyday', sentence: 'His silent gesture of gratitude was more eloquent than words.' },
      { context: 'Academic', sentence: 'The author\'s eloquent prose brought historical events to life.' }
    ],
    whenToUse: [
      'Praising speeches or writing that deeply inspire listeners',
      'Describing powerful, elegant communication',
      'Commending meaningful non-verbal expressions'
    ],
    whenNotToUse: [
      'Describing rapid chatter or informal slang',
      'Describing loud shouting'
    ],
    commonPhrases: ['Eloquent speaker', 'Eloquent speech', 'An eloquent reminder'],
    synonyms: [
      { word: 'Persuasive', distinction: 'Focuses specifically on convincing someone to take action.' },
      { word: 'Articulate', distinction: 'Focuses on clarity and precision of thought.' }
    ],
    antonyms: ['Inarticulate', 'Unpersuasive', 'Awkward', 'Mumbled']
  },
  'ephemeral': {
    id: 'ephemeral',
    word: 'ephemeral',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Lasting for a very short time.',
        simple: 'Ephemeral describes something that lasts for only a brief moment before disappearing, like a rainbow or a soap bubble.',
        thinkOfItAs: 'A soap bubble floating in the sun that pops within seconds.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ɪˈfem.ər.əl/', phonetic: 'ih-FEM-er-uhl' },
      american: { ipa: '/ɪˈfem.ɚ.əl/', phonetic: 'ih-FEM-er-uhl' }
    },
    usage: {
      isVerb: false,
      explanation: '"Ephemeral" is an adjective. Use it when emphasizing the temporary, fleeting nature of beauty, trends, or moments.'
    },
    examples: [
      { context: 'Everyday', sentence: 'The beauty of cherry blossoms is ephemeral, lasting only a few days each spring.' },
      { context: 'Work', sentence: 'Viral social media fame is often ephemeral, so brands must build lasting value.' },
      { context: 'Conversation', sentence: 'Enjoy this peaceful moment; moments like this are ephemeral.' }
    ],
    whenToUse: [
      'Describing temporary natural phenomena like sunsets, rainbows, or fog',
      'Highlighting short-lived internet trends or viral posts',
      'Reflecting on fleeting life experiences'
    ],
    whenNotToUse: [
      'Describing long-lasting structures or permanent laws',
      'Describing physical objects built to last'
    ],
    commonPhrases: ['Ephemeral nature', 'Ephemeral beauty', 'Ephemeral trend'],
    synonyms: [
      { word: 'Fleeting', distinction: 'Poetic everyday term for passing quickly.' },
      { word: 'Transient', distinction: 'Often used for people or conditions moving through.' }
    ],
    antonyms: ['Permanent', 'Enduring', 'Eternal', 'Everlasting']
  },
  'evanescent': {
    id: 'evanescent',
    word: 'evanescent',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Soon passing out of sight, memory, or existence; quickly fading or vanishing.',
        simple: 'Evanescent means fading away rapidly like mist or smoke, so it is barely caught before it disappears.',
        thinkOfItAs: 'Morning fog dissolving as soon as the sun touches it.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˌev.əˈnes.ənt/', phonetic: 'ev-uh-NES-uhnt' },
      american: { ipa: '/ˌev.əˈnes.ənt/', phonetic: 'ev-uh-NES-uhnt' }
    },
    usage: {
      isVerb: false,
      explanation: '"Evanescent" is a literary adjective describing things that vanish gradually right before your eyes.'
    },
    examples: [
      { context: 'Academic', sentence: 'The artist captured the evanescent shimmer of sunlight on ocean waves.' },
      { context: 'Everyday', sentence: 'The feeling of nostalgia was evanescent, passing as quickly as it arrived.' },
      { context: 'Conversation', sentence: 'Dew drops on morning grass are evanescent treasures.' }
    ],
    whenToUse: [
      'Describing delicate things that vanish gradually (light, fog, scents)',
      'Writing poetic or descriptive essays',
      'Highlighting gentle, disappearing moments'
    ],
    whenNotToUse: [
      'Describing sudden explosive changes',
      'Describing solid durable materials'
    ],
    commonPhrases: ['Evanescent light', 'Evanescent memory', 'Evanescent moment'],
    synonyms: [
      { word: 'Fading', distinction: 'Simple everyday term for losing brightness or strength.' },
      { word: 'Vanish', distinction: 'A verb meaning to disappear entirely.' }
    ],
    antonyms: ['Lasting', 'Permanent', 'Abiding']
  },
  'hypothetical': {
    id: 'hypothetical',
    word: 'hypothetical',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Based on an imagined situation or idea rather than something known to be true.',
        simple: 'Hypothetical describes an imagined "what if" scenario used to test an idea, not something that has actually happened.',
        thinkOfItAs: 'Asking "What would you do if you found a million dollars?" — testing an idea without real cash.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˌhaɪ.pəˈθet.ɪ.kəl/', phonetic: 'hy-puh-THET-i-kuhl' },
      american: { ipa: '/ˌhaɪ.pəˈθet̬.ɪ.kəl/', phonetic: 'hy-puh-THET-ih-kuhl' }
    },
    usage: {
      isVerb: false,
      explanation: '"Hypothetical" is an adjective. Use it when posing "what if" questions or testing potential outcomes in theory.'
    },
    examples: [
      { context: 'Conversation', sentence: 'Hypothetically speaking, what would you do if you won the lottery?' },
      { context: 'Work', sentence: 'We analyzed a hypothetical scenario where supply costs double next year.' },
      { context: 'Academic', sentence: 'Researchers used a hypothetical model to simulate climate variations.' }
    ],
    whenToUse: [
      'Asking "what if" questions in discussions',
      'Testing strategies against imaginary scenarios',
      'Distinguishing theoretical ideas from verified facts'
    ],
    whenNotToUse: [
      'Describing real historical events that occurred',
      'Describing guaranteed future plans'
    ],
    commonPhrases: ['Hypothetically speaking', 'Hypothetical scenario', 'Hypothetical question'],
    synonyms: [
      { word: 'Theoretical', distinction: 'Based on principles or academic theories.' },
      { word: 'Imaginary', distinction: 'Implies existing solely in the mind without practical grounding.' }
    ],
    antonyms: ['Actual', 'Real', 'Factual', 'Proven']
  },
  'inevitable': {
    id: 'inevitable',
    word: 'inevitable',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Certain to happen; unavoidable.',
        simple: 'Inevitable means something is bound to happen no matter what you do to try to stop or avoid it.',
        thinkOfItAs: 'Sunset at the end of every afternoon.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ɪnˈev.ɪ.tə.bəl/', phonetic: 'in-EV-ih-tuh-buhl' },
      american: { ipa: '/ɪnˈev.ə.t̬ə.bəl/', phonetic: 'in-EV-ih-tuh-buhl' }
    },
    usage: {
      isVerb: false,
      explanation: '"Inevitable" is an adjective. Use it for outcomes that cannot be prevented by any action.'
    },
    examples: [
      { context: 'Work', sentence: 'With technological advancement, automation in logistics was inevitable.' },
      { context: 'Everyday', sentence: 'Change is an inevitable part of growing up.' },
      { context: 'Conversation', sentence: 'If you keep driving on a flat tire, damage to the wheel is inevitable.' }
    ],
    whenToUse: [
      'Discussing outcomes that cannot be avoided',
      'Accepting natural consequences of long-term trends',
      'Preparing for guaranteed future shifts'
    ],
    whenNotToUse: [
      'Describing events that can easily be prevented',
      'Describing random coincidences'
    ],
    commonPhrases: ['Inevitable outcome', 'Seemingly inevitable', 'Accept the inevitable'],
    synonyms: [
      { word: 'Unavoidable', distinction: 'Emphasizes inability to sidestep an event.' },
      { word: 'Certain', distinction: 'Focuses on confidence in an outcome.' }
    ],
    antonyms: ['Avoidable', 'Uncertain', 'Preventable', 'Optional']
  },
  'meticulous': {
    id: 'meticulous',
    word: 'meticulous',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Showing great attention to detail; very careful and precise.',
        simple: 'Meticulous describes someone who pays extreme, careful attention to every tiny detail so there are zero errors.',
        thinkOfItAs: 'A watchmaker placing microscopic gears using tweezers under a magnifying glass.'
      }
    ],
    pronunciation: {
      british: { ipa: '/məˈtɪk.jə.ləs/', phonetic: 'muh-TIK-yoo-luhs' },
      american: { ipa: '/məˈtɪk.jə.ləs/', phonetic: 'muh-TIK-yuh-luhs' }
    },
    usage: {
      isVerb: false,
      explanation: '"Meticulous" is an adjective. It describes people, planning, organization, or research that leaves nothing to chance.'
    },
    examples: [
      { context: 'Work', sentence: 'Her meticulous record-keeping saved the team during the annual financial audit.' },
      { context: 'Everyday', sentence: 'He is meticulous about cleaning his kitchen every evening before bed.' },
      { context: 'Academic', sentence: 'The researcher spent years doing meticulous field measurements.' }
    ],
    whenToUse: [
      'Praising someone who double-checks every small detail',
      'Describing precision crafts, coding, or accounting work',
      'Commending thorough preparation'
    ],
    whenNotToUse: [
      'Describing quick estimates or rough sketches',
      'Describing reckless or rushed work'
    ],
    commonPhrases: ['Meticulous planning', 'Meticulous attention to detail', 'Meticulous care'],
    synonyms: [
      { word: 'Painstaking', distinction: 'Highlights how much arduous effort was invested.' },
      { word: 'Thorough', distinction: 'Focuses on covering all necessary steps.' }
    ],
    antonyms: ['Careless', 'Sloppy', 'Negligent', 'Hasty']
  },
  'pragmatic': {
    id: 'pragmatic',
    word: 'pragmatic',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
        simple: 'Pragmatic describes a mindset focused on real solutions that actually work in practice, rather than theoretical rules.',
        thinkOfItAs: 'Choosing comfortable sneakers for a 10-mile walk instead of stylish shoes that hurt.'
      }
    ],
    pronunciation: {
      british: { ipa: '/præɡˈmæt.ɪk/', phonetic: 'prag-MAT-ik' },
      american: { ipa: '/præɡˈmæt̬.ɪk/', phonetic: 'prag-MAT-ik' }
    },
    usage: {
      isVerb: false,
      explanation: '"Pragmatic" is an adjective. Describe people, decisions, or approaches that solve problems efficiently in the real world.'
    },
    examples: [
      { context: 'Work', sentence: 'We took a pragmatic approach to the deadline and cut non-essential features.' },
      { context: 'Conversation', sentence: 'Be pragmatic — choose a car that fits your daily commute and budget.' },
      { context: 'Academic', sentence: 'The essay offers a pragmatic resolution to a long-standing debate.' }
    ],
    whenToUse: [
      'Advocating for sensible, realistic solutions',
      'Choosing practical results over ideal theory',
      'Praising grounded decision-making'
    ],
    whenNotToUse: [
      'Describing wild, impractical dreams',
      'Describing stubborn adherence to rules despite failure'
    ],
    commonPhrases: ['Pragmatic approach', 'Pragmatic solution', 'Pragmatic leader'],
    synonyms: [
      { word: 'Practical', distinction: 'Everyday word for sensible utility.' },
      { word: 'Realistic', distinction: 'Emphasizes seeing facts as they truly are.' }
    ],
    antonyms: ['Idealistic', 'Impractical', 'Theoretical', 'Visionary']
  },
  'resilient': {
    id: 'resilient',
    word: 'resilient',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Able to withstand or recover quickly from difficult conditions, shock, or change.',
        simple: 'Resilient describes someone or something that is tough enough to bounce back quickly when things go wrong.',
        thinkOfItAs: 'A spring that bounces right back to its original shape no matter how hard you push it down.'
      }
    ],
    pronunciation: {
      british: { ipa: '/rɪˈzɪl.i.ənt/', phonetic: 'ri-ZIL-ee-uhnt' },
      american: { ipa: '/rɪˈzɪl.jənt/', phonetic: 'ri-ZIL-yuhnt' }
    },
    usage: {
      isVerb: false,
      explanation: '"Resilient" is an adjective. Use it to praise people, teams, communities, or software systems that recover quickly.'
    },
    examples: [
      { context: 'Everyday', sentence: 'Children are remarkably resilient and adapt quickly to new surroundings.' },
      { context: 'Work', sentence: 'Our infrastructure proved resilient during the peak traffic spike.' },
      { context: 'Conversation', sentence: 'She has a resilient spirit despite all the challenges she faced this year.' }
    ],
    whenToUse: [
      'Praising someone\'s emotional strength after hard times',
      'Describing durable physical materials or elastic items',
      'Describing stable computer networks and supply chains'
    ],
    whenNotToUse: [
      'Describing fragile glass that breaks permanently',
      'Describing someone who gives up at the first obstacle'
    ],
    commonPhrases: ['Resilient system', 'Stay resilient', 'Resilient community'],
    synonyms: [
      { word: 'Tough', distinction: 'Everyday word for physical or mental strength.' },
      { word: 'Adaptable', distinction: 'Focuses on flexibility in new environments.' }
    ],
    antonyms: ['Fragile', 'Vulnerable', 'Weak', 'Brittle']
  },
  'scrutiny': {
    id: 'scrutiny',
    word: 'scrutiny',
    partOfSpeech: ['noun'],
    definitions: [
      {
        dictionary: 'Critical observation or examination.',
        simple: 'Scrutiny means close, thorough inspection where every detail is checked carefully for errors or faults.',
        thinkOfItAs: 'Inspecting a diamond under a jeweler\'s loupe magnification.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈskruː.tɪ.ni/', phonetic: 'SKROO-ti-nee' },
      american: { ipa: '/ˈskruː.t̬ən.i/', phonetic: 'SKROO-tuhn-ee' }
    },
    usage: {
      isVerb: false,
      explanation: '"Scrutiny" is a noun. It is often paired with verbs like "undergo", "face", "withstand", or "subject to".'
    },
    examples: [
      { context: 'Work', sentence: 'The new financial report came under intense scrutiny from board members.' },
      { context: 'Academic', sentence: 'Scientific discoveries must withstand rigorous peer scrutiny before publication.' },
      { context: 'Everyday', sentence: 'Public figures live under constant media scrutiny.' }
    ],
    whenToUse: [
      'Describing thorough audits, reviews, or inspections',
      'Talking about public or media examination of leaders',
      'Checking work carefully to catch potential bugs or mistakes'
    ],
    whenNotToUse: [
      'Describing a casual glance out the window',
      'Describing ignoring details'
    ],
    commonPhrases: ['Under scrutiny', 'Close scrutiny', 'Public scrutiny', 'Withstand scrutiny'],
    synonyms: [
      { word: 'Inspection', distinction: 'General official checking of safety or compliance.' },
      { word: 'Examination', distinction: 'Broad study or testing.' }
    ],
    antonyms: ['Neglect', 'Disregard', 'Ignorance', 'Overview']
  },
  'seldom': {
    id: 'seldom',
    word: 'seldom',
    partOfSpeech: ['adverb'],
    definitions: [
      {
        dictionary: 'Not often; rarely.',
        simple: 'Seldom means almost never, or only once in a long while.',
        thinkOfItAs: 'Snow falling in the middle of a hot desert.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈsel.dəm/', phonetic: 'SEL-duhm' },
      american: { ipa: '/ˈsel.dəm/', phonetic: 'SEL-duhm' }
    },
    usage: {
      isVerb: false,
      explanation: '"Seldom" is an adverb. Place it before a verb (e.g., "seldom eats", "seldom complains") to show rare occurrence.'
    },
    examples: [
      { context: 'Everyday', sentence: 'He seldom eats fast food because he prefers cooking fresh meals at home.' },
      { context: 'Work', sentence: 'Our engineering team seldom misses deployment deadlines.' },
      { context: 'Conversation', sentence: 'I seldom see him around the neighborhood since he got a new job.' }
    ],
    whenToUse: [
      'Expressing that an action occurs very rarely',
      'Writing formal or polished sentences instead of saying "not often"',
      'Setting boundaries on infrequent habits'
    ],
    whenNotToUse: [
      'Describing things that happen every day',
      'Describing guaranteed routines'
    ],
    commonPhrases: ['Seldom seen', 'Seldom if ever', 'Seldom heard'],
    synonyms: [
      { word: 'Rarely', distinction: 'Most common everyday synonym.' },
      { word: 'Infrequently', distinction: 'Slightly more formal expression.' }
    ],
    antonyms: ['Often', 'Frequently', 'Regularly', 'Always']
  },
  'ubiquitous': {
    id: 'ubiquitous',
    word: 'ubiquitous',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Present, appearing, or found everywhere.',
        simple: 'Ubiquitous describes something that seems to be everywhere at the same time, so you see it wherever you turn.',
        thinkOfItAs: 'Smartphones in people\'s hands on a morning subway train.'
      }
    ],
    pronunciation: {
      british: { ipa: '/juːˈbɪk.wɪ.təs/', phonetic: 'yoo-BIK-wi-tuhs' },
      american: { ipa: '/juːˈbɪk.wə.t̬əs/', phonetic: 'yoo-BIK-wuh-tuhs' }
    },
    usage: {
      isVerb: false,
      explanation: '"Ubiquitous" is an adjective. Describe products, technology, trends, or items that are universally visible.'
    },
    examples: [
      { context: 'Everyday', sentence: 'Smartphones have become ubiquitous in modern daily life.' },
      { context: 'Work', sentence: 'High-speed Wi-Fi is now a ubiquitous requirement for modern offices.' },
      { context: 'Conversation', sentence: 'Coffee shops seem ubiquitous on almost every city corner.' }
    ],
    whenToUse: [
      'Pointing out trends or items present everywhere in society',
      'Describing tech products that everyone owns',
      'Highlighting universal elements in daily life'
    ],
    whenNotToUse: [
      'Describing rare collectors\' items',
      'Describing hidden secret locations'
    ],
    commonPhrases: ['Ubiquitous presence', 'Become ubiquitous', 'Ubiquitous feature'],
    synonyms: [
      { word: 'Omnipresent', distinction: 'Stronger term often used in formal or spiritual contexts.' },
      { word: 'Widespread', distinction: 'Means common over a large geographic area.' }
    ],
    antonyms: ['Rare', 'Scarce', 'Uncommon', 'Isolated']
  },
  'versatile': {
    id: 'versatile',
    word: 'versatile',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Able to adapt or be adapted to many different functions or activities.',
        simple: 'Versatile describes someone or something that is flexible, handy, and good at doing many different tasks.',
        thinkOfItAs: 'A Swiss Army knife that has a tool for every job.'
      }
    ],
    pronunciation: {
      british: { ipa: '/ˈvɜː.sə.taɪl/', phonetic: 'VER-suh-tyle' },
      american: { ipa: '/ˈvɝː.sə.t̬əl/', phonetic: 'VER-suh-tuhl' }
    },
    usage: {
      isVerb: false,
      explanation: '"Versatile" is an adjective. Describe multi-talented people, flexible tools, adaptable software, or multi-purpose clothing.'
    },
    examples: [
      { context: 'Work', sentence: 'She is a versatile developer who can build front-end UIs and backend databases.' },
      { context: 'Everyday', sentence: 'A denim jacket is a versatile wardrobe piece that matches almost anything.' },
      { context: 'Academic', sentence: 'Python is a versatile programming language used in web dev and data science.' }
    ],
    whenToUse: [
      'Praising people with diverse skill sets',
      'Recommending tools or software that serve multiple purposes',
      'Describing adaptable clothing or equipment'
    ],
    whenNotToUse: [
      'Describing single-purpose rigid tools',
      'Describing specialized one-trick items'
    ],
    commonPhrases: ['Highly versatile', 'Versatile tool', 'Versatile talent'],
    synonyms: [
      { word: 'Adaptable', distinction: 'Focuses on adjusting easily to new conditions.' },
      { word: 'Multi-purpose', distinction: 'Used for objects designed with multiple uses.' }
    ],
    antonyms: ['Inflexible', 'Limited', 'Single-purpose', 'Rigid']
  }
};
