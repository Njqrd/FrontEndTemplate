import { Card, Suit, Rank } from '@/types';
import { rankToValue } from './hand-evaluator';

// --- TYPE DEFINITIONS ---

/**
 * Represents a specific two-card hand, e.g., ['As', 'Kd'].
 */
export type Hand = [Card, Card];

/**
 * Represents a hand combination string, e.g., 'AKs', '77', 'T9o'.
 */
export type HandCombination = string;

// --- CONSTANTS ---

const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS: Suit[] = ['S', 'H', 'D', 'C'];

// --- CORE FUNCTIONS ---

/**
 * Creates a card object from a rank and suit.
 */
const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  value: rankToValue[rank],
});

/**
 * Parses a hand combination string and returns all possible hands for it.
 * @param combo - The hand combination string (e.g., 'AKs', '77', 'T9o').
 * @returns An array of specific two-card hands.
 */
export const expandCombination = (combo: HandCombination): Hand[] => {
  const hands: Hand[] = [];

  // Case 1: Pocket Pair (e.g., '77')
  if (combo.length === 2 && combo[0] === combo[1]) {
    const rank = combo[0] as Rank;
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        hands.push([createCard(rank, SUITS[i]), createCard(rank, SUITS[j])]);
      }
    }
    return hands;
  }

  // Case 2: Suited or Off-suit (e.g., 'AKs', 'T9o')
  if (combo.length === 3) {
    const rank1 = combo[0] as Rank;
    const rank2 = combo[1] as Rank;
    const type = combo[2];

    if (type === 's') { // Suited
      for (const suit of SUITS) {
        hands.push([createCard(rank1, suit), createCard(rank2, suit)]);
      }
    } else if (type === 'o') { // Off-suit
      for (const suit1 of SUITS) {
        for (const suit2 of SUITS) {
          if (suit1 !== suit2) {
            hands.push([createCard(rank1, suit1), createCard(rank2, suit2)]);
          }
        }
      }
    }
    return hands;
  }

  return hands;
};

/**
 * Parses a full hand range string and expands it into all possible hands.
 * Example range string: "JJ+, AQs+, KJs"
 * - "JJ+" means JJ, QQ, KK, AA.
 * - "AQs+" means AQs, AKs.
 * @param rangeString - The string defining the hand range.
 * @returns An array of specific two-card hands.
 */
export const parseRange = (rangeString: string): Hand[] => {
  const allHands: Hand[] = [];
  const combos = rangeString.split(/[\s,]+/);

  for (const combo of combos) {
    if (combo.includes('+')) {
      // Handle plus notation (e.g., 'JJ+', 'AQs+')
      const base = combo.replace('+', '');
      const rank1Str = base[0] as Rank;
      const rank2Str = base[1] as Rank;
      const rank1Index = RANKS.indexOf(rank1Str);

      if (base.length === 2) { // Pocket pair plus (e.g., 'TT+')
        for (let i = rank1Index; i >= 0; i--) {
          const currentRank = RANKS[i];
          allHands.push(...expandCombination(`${currentRank}${currentRank}`));
        }
      } else if (base.length === 3) { // Suited/Off-suit plus (e.g., 'AJs+')
        const rank2Index = RANKS.indexOf(rank2Str);
        const type = base[2];
        for (let i = rank2Index; i >= 0 && i < rank1Index; i--) {
           const currentRank2 = RANKS[i];
           allHands.push(...expandCombination(`${rank1Str}${currentRank2}${type}`));
        }
      }
    } else {
      allHands.push(...expandCombination(combo));
    }
  }
  
  // Remove duplicates
  const uniqueHands = Array.from(new Set(allHands.map(JSON.stringify))).map(s => JSON.parse(s));
  return uniqueHands;
};


// --- PRE-DEFINED RANGES ---

// Represents a very tight opening range from an early position (UTG).
// Top 6% of hands: 77+, AJs+, KQs, AKo
export const TIGHT_UTG_RAISE_RANGE = "77+, AJs+, KQs, AKo";

// Represents a wider range of hands someone might call with from the button.
// About 20% of hands.
export const LOOSE_BUTTON_CALL_RANGE = "22+, A2s+, K9s+, Q9s+, J9s+, T8s+, 97s+, 87s, 76s, 65s, ATo+, KTo+, QTo+";

// A standard 3-betting (re-raising) range against an open.
// About 8% of hands: 99+, AQs+, AKo
export const STANDARD_3BET_RANGE = "99+, AQs+, AKo";
