import { WordEntry } from '../models/word';

export const SAMPLE_WORDS: WordEntry[] = [
  {
    id: 'hypothetical',
    word: 'hypothetical',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Based on an imagined situation or idea rather than something known to be true.',
        simple: 'Something you imagine or suppose, even though it isn\'t necessarily real.',
        thinkOfItAs: 'What if...?'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/ˌhaɪ.pəˈθet.ɪ.kəl/',
        phonetic: 'hy-puh-THET-i-kuhl',
        audioUrl: ''
      },
      american: {
        ipa: '/ˌhaɪ.pəˈθet̬.ɪ.kəl/',
        phonetic: 'hy-puh-THET-ih-kuhl',
        audioUrl: ''
      },
      breakdown: [
        { syllable: 'hy', hint: 'like "high"' },
        { syllable: 'puh', hint: 'soft "puh"' },
        { syllable: 'THET', hint: 'stressed syllable', isStressed: true },
        { syllable: 'i', hint: '"ih"' },
        { syllable: 'kuhl', hint: '"kuhl"' }
      ]
    },
    usage: {
      isVerb: false,
      explanation: 'Use "hypothetical" when talking about an imagined or possible situation that is not necessarily real. Because it is an adjective, it does not have present, past, or future forms. The tense comes from the verb used in the sentence.'
    },
    examples: [
      {
        context: 'Conversation',
        sentence: 'Hypothetically, what would you do if you won the lottery?'
      },
      {
        context: 'Work',
        sentence: 'Hypothetically, what happens if the server goes down during peak traffic?'
      },
      {
        context: 'Academic',
        sentence: 'The research team considered a hypothetical scenario to test their theory.'
      }
    ],
    whenToUse: [
      'Talking about imagined situations',
      'Exploring possibilities',
      'Asking "what if?" questions',
      'Testing an idea without commitment',
      'Discussing something that has not actually happened'
    ],
    whenNotToUse: [
      'Describing concrete facts or events that already happened',
      'Talking about something guaranteed to happen'
    ],
    commonPhrases: [
      'Hypothetically speaking...',
      'Let\'s assume, hypothetically...',
      'That\'s purely hypothetical.',
      'A hypothetical question'
    ],
    synonyms: [
      { word: 'Possible', simpleDefinition: 'Something that could actually happen in real life.', distinction: 'Means it can really happen.' },
      { word: 'Theoretical', simpleDefinition: 'Based on ideas or rules rather than real practice.', distinction: 'Based on rules or theories.' },
      { word: 'Imaginary', simpleDefinition: 'Existing only in your mind, not real.', distinction: 'Means completely pretend.' },
      { word: 'Supposed', simpleDefinition: 'Assumed to be true for an argument.', distinction: 'Assumed just for discussion.' }
    ],
    antonyms: ['Actual', 'Real', 'Factual', 'Proven', 'Certain'],
    memoryTip: 'Hypothetical = "What if?"',
    practiceQuestions: [
      {
        id: 'hyp-q1',
        wordId: 'hypothetical',
        type: 'multiple-choice',
        question: 'Which sentence uses "hypothetical" correctly?',
        options: [
          'I hypothetical went to school yesterday.',
          'Hypothetically, what would you do if you found a lost wallet?',
          'She is hypothetical to the main office right now.'
        ],
        correctAnswerIndex: 1,
        explanation: '"Hypothetically" is used correctly here to pose a "what if" question about an imagined situation.'
      },
      {
        id: 'hyp-q2',
        wordId: 'hypothetical',
        type: 'fill-in-blank',
        question: 'Let\'s consider a _______ situation where we double our budget.',
        options: ['hypothetical', 'hypothetically', 'hypothesis'],
        correctAnswerIndex: 0,
        explanation: 'We need the adjective "hypothetical" to describe the noun "situation".'
      }
    ]
  },
  {
    id: 'resilient',
    word: 'resilient',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Able to withstand or recover quickly from difficult conditions, shock, or change.',
        simple: 'Being tough enough to bounce back quickly when things go wrong.',
        thinkOfItAs: 'Bouncing back like a spring.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/rɪˈzɪl.i.ənt/',
        phonetic: 'ri-ZIL-ee-uhnt'
      },
      american: {
        ipa: '/rɪˈzɪl.jənt/',
        phonetic: 'ri-ZIL-yuhnt'
      },
      breakdown: [
        { syllable: 'ri', hint: 'short "ri"' },
        { syllable: 'ZIL', hint: 'stressed syllable', isStressed: true },
        { syllable: 'yuhnt', hint: 'like "yunt"' }
      ]
    },
    usage: {
      isVerb: false,
      explanation: 'Use "resilient" to describe people, teams, systems, or materials that recover quickly after facing trouble or pressure. It is an adjective.'
    },
    examples: [
      {
        context: 'Work',
        sentence: 'Our startup remained resilient despite early financial setbacks.'
      },
      {
        context: 'Everyday',
        sentence: 'Children are surprisingly resilient after small accidents.'
      },
      {
        context: 'Academic',
        sentence: 'The ecological community proved resilient to climate variations.'
      }
    ],
    whenToUse: [
      'Praising someone\'s strength after hardship',
      'Describing durable systems or materials',
      'Discussing recovery after failure'
    ],
    whenNotToUse: [
      'Describing someone who never faces any difficulty at all',
      'Describing fragile or breakable objects'
    ],
    commonPhrases: [
      'Remain resilient',
      'Build resilient infrastructure',
      'Resilient spirit'
    ],
    synonyms: [
      { word: 'Tough', simpleDefinition: 'Strong and able to handle rough treatment.', distinction: 'Focuses on raw strength.' },
      { word: 'Adaptable', simpleDefinition: 'Able to easily adjust to new situations.', distinction: 'Focuses on fitting into new places.' },
      { word: 'Flexible', simpleDefinition: 'Able to bend or change plans easily.', distinction: 'Focuses on being open to change.' }
    ],
    antonyms: ['Fragile', 'Vulnerable', 'Weak', 'Delicate'],
    memoryTip: 'Resilient = Bounce back!',
    practiceQuestions: [
      {
        id: 'res-q1',
        wordId: 'resilient',
        type: 'multiple-choice',
        question: 'What is the best description of a resilient person?',
        options: [
          'Someone who never experiences problems.',
          'Someone who gets upset easily and gives up.',
          'Someone who recovers quickly from hard times.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Resilience is specifically the capacity to recover quickly from difficulties.'
      }
    ]
  },
  {
    id: 'ambiguous',
    word: 'ambiguous',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Open to more than one interpretation; not having one obvious meaning.',
        simple: 'Something that isn\'t clear because it could mean multiple things.',
        thinkOfItAs: 'Unclear directions or double meaning.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/æmˈbɪɡ.ju.əs/',
        phonetic: 'am-BIG-yoo-uhs'
      },
      american: {
        ipa: '/æmˈbɪɡ.ju.əs/',
        phonetic: 'am-BIG-yoo-uhs'
      },
      breakdown: [
        { syllable: 'am', hint: 'short "am"' },
        { syllable: 'BIG', hint: 'stressed syllable', isStressed: true },
        { syllable: 'yoo', hint: 'like "you"' },
        { syllable: 'uhs', hint: 'soft "us"' }
      ]
    },
    usage: {
      isVerb: false,
      explanation: 'Use "ambiguous" when a statement, law, message, or situation can be understood in more than one way, causing confusion.'
    },
    examples: [
      {
        context: 'Work',
        sentence: 'The project instructions were ambiguous, so team members made different assumptions.'
      },
      {
        context: 'Everyday',
        sentence: 'Her reply to my invitation was ambiguous; I couldn\'t tell if she was coming.'
      }
    ],
    whenToUse: [
      'Criticizing vague writing or instructions',
      'Describing mysterious or uncertain signals',
      'Pointing out multiple possible meanings'
    ],
    whenNotToUse: [
      'Describing something crystal clear or unmistakable'
    ],
    commonPhrases: [
      'Ambiguous phrasing',
      'Morally ambiguous',
      'Avoid ambiguous language'
    ],
    synonyms: [
      { word: 'Vague', simpleDefinition: 'Not clearly explained or expressed, lacking precise details.', distinction: 'Lacks detail, but might not have multiple specific interpretations.' },
      { word: 'Unclear', simpleDefinition: 'Hard to understand or see clearly.', distinction: 'General lack of clarity.' },
      { word: 'Equivocal', simpleDefinition: 'Using uncertain language that could mean more than one thing.', distinction: 'Intentionally confusing or misleading.' }
    ],
    antonyms: ['Clear', 'Explicit', 'Unambiguous', 'Definite'],
    memoryTip: 'Ambiguous = Am I option A or B?',
    practiceQuestions: [
      {
        id: 'amb-q1',
        wordId: 'ambiguous',
        type: 'multiple-choice',
        question: 'If a contract clause is "ambiguous", what does that mean?',
        options: [
          'It is very short.',
          'It could be interpreted in more than one way.',
          'It is completely illegal.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Ambiguous statements have more than one possible meaning.'
      }
    ]
  },
  {
    id: 'negotiate',
    word: 'negotiate',
    partOfSpeech: ['verb'],
    definitions: [
      {
        dictionary: 'Try to reach an agreement or compromise by discussion with others.',
        simple: 'To talk with someone to reach a fair deal or agreement.',
        thinkOfItAs: 'Working out a deal.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/nəˈɡəʊ.ʃi.eɪt/',
        phonetic: 'nuh-GOH-shee-ayt'
      },
      american: {
        ipa: '/nəˈɡoʊ.ʃi.eɪt/',
        phonetic: 'nuh-GOH-shee-ayt'
      },
      breakdown: [
        { syllable: 'nuh', hint: 'soft "nuh"' },
        { syllable: 'GOH', hint: 'stressed syllable', isStressed: true },
        { syllable: 'shee', hint: 'like "she"' },
        { syllable: 'ayt', hint: 'like "eight"' }
      ]
    },
    usage: {
      isVerb: true,
      explanation: '"Negotiate" is an active verb, so its form changes depending on the tense of the action.',
      present: [
        'I negotiate salary during job interviews.',
        'They negotiate contracts every year.'
      ],
      past: [
        'We negotiated a better price yesterday.',
        'She negotiated the lease terms last week.'
      ],
      future: [
        'He will negotiate with the vendor tomorrow.',
        'Our company is going to negotiate a merger.'
      ]
    },
    examples: [
      {
        context: 'Work',
        sentence: 'The union representative negotiated better healthcare benefits for workers.'
      },
      {
        context: 'Everyday',
        sentence: 'Parents often have to negotiate bedtime rules with young children.'
      }
    ],
    whenToUse: [
      'Discussing business transactions',
      'Reaching compromises',
      'Navigating disagreements'
    ],
    whenNotToUse: [
      'Giving a non-negotiable order or demand'
    ],
    commonPhrases: [
      'Negotiate terms',
      'Negotiate in good faith',
      'Open to negotiation'
    ],
    synonyms: [
      { word: 'Bargain', simpleDefinition: 'To discuss prices or terms to get a better deal.', distinction: 'Focuses heavily on price or trade.' },
      { word: 'Mediate', simpleDefinition: 'To help two opposing sides talk and agree.', distinction: 'Helping two OTHER parties reach an agreement.' },
      { word: 'Settle', simpleDefinition: 'To come to a final agreement or decision.', distinction: 'Reaching a final conclusion.' }
    ],
    antonyms: ['Dictate', 'Impose', 'Refuse'],
    memoryTip: 'Negotiate = Talk to agree!',
    practiceQuestions: [
      {
        id: 'neg-q1',
        wordId: 'negotiate',
        type: 'fill-in-blank',
        question: 'Yesterday, our manager _______ a lower price for the new equipment.',
        options: ['negotiates', 'negotiated', 'will negotiate'],
        correctAnswerIndex: 1,
        explanation: 'The word "Yesterday" requires the past tense verb "negotiated".'
      }
    ]
  },
  {
    id: 'inevitable',
    word: 'inevitable',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Certain to happen; unavoidable.',
        simple: 'Something that is bound to happen no matter what you do.',
        thinkOfItAs: 'Cannot be stopped.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/ɪnˈev.ɪ.tə.bəl/',
        phonetic: 'in-EV-i-tuh-buhl'
      },
      american: {
        ipa: '/ɪnˈev.ə.t̬ə.bəl/',
        phonetic: 'in-EV-ih-tuh-buhl'
      }
    },
    usage: {
      isVerb: false,
      explanation: 'Use "inevitable" to describe events or outcomes that are guaranteed to take place.'
    },
    examples: [
      {
        context: 'Work',
        sentence: 'With rapid company growth, office expansion became inevitable.'
      },
      {
        context: 'Everyday',
        sentence: 'Change is an inevitable part of life.'
      }
    ],
    whenToUse: [
      'Talking about unavoidable outcomes',
      'Describing natural consequences'
    ],
    synonyms: [
      { word: 'Unavoidable', simpleDefinition: 'Impossible to stop or prevent from happening.', distinction: 'Directly means impossible to avoid.' },
      { word: 'Certain', simpleDefinition: 'Completely sure to happen without any doubt.', distinction: 'Definite, but less dramatic than inevitable.' }
    ],
    antonyms: ['Avoidable', 'Uncertain', 'Preventable'],
    memoryTip: 'Inevitable = It WILL happen.'
  },
  {
    id: 'articulate',
    word: 'articulate',
    partOfSpeech: ['adjective', 'verb'],
    definitions: [
      {
        dictionary: 'Having or showing the ability to speak fluently and coherently.',
        simple: 'Able to express thoughts and ideas clearly in words.',
        thinkOfItAs: 'Clear speaker.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/ɑːˈtɪk.jə.lət/',
        phonetic: 'ah-TIK-yuh-luht (adj)'
      },
      american: {
        ipa: '/ɑːrˈtɪk.jə.lət/',
        phonetic: 'ar-TIK-yuh-luht (adj)'
      }
    },
    usage: {
      isVerb: true,
      explanation: 'When used as an adjective (ar-TIK-yuh-luht), it describes a clear speaker. When used as a verb (ar-TIK-yuh-layt), it means to express or pronounce clearly.',
      present: ['She articulates her goals clearly.'],
      past: ['He articulated the vision during the meeting.'],
      future: ['They will articulate the strategy tomorrow.']
    },
    examples: [
      {
        context: 'Academic',
        sentence: 'The candidate gave an articulate summary of her research.'
      }
    ],
    synonyms: [
      { word: 'Eloquence', simpleDefinition: 'Fluent, persuasive, and graceful speaking or writing.', distinction: 'Persuasive and graceful speech.' },
      { word: 'Fluent', simpleDefinition: 'Able to express yourself smoothly and easily.', distinction: 'Smooth speech, especially in languages.' }
    ],
    antonyms: ['Inarticulate', 'Hesitant', 'Mumbled'],
    memoryTip: 'Articulate = Clear speech.'
  },
  {
    id: 'reluctant',
    word: 'reluctant',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Unwilling and hesitant; disinclined.',
        simple: 'Unsure or hesitant to do something because you don\'t really want to.',
        thinkOfItAs: 'Holding back.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/rɪˈlʌk.tənt/',
        phonetic: 'ri-LUK-tuhnt'
      },
      american: {
        ipa: '/rɪˈlʌk.tənt/',
        phonetic: 'ri-LUK-tuhnt'
      }
    },
    examples: [
      {
        context: 'Everyday',
        sentence: 'He was reluctant to lend his car to a new driver.'
      }
    ],
    synonyms: [
      { word: 'Hesitant', simpleDefinition: 'Pausing before acting because you feel unsure or reluctant.', distinction: 'Pausing or slowing down before acting.' },
      { word: 'Unwilling', simpleDefinition: 'Not wanting to do something or refusing to agree.', distinction: 'Refusing to give consent or agree.' }
    ],
    antonyms: ['Eager', 'Willing', 'Enthusiastic'],
    memoryTip: 'Reluctant = Unwilling to start.'
  },
  {
    id: 'versatile',
    word: 'versatile',
    partOfSpeech: ['adjective'],
    definitions: [
      {
        dictionary: 'Able to adapt or be adapted to many different functions or activities.',
        simple: 'Capable of doing many different things well, or having many uses.',
        thinkOfItAs: 'Multi-talented tool.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/ˈvɜː.sə.taɪl/',
        phonetic: 'VUR-suh-tyle'
      },
      american: {
        ipa: '/ˈvɜːr.sə.t̬əl/',
        phonetic: 'VUR-suh-tuhl'
      }
    },
    examples: [
      {
        context: 'Work',
        sentence: 'She is a versatile developer skilled in both frontend and backend systems.'
      }
    ],
    synonyms: [
      { word: 'Adaptable', simpleDefinition: 'Able to adjust quickly to different situations.', distinction: 'Adjusting quickly to changes.' },
      { word: 'Flexible', simpleDefinition: 'Able to change easily to fit different needs.', distinction: 'Changing easily to fit circumstances.' },
      { word: 'All-around', simpleDefinition: 'Good at many different skills or useful for many things.', distinction: 'Having wide-ranging skills.' }
    ],
    antonyms: ['Limited', 'Inflexible', 'Specialized'],
    memoryTip: 'Versatile = Multi-use.'
  },
  {
    id: 'hypothesis',
    word: 'hypothesis',
    partOfSpeech: ['noun'],
    definitions: [
      {
        dictionary: 'A proposed explanation made on the basis of limited evidence as a starting point for further investigation.',
        simple: 'An educated guess or explanation that you test to see if it is true.',
        thinkOfItAs: 'A testable guess.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/haɪˈpɒθ.ə.sɪs/',
        phonetic: 'hy-POTH-uh-sis'
      },
      american: {
        ipa: '/haɪˈpɑː.θə.sɪs/',
        phonetic: 'hy-PAH-thuh-sis'
      }
    },
    examples: [
      {
        context: 'Academic',
        sentence: 'The scientist formed a hypothesis before conducting the lab experiment.'
      }
    ],
    synonyms: [
      { word: 'Theory', simpleDefinition: 'A tested idea used to explain facts or events.', distinction: 'A system of ideas intended to explain something.' },
      { word: 'Supposition', simpleDefinition: 'An uncertain belief or educated guess.', distinction: 'An idea assumed to be true.' },
      { word: 'Proposition', simpleDefinition: 'A suggested plan or idea put forward for consideration.', distinction: 'A statement or plan offered for discussion.' }
    ],
    antonyms: ['Fact', 'Proof', 'Certainty'],
    memoryTip: 'Hypothesis = Educated guess.'
  },
  {
    id: 'hypothesize',
    word: 'hypothesize',
    partOfSpeech: ['verb'],
    definitions: [
      {
        dictionary: 'Put forward an idea or explanation as a hypothesis.',
        simple: 'To propose an educated guess for discussion or testing.',
        thinkOfItAs: 'To guess scientifically.'
      }
    ],
    pronunciation: {
      british: {
        ipa: '/haɪˈpɒθ.ə.saɪz/',
        phonetic: 'hy-POTH-uh-syz'
      },
      american: {
        ipa: '/haɪˈpɑː.θə.saɪz/',
        phonetic: 'hy-PAH-thuh-syz'
      }
    },
    usage: {
      isVerb: true,
      explanation: '"Hypothesize" is a verb meaning to make a hypothesis.',
      present: ['Researchers hypothesize that sleep affects memory.'],
      past: ['The team hypothesized a new cause for the glitch.'],
      future: ['We will hypothesize potential solutions next week.']
    },
    examples: [
      {
        context: 'Academic',
        sentence: 'Economists hypothesize that interest rates will stabilize soon.'
      }
    ],
    synonyms: [
      { word: 'Speculate', simpleDefinition: 'To form a theory or guess without firm evidence.', distinction: 'Forming opinions without firm proof.' },
      { word: 'Postulate', simpleDefinition: 'To suggest an idea as a starting point for reasoning.', distinction: 'Suggesting a premise for debate.' }
    ],
    antonyms: ['Prove', 'Confirm'],
    memoryTip: 'Hypothesize = Make a guess.'
  }
];
