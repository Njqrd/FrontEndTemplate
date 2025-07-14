import { Scenario, Card, Street } from '@/types';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateHand } from './hand-evaluator';

export const generateScenario = (): Scenario => {
  const deck = shuffleDeck(createDeck());

  // 1. Deal cards
  const { dealtCards: holeCards, remainingDeck: deckAfterHole } = dealCards(deck, 2);
  const { dealtCards: flop, remainingDeck: deckAfterFlop } = dealCards(deckAfterHole, 3);

  const streets: Street[] = ['Flop', 'Turn', 'River'];
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];

  let communityCards: Card[] = flop;
  let deckAfterStreet = deckAfterFlop;

  if (randomStreet === 'Turn' || randomStreet === 'River') {
    const { dealtCards: turn, remainingDeck } = dealCards(deckAfterFlop, 1);
    communityCards = [...flop, ...turn];
    deckAfterStreet = remainingDeck;
  }
  if (randomStreet === 'River') {
    const { dealtCards: river } = dealCards(deckAfterStreet, 1);
    communityCards = [...communityCards, ...river];
  }

  // 2. Evaluate hand
  const playerHand = evaluateHand(holeCards, communityCards);

  // 3. Determine correct decision (simplified logic)
  let correctDecision: 'fold' | 'call' | 'raise' = 'fold';
  let explanation = '';

  if (playerHand.rank >= 2) { // Two Pair or better
    correctDecision = 'raise';
    explanation = `With a strong hand like ${playerHand.rankName}, you should be looking to build the pot. Raising for value is the best play here.`;
  } else if (playerHand.rank >= 1) { // One Pair
    correctDecision = 'call';
    explanation = `With a medium-strength hand like ${playerHand.rankName}, calling is a solid option. It keeps the pot manageable and allows you to re-evaluate if the action gets heavy.`;
  } else {
    correctDecision = 'fold';
    explanation = `With only ${playerHand.rankName}, your hand is very weak. Facing a bet, folding is the most prudent action to avoid losing more chips.`;
  }
  
  // 4. Create scenario object
  return {
    id: `dynamic-${Date.now()}`,
    title: `${randomStreet} Decision`,
    difficulty: 2,
    street: randomStreet,
    position: 'Button', // Simplified
    holeCards,
    communityCards,
    potSize: 25, // Simplified
    effectiveStack: 100,
    action: 'The villain bets half the pot. What do you do?',
    villainType: 'Unknown',
    correctDecision,
    explanation,
    concepts: ['Hand Strength', 'Pot Control', 'Value Betting'],
  };
}; 