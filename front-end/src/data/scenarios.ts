import { Scenario } from '@/types';

export const scenarios: Scenario[] = [
  {
    id: 'preflop-utg-aces',
    title: 'Pre-flop: Pocket Aces Under the Gun',
    difficulty: 1,
    street: 'Preflop',
    position: 'UTG',
    holeCards: [
      { suit: 'spades', rank: 'A', value: 14 },
      { suit: 'hearts', rank: 'A', value: 14 },
    ],
    communityCards: [],
    potSize: 1.5, // Blinds
    effectiveStack: 100,
    action: 'Action is on you. What is the standard opening play?',
    villainType: 'Unknown',
    correctDecision: 'raise',
    explanation:
      "With Pocket Aces (A-A), you have the strongest starting hand in Texas Hold'em. The standard play from any position, especially Under the Gun (UTG), is to make a standard raise (usually 2.5-3x the big blind) to build the pot and isolate opponents.",
    concepts: ['Starting Hands', 'Position', 'Pre-flop Strategy'],
  },
  {
    id: 'preflop-button-connectors',
    title: 'Pre-flop: Suited Connectors on the Button',
    difficulty: 2,
    street: 'Preflop',
    position: 'Button',
    holeCards: [
      { suit: 'clubs', rank: '8', value: 8 },
      { suit: 'clubs', rank: '7', value: 7 },
    ],
    communityCards: [],
    potSize: 2.5, // Someone raised to 2.5BB
    effectiveStack: 100,
    action: 'A tight player in early position raised to 2.5BB. Everyone else folded to you on the button. What should you do?',
    villainType: 'Tight-Aggressive',
    correctDecision: 'call',
    explanation:
      'Suited connectors like 8s7s have great potential to make strong hands like straights and flushes. Calling from the button is a good play because you have a positional advantage and the price to see the flop is reasonable. Folding is too weak, and raising could put you in a tough spot if the original raiser re-raises.',
    concepts: ['Positional Advantage', 'Implied Odds', 'Suited Connectors'],
  },
]; 