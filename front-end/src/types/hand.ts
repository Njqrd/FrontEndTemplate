import { Card } from './';

export enum HandRank {
  HIGH_CARD,
  ONE_PAIR,
  TWO_PAIR,
  THREE_OF_A_KIND,
  STRAIGHT,
  FLUSH,
  FULL_HOUSE,
  FOUR_OF_A_KIND,
  STRAIGHT_FLUSH,
  ROYAL_FLUSH,
}

export const HAND_NAMES: { [key in HandRank]: string } = {
  [HandRank.HIGH_CARD]: 'High Card',
  [HandRank.ONE_PAIR]: 'One Pair',
  [HandRank.TWO_PAIR]: 'Two Pair',
  [HandRank.THREE_OF_A_KIND]: 'Three of a Kind',
  [HandRank.STRAIGHT]: 'Straight',
  [HandRank.FLUSH]: 'Flush',
  [HandRank.FULL_HOUSE]: 'Full House',
  [HandRank.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HandRank.STRAIGHT_FLUSH]: 'Straight Flush',
  [HandRank.ROYAL_FLUSH]: 'Royal Flush',
};

export interface EvaluatedHand {
  rank: HandRank;
  rankName: string;
  hand: Card[]; // The best 5 cards that make the hand
  values: number[]; // The numeric values of the cards in the hand for comparison
} 