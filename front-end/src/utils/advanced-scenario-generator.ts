import { Scenario, Card, Street, Position, Decision } from '@/types';
import { PlayerType, PlayerStatistics } from '@/types/player';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateHand } from './hand-evaluator';
import { PLAYER_PROFILES, getRandomPlayerType, generatePlayerStatistics } from './player-profiles';
import { calculatePlayerAction } from './player-profiles';
import { analyzeDecisionEV } from './advanced-scoring';

export interface AdvancedScenarioConfig {
  playerCount: number;
  stackSizes: number[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  focusArea: 'preflop' | 'flop' | 'turn' | 'river' | 'mixed';
  opponentTypes: PlayerType[];
  positionFocus?: Position;
  handStrengthRange?: [number, number]; // 1-10 scale
}

export interface EnhancedScenario extends Scenario {
  // Additional statistical data
  opponentProfiles: Array<{
    playerId: string;
    type: PlayerType;
    statistics: PlayerStatistics;
    currentImage: 'tight' | 'loose' | 'aggressive' | 'passive';
    recentActions: string[];
  }>;
  
  // Realistic betting action
  bettingAction: {
    preflop: Array<{ position: Position; action: string; amount: number }>;
    flop?: Array<{ position: Position; action: string; amount: number }>;
    turn?: Array<{ position: Position; action: string; amount: number }>;
    river?: Array<{ position: Position; action: string; amount: number }>;
  };
  
  // Statistical context
  expectedFoldFrequency: number;
  boardTexture: 'dry' | 'wet' | 'monotone' | 'paired' | 'connected';
  stackPressure: 'low' | 'medium' | 'high';
  
