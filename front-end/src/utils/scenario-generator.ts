import { Scenario, Card, Street, Position } from '@/types';
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

  const positions: Position[] = ['UTG', 'UTG+1', 'MP', 'Hijack', 'Cutoff', 'Button', 'Small Blind', 'Big Blind'];
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];

  const getPositionCategory = (p: Position): 'early' | 'middle' | 'late' => {
    if (['UTG', 'UTG+1'].includes(p)) return 'early';
    if (['MP', 'Hijack'].includes(p)) return 'middle';
    return 'late'; // Cutoff, Button, Small Blind, Big Blind
  };

  const positionCategory = getPositionCategory(randomPosition);

  // Positional Adjustments
  let rankThresholdForRaise = 2; // Default: Two Pair
  let rankThresholdForCall = 1;  // Default: One Pair

  switch (positionCategory) {
    case 'early':
      rankThresholdForRaise = 3; // Trips or better
      rankThresholdForCall = 2; // Two Pair
      explanation = `From an early position (${randomPosition}), you need a very strong hand to get involved. `;
      break;
    case 'middle':
      rankThresholdForRaise = 2; // Two Pair or better
      rankThresholdForCall = 1; // Any Pair
      explanation = `From a middle position (${randomPosition}), you can open up your range slightly. `;
      break;
    case 'late':
      rankThresholdForRaise = 2; // Two Pair or better
      rankThresholdForCall = 1; // Any Pair, but can be more aggressive
      explanation = `From a late position (${randomPosition}), you have a significant advantage. `;
      break;
  }

  if (playerHand.rank >= rankThresholdForRaise) {
    correctDecision = 'raise';
    explanation += `With ${playerHand.rankName}, you have a premium hand and should raise for value.`;
  } else if (playerHand.rank >= rankThresholdForCall) {
    correctDecision = 'call';
    explanation += `With ${playerHand.rankName}, your hand is strong enough to call and see the next card.`;
  } else {
    correctDecision = 'fold';
    explanation += `With only ${playerHand.rankName}, your hand is likely dominated. Folding is the best play.`;
  }
  
  // 4. Create scenario object
  return {
    id: `dynamic-${Date.now()}`,
    title: `${randomStreet} Decision - ${randomPosition}`,
    difficulty: 2,
    street: randomStreet,
    position: randomPosition,
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