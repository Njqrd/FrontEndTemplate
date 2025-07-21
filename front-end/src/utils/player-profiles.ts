import { PlayerType, PlayerTypeProfile, PlayerStatistics } from '@/types/player';

// Statistical Player Profiles Based on Research Data
export const PLAYER_PROFILES: Record<PlayerType, PlayerTypeProfile> = {
  TAG: {
    name: 'Tight-Aggressive (TAG)',
    description: 'Most common winning style. Plays premium hands aggressively with disciplined approach.',
    baseStats: {
      vpip: 18,          // 15-20% range
      pfr: 15,           // 12-18% range
      aggressionFactor: 3.0,  // 2.5-4.0 range
      
      cBetFrequency: 62,      // 58-70% baseline
      foldToCBet: 55,         // 55-65% tight players
      checkRaiseFrequency: 10, // 8-18% range
      
      threeBetFrequency: 6,   // 3-12% range
      foldToThreeBet: 65,     // 55-75% range
      doubleBusBarrelFrequency: 45, // 40-50% for tight players
      
      wentToShowdown: 23,     // 20-25% for TAG
      wonAtShowdown: 60,      // 55-65% when they go to showdown
      
      positionAdjustments: {
        early: 0.8,    // More conservative in early position
        middle: 1.0,   // Standard play
        late: 1.2,     // More aggressive in late position
        blinds: 0.9,   // Slightly tighter in blinds
      }
    },
    profitability: 'High',
    difficulty: 'Medium',
    commonMistakes: [
      'Being too tight in late position',
      'Not value betting thin enough',
      'Folding too much to aggression'
    ],
    exploitationStrategies: [
      'Bluff more frequently against tight players',
      'Value bet thinner when they call',
      'Steal their blinds more aggressively'
    ]
  },

  LAG: {
    name: 'Loose-Aggressive (LAG)',
    description: 'Can be highly profitable with skill. Plays wider ranges with high aggression.',
    baseStats: {
      vpip: 30,          // 25-35% range
      pfr: 22,           // 18-25% range
      aggressionFactor: 4.5,  // 3.5-6.0 range
      
      cBetFrequency: 68,      // Higher than TAG
      foldToCBet: 45,         // Lower fold rate - more willing to fight
      checkRaiseFrequency: 15, // More aggressive check-raising
      
      threeBetFrequency: 9,   // Higher 3-bet frequency
      foldToThreeBet: 60,     // Balanced response to 3-bets
      doubleBusBarrelFrequency: 60, // 55-65% for LAG players
      
      wentToShowdown: 28,     // Go to showdown more often
      wonAtShowdown: 55,      // Slightly lower win rate due to wider range
      
      positionAdjustments: {
        early: 0.9,    // Still more conservative early
        middle: 1.1,   // More aggressive than TAG
        late: 1.4,     // Very aggressive in late position
        blinds: 1.2,   // Defend blinds more
      }
    },
    profitability: 'High',
    difficulty: 'Hard',
    commonMistakes: [
      'Playing too many hands out of position',
      'Overbluffing in unfavorable spots',
      'Not adjusting to table dynamics'
    ],
    exploitationStrategies: [
      'Tighten up and let them bluff',
      'Value bet more frequently',
      'Avoid bluffing - they call light'
    ]
  },

  TP: {
    name: 'Tight-Passive (TP)',
    description: 'Plays few hands and rarely raises. Marginally profitable at best.',
    baseStats: {
      vpip: 12,          // 10-15% range
      pfr: 6,            // 3-8% range
      aggressionFactor: 1.0,  // 0.5-1.5 range
      
      cBetFrequency: 45,      // Low c-bet frequency
      foldToCBet: 65,         // High fold rate to aggression
      checkRaiseFrequency: 8,  // Rarely check-raises
      
      threeBetFrequency: 3,   // Very low 3-bet frequency
      foldToThreeBet: 75,     // High fold rate to 3-bets
      doubleBusBarrelFrequency: 35, // Low barrel frequency
      
      wentToShowdown: 20,     // Low showdown frequency
      wonAtShowdown: 58,      // Decent win rate when they do go
      
      positionAdjustments: {
        early: 0.9,    // Slightly tighter early
        middle: 1.0,   // Standard
        late: 1.1,     // Barely more aggressive late
        blinds: 0.8,   // Very tight in blinds
      }
    },
    profitability: 'Low',
    difficulty: 'Easy',
    commonMistakes: [
      'Not betting for value with strong hands',
      'Folding too much to aggression',
      'Missing profitable spots due to passivity'
    ],
    exploitationStrategies: [
      'Bluff frequently - they fold too much',
      'Value bet thin when they call',
      'Steal blinds aggressively'
    ]
  },

  LP: {
    name: 'Loose-Passive (LP)',
    description: 'Calling stations who see many flops. Generally losing players.',
    baseStats: {
      vpip: 40,          // 30-50% range
      pfr: 8,            // 5-12% range
      aggressionFactor: 0.8,  // 0.5-1.5 range
      
      cBetFrequency: 48,      // Low c-bet frequency
      foldToCBet: 35,         // Very low fold rate - call lots
      checkRaiseFrequency: 12, // Moderate check-raising
      
      threeBetFrequency: 4,   // Low 3-bet frequency
      foldToThreeBet: 55,     // Call 3-bets often
      doubleBusBarrelFrequency: 30, // Low barrel frequency
      
      wentToShowdown: 35,     // High showdown frequency
      wonAtShowdown: 45,      // Low win rate due to wide range
      
      positionAdjustments: {
        early: 1.0,    // Position doesn't matter much
        middle: 1.0,   // Consistent play
        late: 1.1,     // Slightly more hands late
        blinds: 1.0,   // Defend lots of blinds
      }
    },
    profitability: 'Negative',
    difficulty: 'Easy',
    commonMistakes: [
      'Playing too many weak hands',
      'Calling too much with marginal holdings',
      'Not betting strong hands for value'
    ],
    exploitationStrategies: [
      'Rarely bluff - they call too much',
      'Value bet very thin',
      'Isolate them with strong hands'
    ]
  },

  UNKNOWN: {
    name: 'Unknown Player',
    description: 'New player with no statistical history. Use baseline population stats.',
    baseStats: {
      vpip: 27,          // Population average
      pfr: 18,           // Population average
      aggressionFactor: 2.0,  // Moderate aggression
      
      cBetFrequency: 58,      // Population baseline
      foldToCBet: 50,         // Moderate fold rate
      checkRaiseFrequency: 13, // Population average
      
      threeBetFrequency: 7,   // Population average
      foldToThreeBet: 65,     // Population average
      doubleBusBarrelFrequency: 50, // Balanced
      
      wentToShowdown: 26,     // Population average
      wonAtShowdown: 52,      // Population average
      
      positionAdjustments: {
        early: 1.0,    // No adjustments until we learn
        middle: 1.0,   // Standard play
        late: 1.0,     // No adjustments
        blinds: 1.0,   // Standard defense
      }
    },
    profitability: 'Medium',
    difficulty: 'Medium',
    commonMistakes: [
      'Standard population mistakes',
      'Not adapting to opponents',
      'Predictable play patterns'
    ],
    exploitationStrategies: [
      'Observe and adapt',
      'Use balanced strategy until reads develop',
      'Focus on position and hand strength'
    ]
  }
};

