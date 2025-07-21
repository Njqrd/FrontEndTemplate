import { Card } from './index';

// Enhanced Player Type Classifications with Statistical Ranges
export type PlayerType = 'TAG' | 'LAG' | 'TP' | 'LP' | 'UNKNOWN';

export interface PlayerStatistics {
  // Core Statistics
  vpip: number;        // Voluntarily Put money In Pot (15-50%)
  pfr: number;         // Pre-Flop Raise (3-25%)
  aggressionFactor: number; // (Bets + Raises) / Calls (0.5-6.0)
  
  // Post-flop Behavior
  cBetFrequency: number;     // Continuation Bet Frequency (40-70%)
  foldToCBet: number;        // Fold to Continuation Bet (35-65%)
  checkRaiseFrequency: number; // Check-Raise Frequency (8-18%)
  
  // Advanced Statistics
  threeBetFrequency: number; // 3-Bet Frequency (3-12%)
  foldToThreeBet: number;    // Fold to 3-Bet (55-75%)
  doubleBusBarrelFrequency: number; // Double Barrel Frequency (40-65%)
  
  // Showdown Statistics
  wentToShowdown: number;    // Went to Showdown (20-35%)
  wonAtShowdown: number;     // Won at Showdown (45-65%)
  
  // Position-based adjustments
  positionAdjustments: {
    early: number;   // UTG, UTG+1 multiplier
    middle: number;  // MP, Hijack multiplier
    late: number;    // CO, BTN multiplier
    blinds: number;  // SB, BB multiplier
  };
}

export interface PlayerTypeProfile {
  name: string;
  description: string;
  baseStats: PlayerStatistics;
  profitability: 'High' | 'Medium' | 'Low' | 'Negative';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  commonMistakes: string[];
  exploitationStrategies: string[];
}

// Player History and Decision Tracking
export interface PlayerDecisionHistory {
  handId: string;
  position: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
  amount?: number;
  street: 'Preflop' | 'Flop' | 'Turn' | 'River';
  potSize: number;
  equity: number;
  ev: number;
  timestamp: number;
  handStrength: string;
  result: 'win' | 'loss' | 'fold';
}

export interface PlayerSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalHands: number;
  decisions: PlayerDecisionHistory[];
  vpipThisSession: number;
  pfrThisSession: number;
  netResult: number;
  biggestPot: number;
  longestStreak: number;
}

// Enhanced Player Interface
export interface Player {
  id: string;
  name: string;
  chips: number;
  position: number; // 0-9 seat positions around table
  isHero: boolean; // The player making decisions (training player)
  isActive: boolean; // Currently in the hand
  holeCards: [Card, Card] | null; // null for face-down cards
  isDealer: boolean;
  isBigBlind: boolean;
  isSmallBlind: boolean;
  isAllIn: boolean;
  currentBet: number;
  hasActed: boolean;
  avatarColor?: string; // For visual identification
  
  // Enhanced Statistical Modeling
  playerType: PlayerType;
  statistics: PlayerStatistics;
  decisionHistory: PlayerDecisionHistory[];
  currentSession: PlayerSession | null;
  
  // Dynamic Adjustments
  stackSize: number;
  tiltLevel: number; // 0-100, affects decision making
  imageAtTable: 'tight' | 'loose' | 'aggressive' | 'passive' | 'unknown';
  
  // Training-specific
  expectedFoldFrequency: number;
  expectedCallFrequency: number;
  expectedRaiseFrequency: number;
}

export interface TableSeating {
  maxPlayers: number;
  currentPlayers: Player[];
  buttonPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
}

export interface SeatPosition {
  angle: number; // Angle in degrees around the table
  radius: number; // Distance from center
  x: number; // Calculated x position
  y: number; // Calculated y position
}

export interface PlayerAction {
  playerId: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
  amount?: number;
  timestamp: number;
}

export interface GameSettings {
  minPlayers: number;
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  startingChips: number;
  autoAdvance: boolean;
} 