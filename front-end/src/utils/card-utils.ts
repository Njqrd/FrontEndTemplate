import { Card, Suit, Rank } from '@/types';
import { SUITS, RANKS, getCardValue } from './deck';

export const parseCardString = (cardString: string): Card => {
  if (cardString.length !== 2) {
    throw new Error(`Invalid card string length: ${cardString}. Expected 2 characters.`);
  }

  const rankChar = cardString[0].toUpperCase();
  const suitChar = cardString[1].toUpperCase();

  const rank: Rank = rankChar as Rank;
  const suit: Suit = suitChar as Suit;

  if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
    throw new Error(`Invalid card string: ${cardString}. Rank or suit is not recognized.`);
  }

  return {
    rank,
    suit,
    value: getCardValue(rank),
  };
};

export const areCardsUnique = (cards: Card[]): boolean => {
  const cardSet = new Set<string>();
  for (const card of cards) {
    const cardIdentifier = `${card.rank}${card.suit}`;
    if (cardSet.has(cardIdentifier)) {
      return false;
    }
    cardSet.add(cardIdentifier);
  }
  return true;
};