// Helper function to get random player type based on population distribution
export const getRandomPlayerType = (): PlayerType => {
  const distribution = {
    TAG: 0.25,    // 25% of population
    LAG: 0.15,    // 15% of population
    TP: 0.30,     // 30% of population
    LP: 0.25,     // 25% of population
    UNKNOWN: 0.05 // 5% new players
  };
  
  const random = Math.random();
  let cumulative = 0;
  
  for (const [type, probability] of Object.entries(distribution)) {
    cumulative += probability;
    if (random <= cumulative) {
      return type as PlayerType;
    }
  }
  
  return 'UNKNOWN';
};

// Helper function to generate realistic statistics with variance
export const generatePlayerStatistics = (
  playerType: PlayerType,
  variance: number = 0.1
): PlayerStatistics => {
  const baseStats = PLAYER_PROFILES[playerType].baseStats;
  
  // Add realistic variance to base statistics
  const addVariance = (value: number, maxVariance: number = variance) => {
    const varianceAmount = value * maxVariance;
    return Math.max(0, Math.min(100, 
      value + (Math.random() - 0.5) * 2 * varianceAmount
    ));
  };
  
  return {
    vpip: addVariance(baseStats.vpip),
    pfr: addVariance(baseStats.pfr),
    aggressionFactor: Math.max(0.1, 
      baseStats.aggressionFactor + (Math.random() - 0.5) * 0.5
    ),
    
    cBetFrequency: addVariance(baseStats.cBetFrequency),
    foldToCBet: addVariance(baseStats.foldToCBet),
    checkRaiseFrequency: addVariance(baseStats.checkRaiseFrequency),
    
    threeBetFrequency: addVariance(baseStats.threeBetFrequency),
    foldToThreeBet: addVariance(baseStats.foldToThreeBet),
    doubleBusBarrelFrequency: addVariance(baseStats.doubleBusBarrelFrequency),
    
    wentToShowdown: addVariance(baseStats.wentToShowdown),
    wonAtShowdown: addVariance(baseStats.wonAtShowdown),
    
    positionAdjustments: {
      early: Math.max(0.1, baseStats.positionAdjustments.early + (Math.random() - 0.5) * 0.2),
      middle: Math.max(0.1, baseStats.positionAdjustments.middle + (Math.random() - 0.5) * 0.2),
      late: Math.max(0.1, baseStats.positionAdjustments.late + (Math.random() - 0.5) * 0.2),
      blinds: Math.max(0.1, baseStats.positionAdjustments.blinds + (Math.random() - 0.5) * 0.2)
    }
  };
};

// Helper function to determine player behavior in specific situations
export const calculatePlayerAction = (
  playerType: PlayerType,
  situation: 'preflop' | 'flop' | 'turn' | 'river',
  position: 'early' | 'middle' | 'late' | 'blinds',
  handStrength: number, // 1-10 scale
  potOdds: number,
  stackSize: number
): { foldProbability: number; callProbability: number; raiseProbability: number } => {
  const stats = PLAYER_PROFILES[playerType].baseStats;
  const positionMultiplier = stats.positionAdjustments[position];
  
  // Base calculations adjusted for position and hand strength
  let baseFold = 100 - stats.vpip;
  let baseCall = stats.vpip - stats.pfr;
  let baseRaise = stats.pfr;
  
  // Adjust based on hand strength
  const strengthMultiplier = handStrength / 5; // Normalize to 0-2 range
  baseFold *= (2 - strengthMultiplier);
  baseCall *= strengthMultiplier;
  baseRaise *= strengthMultiplier;
  
  // Apply position adjustments
  baseFold *= (2 - positionMultiplier);
  baseCall *= positionMultiplier;
  baseRaise *= positionMultiplier;
  
  // Normalize to 100%
  const total = baseFold + baseCall + baseRaise;
  
  return {
    foldProbability: baseFold / total,
    callProbability: baseCall / total,
    raiseProbability: baseRaise / total
  };
};

export default PLAYER_PROFILES; 