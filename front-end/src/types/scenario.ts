import { Card } from './';

export type Position = 'UTG' | 'UTG+1' | 'MP' | 'Hijack' | 'Cutoff' | 'Button' | 'Small Blind' | 'Big Blind';
export type Street = 'Preflop' | 'Flop' | 'Turn' | 'River';
export type Decision = 'fold' | 'call' | 'raise';

export interface Scenario {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  street: Street;
  position: Position;
  holeCards: [Card, Card];
  communityCards: Card[];
  potSize: number;
  effectiveStack: number;
  action: string; // e.g., "Villain raises to 3BB"
  villainType: 'Tight-Aggressive' | 'Loose-Passive' | 'Unknown';
  correctDecision: Decision;
  explanation: string;
  concepts: string[]; // e.g., ['Pot Odds', 'Implied Odds', 'Position']
} 