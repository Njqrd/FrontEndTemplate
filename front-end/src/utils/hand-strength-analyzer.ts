import { evaluateCards } from 'phe';

const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const DECK = RANKS.flatMap(rank => SUITS.map(suit => rank + suit));

/**
 * Finds all two-card hands an opponent can have to beat the hero's hand on a given board.
 *
 * @param heroHand - An array of two strings representing the hero's cards (e.g., ['As', 'Kd']).
 * @param board - An array of five strings representing the community cards.
 * @returns An array of two-card hands that beat the hero's hand.
 */
export function findOpponentWinningHands(heroHand: string[], board: string[]): string[][] {
  if (board.length !== 5) {
    return [];
  }

  // Deck as a Set for fast lookup
  const DECK_SET = new Set(DECK);

  // Defensive: filter out undefined/malformed cards and only allow cards in the deck
  const isValidCard = (c: string) => typeof c === 'string' && c.length === 2 && DECK_SET.has(c);
  const hero = heroHand.filter(isValidCard);
  const brd = board.filter(isValidCard);

  // If any card is missing or invalid, bail out
  if (hero.length !== 2 || brd.length !== 5) {
    console.error('Invalid hero or board cards:', heroHand, board);
    return [];
  }

  const heroRank = evaluateCards([...hero, ...brd]);
  const deadCards = new Set([...hero, ...brd]);
  const remainingDeck = DECK.filter(card => !deadCards.has(card));

  const winningHands: string[][] = [];

  for (let i = 0; i < remainingDeck.length; i++) {
    for (let j = i + 1; j < remainingDeck.length; j++) {
      const opponentHand = [remainingDeck[i], remainingDeck[j]];
      if (!isValidCard(opponentHand[0]) || !isValidCard(opponentHand[1])) continue;
      const opponentRank = evaluateCards([...opponentHand, ...brd]);
      if (opponentRank < heroRank) {
        winningHands.push(opponentHand);
      }
    }
  }

  return winningHands;
}
