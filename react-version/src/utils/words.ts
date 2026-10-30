/**
 * Words database and generator for Ninja Typing Race
 */

export const WORDS_BY_LEVEL: Record<number, string[]> = {
  1: [
    'NINJA', 'RUN', 'FAST', 'JUMP', 'FIGHT', 'POWER', 'SPEED', 'HERO',
    'DASH', 'BLADE', 'KICK', 'WIND', 'LEAP', 'EDGE', 'SWIFT', 'FIRE',
    'ZOOM', 'DART', 'FLOW', 'RUSH', 'FLEX', 'SPARK', 'SHIN', 'STAR',
    'STEP', 'CLAW', 'GRIT', 'STORM', 'SLIDE', 'HONOR'
  ],
  2: [
    'SHADOW', 'ATTACK', 'STRIKE', 'MASTER', 'DANGER', 'SILENCE',
    'REFLEX', 'SPIRIT', 'DRAGON', 'COMBAT', 'KATANA', 'STEALTH',
    'CHAKRA', 'MOTION', 'TARGET', 'AGILITY', 'IMPACT', 'ENERGY',
    'THRUST', 'SHIELD', 'NINJUTSU', 'TALON', 'VORTEX', 'LETHAL',
    'KINETIC', 'TACTIC', 'RHYTHM', 'FRENZY'
  ],
  3: [
    'WARRIOR', 'LIGHTNING', 'SURVIVAL', 'TRAINING', 'VICTORY',
    'ASSASSIN', 'ACROBATIC', 'SHURIKEN', 'PHANTOM', 'FORTITUDE',
    'REACTION', 'VELOCITY', 'PRECISION', 'FOCUSING', 'CHAMPION',
    'BLURRING', 'RELENTLESS', 'SWIFTNESS', 'DECISIVE', 'DISCIPLINE',
    'FEROCITY', 'DARKNESS', 'NIGHTFALL'
  ],
  4: [
    'ACCELERATION', 'UNSTOPPABLE', 'SUPERSONIC', 'CONCENTRATION',
    'INVINCIBLE', 'MASTERY', 'TRANSCENDENCE', 'OVERWHELMING',
    'DETERMINATION', 'PERFORMANCE', 'THUNDERSTORM', 'EXTRAORDINARY',
    'JUGGERNAUT', 'ANTICIPATION', 'SHADOWRUNNER', 'REFLECTIVE',
    'EXCELLENCE', 'ELECTRIFYING', 'UNMATCHABLE'
  ]
};

export const FALLBACK_EXTENDED_WORDS = [
  'SHINOBI', 'DEFENSE', 'TEMPEST', 'PHANTOM', 'BLITZKRIEG',
  'TELEPORT', 'CHRONICLE', 'HYPERSONIC', 'LEGENDARY', 'DOMINATION',
  'VANGUARD', 'BERSERKER', 'EXECUTION', 'MOMENTUM', 'INTIMIDATE'
];

/**
 * Returns a randomized queue of words appropriate for the given level.
 */
export function getWordQueueForLevel(level: number, count: number = 60): string[] {
  let pool: string[];

  if (level === 1) {
    pool = WORDS_BY_LEVEL[1];
  } else if (level === 2) {
    pool = [...WORDS_BY_LEVEL[2], ...WORDS_BY_LEVEL[1]];
  } else if (level === 3) {
    pool = [...WORDS_BY_LEVEL[3], ...WORDS_BY_LEVEL[2]];
  } else if (level >= 4) {
    // High level mixing
    pool = [
      ...WORDS_BY_LEVEL[4],
      ...WORDS_BY_LEVEL[3],
      ...FALLBACK_EXTENDED_WORDS
    ];
  } else {
    pool = WORDS_BY_LEVEL[1];
  }

  // Shuffle and generate requested count
  const result: string[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  while (result.length < count) {
    for (const word of shuffled) {
      if (result.length >= count) break;
      result.push(word);
    }
  }

  return result;
}
