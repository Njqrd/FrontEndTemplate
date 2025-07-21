import { Card, Suit, Rank } from '@/types';

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const getCardValue = (rank: Rank): number => {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  if (rank === '10') return 10;
  return parseInt(rank, 10);
};

export const createDeck = (): Card[] => {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({
      suit,
      rank,
      value: getCardValue(rank),
    }))
  );
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], count: number): { dealtCards: Card[]; remainingDeck: Card[] } => {
  if (deck.length < count) {
    throw new Error('Not enough cards in the deck to deal.');
  }
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { dealtCards, remainingDeck };
}; 