  // EV-based decision analysis
  evAnalysis: {
    foldEV: number;
    callEV: number;
    raiseEV: number;
    complexity: number; // 1-10 scale
  };
}

/**
 * Generates realistic poker scenarios based on statistical player modeling
 */
export const generateAdvancedScenario = (config: AdvancedScenarioConfig): EnhancedScenario => {
  const {
    playerCount,
    stackSizes,
    difficultyLevel,
    focusArea,
    opponentTypes,
    positionFocus,
    handStrengthRange
  } = config;
  
  // Create deck and deal cards
  const deck = shuffleDeck(createDeck());
  const { dealtCards: holeCards, remainingDeck: deckAfterHole } = dealCards(deck, 2);
  
  // Determine street based on focus area
  const street = determineStreet(focusArea, difficultyLevel);
  
  // Deal appropriate community cards
  const { communityCards, remainingDeck } = dealCommunityCards(deckAfterHole, street);
  
  // Generate opponent profiles
  const opponentProfiles = generateOpponentProfiles(opponentTypes, playerCount - 1);
  
  // Determine position
  const position = positionFocus || getRandomPosition(playerCount);
  
  // Analyze board texture
  const boardTexture = analyzeBoardTexture(communityCards);
  
  // Create realistic betting action
  const bettingAction = generateBettingAction(
    street,
    position,
    opponentProfiles,
    stackSizes,
    boardTexture,
    playerCount
  );
  
  // Calculate pot size from betting action
  const potSize = calculatePotSize(bettingAction, stackSizes[0]);
  
  // Determine call size from last betting action
  const callSize = getCallSize(bettingAction, street, position);
  
  // Calculate stack pressure
  const stackPressure = calculateStackPressure(stackSizes[0], potSize, callSize);
  
  // Generate expected frequencies based on opponent types
  const expectedFoldFrequency = calculateExpectedFoldFrequency(
    opponentProfiles,
    boardTexture,
    stackPressure,
    callSize / potSize
  );
  
  // Perform EV analysis for scenario complexity
  const evAnalysis = performEVAnalysis(
    holeCards,
    communityCards,
    potSize,
    callSize,
    opponentProfiles[0]?.type || 'UNKNOWN',
    position,
    stackSizes[0],
    street
  );
  
  // Determine correct decision based on EV analysis
  const correctDecision = determineCorrectDecision(evAnalysis);
  
  // Generate contextual explanation
  const explanation = generateContextualExplanation(
    holeCards,
    communityCards,
    street,
    position,
    opponentProfiles,
    boardTexture,
    evAnalysis,
    correctDecision
  );
  
  return {
    id: `advanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: generateScenarioTitle(street, position, boardTexture, difficultyLevel),
    difficulty: difficultyLevel,
    street,
    position,
    holeCards: holeCards as [Card, Card],
    communityCards,
    potSize,
    effectiveStack: stackSizes[0],
    action: generateActionDescription(bettingAction, street, position, callSize),
    villainType: opponentProfiles[0]?.type || 'Unknown',
    correctDecision,
    explanation,
    concepts: generateConcepts(street, boardTexture, correctDecision, evAnalysis),
    
    // Enhanced properties
    opponentProfiles,
    bettingAction,
    expectedFoldFrequency,
    boardTexture,
    stackPressure,
    evAnalysis
  };
};

/**
 * Determines the street based on focus area and difficulty
 */
const determineStreet = (focusArea: string, difficulty: number): Street => {
  if (focusArea !== 'mixed') {
    return focusArea as Street;
  }
  
  // Weight distribution based on difficulty
  const streetWeights = {
    1: { Preflop: 0.6, Flop: 0.3, Turn: 0.1, River: 0.0 },
    2: { Preflop: 0.4, Flop: 0.4, Turn: 0.2, River: 0.0 },
    3: { Preflop: 0.3, Flop: 0.4, Turn: 0.2, River: 0.1 },
    4: { Preflop: 0.2, Flop: 0.3, Turn: 0.3, River: 0.2 },
    5: { Preflop: 0.1, Flop: 0.3, Turn: 0.3, River: 0.3 }
  };
  
  const weights = streetWeights[difficulty];
  const random = Math.random();
  let cumulative = 0;
  
  for (const [street, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return street as Street;
    }
  }
  
  return 'Flop';
};

/**
 * Deals community cards based on street
 */
const dealCommunityCards = (deck: Card[], street: Street): { communityCards: Card[]; remainingDeck: Card[] } => {
  let cardCount = 0;
  
  switch (street) {
    case 'Preflop':
      cardCount = 0;
      break;
    case 'Flop':
      cardCount = 3;
      break;
    case 'Turn':
      cardCount = 4;
      break;
    case 'River':
      cardCount = 5;
      break;
  }
  
  if (cardCount === 0) {
    return { communityCards: [], remainingDeck: deck };
  }
  
  const { dealtCards: communityCards, remainingDeck } = dealCards(deck, cardCount);
  return { communityCards, remainingDeck };
};

/**
 * Generates opponent profiles with statistical modeling
 */
const generateOpponentProfiles = (opponentTypes: PlayerType[], count: number) => {
  const profiles = [];
  
  for (let i = 0; i < count; i++) {
    const type = opponentTypes[i] || getRandomPlayerType();
    const statistics = generatePlayerStatistics(type);
    
    profiles.push({
      playerId: `opponent-${i + 1}`,
      type,
      statistics,
      currentImage: determineTableImage(statistics),
      recentActions: generateRecentActions(type, statistics)
    });
  }
  
  return profiles;
};

/**
 * Determines table image based on statistics
 */
const determineTableImage = (stats: PlayerStatistics): 'tight' | 'loose' | 'aggressive' | 'passive' => {
  if (stats.vpip < 20) {
    return stats.aggressionFactor > 2.0 ? 'tight' : 'tight';
  } else if (stats.vpip > 30) {
    return stats.aggressionFactor > 2.0 ? 'loose' : 'loose';
  } else {
    return stats.aggressionFactor > 2.5 ? 'aggressive' : 'passive';
  }
};

/**
 * Generates recent actions based on player type
 */
const generateRecentActions = (type: PlayerType, stats: PlayerStatistics): string[] => {
  const actions = [];
  const profile = PLAYER_PROFILES[type];
  
  // Generate 3-5 recent actions based on player tendencies
  const actionCount = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < actionCount; i++) {
    const actionProb = Math.random();
    
    if (actionProb < stats.vpip / 100) {
      if (Math.random() < stats.pfr / stats.vpip) {
        actions.push('raised');
      } else {
        actions.push('called');
      }
    } else {
      actions.push('folded');
    }
  }
  
  return actions;
};

/**
 * Analyzes board texture for decision making
 */
const analyzeBoardTexture = (communityCards: Card[]): 'dry' | 'wet' | 'monotone' | 'paired' | 'connected' => {
  if (communityCards.length === 0) return 'dry';
  
  const suits = communityCards.map(c => c.suit);
  const ranks = communityCards.map(c => c.value);
  
  // Check for monotone (same suit)
  const suitCounts = suits.reduce((acc, suit) => {
    acc[suit] = (acc[suit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.values(suitCounts).some(count => count >= 3)) {
    return 'monotone';
  }
  
  // Check for paired
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  if (Object.values(rankCounts).some(count => count >= 2)) {
    return 'paired';
  }
  
  // Check for connected
  const sortedRanks = ranks.sort((a, b) => a - b);
  let consecutive = 0;
  
  for (let i = 1; i < sortedRanks.length; i++) {
    if (sortedRanks[i] - sortedRanks[i - 1] === 1) {
      consecutive++;
    }
  }
  
  if (consecutive >= 2) {
    return 'connected';
  }
  
  // Check for wet vs dry
  const range = Math.max(...ranks) - Math.min(...ranks);
  return range > 8 ? 'wet' : 'dry';
};

/**
 * Enhanced betting action interface for comprehensive tracking
 */
interface BettingActionEntry {
  position: Position;
  action: string;
  amount: number;
  playerId: string;
  playerName: string;
  playerType: PlayerType;
  isFolded: boolean;
  isAllIn: boolean;
}

/**
 * Generates realistic betting action based on player types
 */
const generateBettingAction = (
  street: Street,
  heroPosition: Position,
  opponentProfiles: any[],
  stackSizes: number[],
  boardTexture: string,
  playerCount: number
) => {
  const bettingAction = {
    preflop: [] as Array<BettingActionEntry>,
    flop: [] as Array<BettingActionEntry>,
    turn: [] as Array<BettingActionEntry>,
    river: [] as Array<BettingActionEntry>
  };
  
  // Generate preflop action
  const positions: Position[] = ['UTG', 'UTG+1', 'MP', 'Hijack', 'Cutoff', 'Button', 'Small Blind', 'Big Blind'];
  const activePositions = positions.slice(0, playerCount);
  
  let currentBet = 2; // Big blind
  let lastRaisePosition = 'Big Blind';
  let activePlayers = [...activePositions];
  
  for (const position of activePositions) {
    if (position === heroPosition) continue;
    
    const opponentIndex = activePositions.indexOf(position);
    const opponent = opponentProfiles[opponentIndex] || opponentProfiles[0];
    if (!opponent) continue;
    
    const handStrength = Math.random() * 10; // Simplified
    const action = calculatePlayerAction(
      opponent.type,
      'preflop',
      getPositionCategory(position),
      handStrength,
      currentBet / 10, // Simplified pot odds
      stackSizes[0]
    );
    
    let playerAction: string;
    let amount: number;
    let isFolded = false;
    let isAllIn = false;
    
    if (Math.random() < action.raiseProbability) {
      const raiseAmount = currentBet * (2 + Math.random());
      playerAction = 'raise';
      amount = raiseAmount;
      currentBet = raiseAmount;
      lastRaisePosition = position;
      
      // Check for all-in
      if (raiseAmount >= stackSizes[0] * 0.8) {
        playerAction = 'all-in';
        isAllIn = true;
      }
    } else if (Math.random() < action.callProbability) {
      playerAction = 'call';
      amount = currentBet;
    } else {
      playerAction = 'fold';
      amount = 0;
      isFolded = true;
      activePlayers = activePlayers.filter(p => p !== position);
    }
    
    bettingAction.preflop.push({
      position,
      action: playerAction,
      amount,
      playerId: `opponent-${opponentIndex + 1}`,
      playerName: generatePlayerName(opponent.type, opponentIndex),
      playerType: opponent.type,
      isFolded,
      isAllIn
    });
  }
  
  // Add similar logic for flop, turn, river if needed
  if (street !== 'Preflop') {
    generatePostflopAction(bettingAction, street, opponentProfiles, boardTexture, stackSizes, activePlayers);
  }
  
  return bettingAction;
};

/**
 * Generates player names based on type and index
 */
const generatePlayerName = (type: PlayerType, index: number): string => {
  const names = {
    TAG: ['Alex', 'Sarah', 'Mike', 'Lisa', 'David'],
    LAG: ['Tony', 'Nina', 'Jake', 'Emma', 'Rick'],
    TP: ['Bob', 'Mary', 'Tom', 'Sue', 'Jim'],
    LP: ['Charlie', 'Anna', 'Pete', 'Kate', 'Dan'],
    UNKNOWN: ['Player', 'Opponent', 'Villain', 'User', 'Guest']
  };
  
  const typeNames = names[type] || names.UNKNOWN;
  return typeNames[index % typeNames.length];
};

/**
 * Generates post-flop betting action
 */
const generatePostflopAction = (
  bettingAction: any,
  street: Street,
  opponentProfiles: any[],
  boardTexture: string,
  stackSizes: number[],
  activePlayers: Position[]
) => {
  // Enhanced post-flop action generation
  const streetKey = street.toLowerCase();
  
  activePlayers.forEach((position, index) => {
    const opponent = opponentProfiles[index] || opponentProfiles[0];
    if (!opponent) return;
    
    const stats = opponent.statistics;
    const betProbability = street === 'Flop' ? stats.cBetFrequency / 100 : stats.doubleBusBarrelFrequency / 100;
    
    let playerAction: string;
    let amount: number;
    let isFolded = false;
    let isAllIn = false;
    
    if (Math.random() < betProbability) {
      playerAction = 'bet';
      amount = 15 + Math.floor(Math.random() * 20); // 15-35 BB
      
      // Check for all-in
      if (amount >= stackSizes[0] * 0.6) {
        playerAction = 'all-in';
        isAllIn = true;
      }
    } else if (Math.random() < stats.foldToCBet / 100) {
      playerAction = 'fold';
      amount = 0;
      isFolded = true;
    } else {
      playerAction = 'check';
      amount = 0;
    }
    
    bettingAction[streetKey].push({
      position,
      action: playerAction,
      amount,
      playerId: `opponent-${index + 1}`,
      playerName: generatePlayerName(opponent.type, index),
      playerType: opponent.type,
      isFolded,
      isAllIn
    });
  });
};

/**
 * Helper functions for scenario generation
 */
const getRandomPosition = (playerCount: number): Position => {
  const positions: Position[] = ['UTG', 'UTG+1', 'MP', 'Hijack', 'Cutoff', 'Button', 'Small Blind', 'Big Blind'];
  return positions[Math.floor(Math.random() * Math.min(playerCount, positions.length))];
};

const getPositionCategory = (position: Position): 'early' | 'middle' | 'late' | 'blinds' => {
  if (['UTG', 'UTG+1'].includes(position)) return 'early';
  if (['MP', 'Hijack'].includes(position)) return 'middle';
  if (['Cutoff', 'Button'].includes(position)) return 'late';
  return 'blinds';
};

const calculatePotSize = (bettingAction: any, stackSize: number): number => {
  // Simplified pot calculation
  return 25 + Math.floor(Math.random() * 50);
};

const getCallSize = (bettingAction: any, street: Street, position: Position): number => {
  // Simplified call size calculation
  return 15 + Math.floor(Math.random() * 20);
};

const calculateStackPressure = (stackSize: number, potSize: number, callSize: number): 'low' | 'medium' | 'high' => {
  const ratio = stackSize / (potSize + callSize);
  if (ratio > 20) return 'low';
  if (ratio > 10) return 'medium';
  return 'high';
};

const calculateExpectedFoldFrequency = (
  opponentProfiles: any[],
  boardTexture: string,
  stackPressure: string,
  betSizeRatio: number
): number => {
  const opponent = opponentProfiles[0];
  if (!opponent) return 0.5;
  
  let baseFoldRate = opponent.statistics.foldToCBet / 100;
  
  // Adjust for board texture
  if (boardTexture === 'monotone') baseFoldRate *= 0.85; // Fewer folds on scary boards
  if (boardTexture === 'dry') baseFoldRate *= 1.15; // More folds on dry boards
  
  // Adjust for stack pressure
  if (stackPressure === 'high') baseFoldRate *= 0.9; // Call more with short stacks
  
  return Math.min(0.95, Math.max(0.05, baseFoldRate));
};

const performEVAnalysis = (
  holeCards: Card[],
  communityCards: Card[],
  potSize: number,
  callSize: number,
  opponentType: PlayerType,
  position: Position,
  stackSize: number,
  street: Street
) => {
  const context = {
    holeCards,
    communityCards,
    potSize,
    betSize: callSize,
    position,
    opponentType,
    stackSize,
    street
  };
  
  const analysis = analyzeDecisionEV(context, 'call'); // Dummy decision for EV calculation
  
  return {
    foldEV: analysis.foldEV,
    callEV: analysis.callEV,
    raiseEV: analysis.raiseEV,
    complexity: calculateComplexity(analysis, street, holeCards, communityCards)
  };
};

const calculateComplexity = (analysis: any, street: Street, holeCards: Card[], communityCards: Card[]): number => {
  let complexity = 1;
  
  // Street complexity
  const streetComplexity = { Preflop: 1, Flop: 2, Turn: 3, River: 4 };
  complexity += streetComplexity[street];
  
  // EV spread complexity
  const evSpread = Math.max(analysis.foldEV, analysis.callEV, analysis.raiseEV) - 
                   Math.min(analysis.foldEV, analysis.callEV, analysis.raiseEV);
  complexity += evSpread < 0.5 ? 3 : 1; // Close EVs are more complex
  
  // Hand strength complexity
  const handEval = evaluateHand(holeCards, communityCards);
  if (handEval.rank >= 4 && handEval.rank <= 6) complexity += 2; // Marginal hands are complex
  
  return Math.min(10, Math.max(1, complexity));
};

const determineCorrectDecision = (evAnalysis: any): Decision => {
  const { foldEV, callEV, raiseEV } = evAnalysis;
  
  if (raiseEV > callEV && raiseEV > foldEV) return 'raise';
  if (callEV > foldEV) return 'call';
  return 'fold';
};

const generateContextualExplanation = (
  holeCards: Card[],
  communityCards: Card[],
  street: Street,
  position: Position,
  opponentProfiles: any[],
  boardTexture: string,
  evAnalysis: any,
  correctDecision: Decision
): string => {
  const handEval = evaluateHand(holeCards, communityCards);
  const opponent = opponentProfiles[0];
  
  let explanation = `You are in ${position} position with ${handEval.rankName} on a ${boardTexture} board. `;
  
  if (opponent) {
    const profile = PLAYER_PROFILES[opponent.type];
    explanation += `Your opponent is a ${profile.name} (${profile.description}). `;
  }
  
  explanation += `Based on equity calculations and opponent tendencies, the optimal decision is to ${correctDecision}. `;
  
  if (correctDecision === 'raise') {
    explanation += `You have strong equity and can extract value while applying pressure.`;
  } else if (correctDecision === 'call') {
    explanation += `You have sufficient equity to continue but not enough to raise for value.`;
  } else {
    explanation += `Your equity is insufficient to continue against this opponent type.`;
  }
  
  return explanation;
};

const generateScenarioTitle = (street: Street, position: Position, boardTexture: string, difficulty: number): string => {
  const difficultyLabels = ['', 'Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  return `${difficultyLabels[difficulty]} ${street} Decision - ${position} vs ${boardTexture.charAt(0).toUpperCase() + boardTexture.slice(1)} Board`;
};

const generateActionDescription = (bettingAction: any, street: Street, position: Position, callSize: number): string => {
  const actions = bettingAction[street.toLowerCase()] || [];
  const lastAction = actions[actions.length - 1];
  
  if (!lastAction) {
    return `Action is checked to you in ${position} position.`;
  }
  
  if (lastAction.action === 'bets') {
    return `The opponent bets ${lastAction.amount} BB. What do you do?`;
  } else if (lastAction.action === 'raises') {
    return `The opponent raises to ${lastAction.amount} BB. What do you do?`;
  } else {
    return `Action is on you in ${position} position. What do you do?`;
  }
};

const generateConcepts = (street: Street, boardTexture: string, decision: Decision, evAnalysis: any): string[] => {
  const concepts = ['Expected Value', 'Pot Odds', 'Opponent Profiling'];
  
  if (street === 'Preflop') concepts.push('Pre-flop Strategy', 'Position');
  if (street === 'Flop') concepts.push('Continuation Betting', 'Board Texture');
  if (street === 'Turn') concepts.push('Turn Play', 'Bluffing');
  if (street === 'River') concepts.push('River Play', 'Value Betting');
  
  if (boardTexture === 'monotone') concepts.push('Flush Draws');
  if (boardTexture === 'connected') concepts.push('Straight Draws');
  if (boardTexture === 'paired') concepts.push('Full House Draws');
  
  if (decision === 'raise') concepts.push('Value Betting', 'Fold Equity');
  if (decision === 'call') concepts.push('Pot Control', 'Implied Odds');
  if (decision === 'fold') concepts.push('Hand Selection', 'Equity Calculation');
  
  return concepts.slice(0, 6); // Limit to 6 concepts
};

export default generateAdvancedScenario; 