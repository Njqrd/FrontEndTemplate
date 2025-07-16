export interface HandRank {
  rankValue: number;
  rankName: string;
  description: string;
}

export const HAND_RANKINGS: HandRank[] = [
  {
    rankValue: 9,
    rankName: 'Royal Flush',
    description: 'A, K, Q, J, 10, all of the same suit.',
  },
  {
    rankValue: 8,
    rankName: 'Straight Flush',
    description: 'Five cards in sequence, all of the same suit.',
  },
  {
    rankValue: 7,
    rankName: 'Four of a Kind',
    description: 'Four cards of the same rank.',
  },
  {
    rankValue: 6,
    rankName: 'Full House',
    description: 'Three of a kind with a pair.',
  },
  {
    rankValue: 5,
    rankName: 'Flush',
    description: 'Any five cards of the same suit, not in sequence.',
  },
  {
    rankValue: 4,
    rankName: 'Straight',
    description: 'Five cards in sequence, but not of the same suit.',
  },
  {
    rankValue: 3,
    rankName: 'Three of a Kind',
    description: 'Three cards of the same rank.',
  },
  {
    rankValue: 2,
    rankName: 'Two Pair',
    description: 'Two different pairs.',
  },
  {
    rankValue: 1,
    rankName: 'One Pair',
    description: 'Two cards of the same rank.',
  },
  {
    rankValue: 0,
    rankName: 'High Card',
    description: 'When you haven\'t made any of the hands above, the highest card plays.',
  },
]; 