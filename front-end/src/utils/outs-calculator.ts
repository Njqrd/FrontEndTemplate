import { Card } from '@/types';
import { rankToValue } from './hand-evaluator';

export interface Draw {
  type: 'Flush' | 'Open-Ended Straight' | 'Gutshot Straight';
  outs: number;
}

const SUITS = ['C', 'D', 'H', 'S'];

export const calculateOuts = (holeCards: Card[], communityCards: Card[]): Draw[] => {
  const allCards = [...holeCards, ...communityCards];
  const draws: Draw[] = [];

  // 1. Flush Draw Calculation
  const suitCounts: { [suit: string]: number } = { C: 0, D: 0, H: 0, S: 0 };
  allCards.forEach(card => {
    suitCounts[card.suit]++;
  });

  for (const suit of SUITS) {
    if (suitCounts[suit] === 4) {
      draws.push({
        type: 'Flush',
        outs: 9, // 13 cards in a suit - 4 on board = 9 outs
      });
    }
  }

  // 2. Straight Draw Calculation
  const uniqueRanks = [...new Set(allCards.map(c => rankToValue[c.rank]))].sort((a, b) => a - b);
  if (uniqueRanks.length >= 4) {
    let isOESD = false;
    // Check for Open-Ended Straight Draws (4 consecutive cards)
    for (let i = 0; i < uniqueRanks.length - 3; i++) {
      if (uniqueRanks[i+3] - uniqueRanks[i] === 3) {
        draws.push({ type: 'Open-Ended Straight', outs: 8 });
        isOESD = true;
        break; // Found the best straight draw, no need to look for gutshots
      }
    }

    // If not OESD, check for Gutshot Straight Draws (4 cards in a 5-card span)
    if (!isOESD) {
      for (let i = 0; i < uniqueRanks.length - 3; i++) {
        if (uniqueRanks[i+3] - uniqueRanks[i] === 4) {
          draws.push({ type: 'Gutshot Straight', outs: 4 });
          break;
        }
      }
    }
  }

  return draws;
}; 