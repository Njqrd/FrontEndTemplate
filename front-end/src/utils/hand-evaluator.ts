import { Card, EvaluatedHand, HandRank, HAND_NAMES, Suit } from '@/types';

export const rankToValue: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// --- Helper Functions ---

/**
 * Sorts cards by value in descending order.
 */
const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => b.value - a.value);
};

/**
 * Groups cards by rank.
 * @returns A map where keys are ranks (values) and values are the cards of that rank.
 */
const getRankGroups = (cards: Card[]): Map<number, Card[]> => {
  const groups = new Map<number, Card[]>();
  for (const card of cards) {
    if (!groups.has(card.value)) {
      groups.set(card.value, []);
    }
    groups.get(card.value)!.push(card);
  }
  return groups;
};

// --- Hand Checkers ---

const checkForStraightFlush = (cards: Card[]): Card[] | null => {
  const suitCounts = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!suitCounts.has(card.suit)) {
      suitCounts.set(card.suit, []);
    }
    suitCounts.get(card.suit)!.push(card);
  }

  for (const flushCards of suitCounts.values()) {
    if (flushCards.length >= 5) {
      const straightFlush = checkForStraight(flushCards);
      if (straightFlush) {
        return straightFlush;
      }
    }
  }
  return null;
};

const checkForFlush = (cards: Card[]): Card[] | null => {
  const suitCounts = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!suitCounts.has(card.suit)) {
      suitCounts.set(card.suit, []);
    }
    suitCounts.get(card.suit)!.push(card);
  }

  for (const flushCards of suitCounts.values()) {
    if (flushCards.length >= 5) {
      return sortCards(flushCards).slice(0, 5);
    }
  }
  return null;
};

const checkForStraight = (cards: Card[]): Card[] | null => {
  const uniqueCards = sortCards(
    Array.from(new Map(cards.map(c => [c.value, c])).values())
  );

  // Handle A-2-3-4-5 straight (wheel)
  if (
    uniqueCards.length >= 5 &&
    uniqueCards[0].value === 14 && // Ace
    uniqueCards.find(c => c.value === 5) &&
    uniqueCards.find(c => c.value === 4) &&
    uniqueCards.find(c => c.value === 3) &&
    uniqueCards.find(c => c.value === 2)
  ) {
    return [
      uniqueCards.find(c => c.value === 5)!,
      uniqueCards.find(c => c.value === 4)!,
      uniqueCards.find(c => c.value === 3)!,
      uniqueCards.find(c => c.value === 2)!,
      uniqueCards.find(c => c.value === 14)!, // Ace as low card
    ];
  }

  for (let i = 0; i <= uniqueCards.length - 5; i++) {
    const slice = uniqueCards.slice(i, i + 5);
    if (slice[0].value - slice[4].value === 4) {
      return slice;
    }
  }

  return null;
};

// --- Main Evaluator ---

export const evaluateHand = (holeCards: Card[], communityCards: Card[]): EvaluatedHand => {
  const allCards = sortCards([...holeCards, ...communityCards]);
  
  // 1. Check for Straight Flush / Royal Flush
  const straightFlush = checkForStraightFlush(allCards);
  if (straightFlush) {
    const isRoyal = straightFlush[0].value === 14 && straightFlush[1].value === 13;
    const rank = isRoyal ? HandRank.ROYAL_FLUSH : HandRank.STRAIGHT_FLUSH;
    return {
      rank,
      rankName: HAND_NAMES[rank],
      hand: straightFlush,
      values: straightFlush.map(c => c.value),
    };
  }

  // 2. Check for Four of a Kind, Full House, etc.
  const rankGroups = getRankGroups(allCards);
  const groups = Array.from(rankGroups.values()).sort((a, b) => b.length - a.length);
  const quads = groups.filter(g => g.length === 4);
  const trips = groups.filter(g => g.length === 3);
  const pairs = groups.filter(g => g.length === 2);

  if (quads.length > 0) {
    const fourOfAKind = quads[0];
    const kickers = allCards.filter(c => c.value !== fourOfAKind[0].value).slice(0, 1);
    const hand = [...fourOfAKind, ...kickers];
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      rankName: HAND_NAMES[HandRank.FOUR_OF_A_KIND],
      hand,
      values: [fourOfAKind[0].value, kickers[0].value],
    };
  }
  
  if (trips.length > 0 && pairs.length > 0) {
    const fullHouseTrips = trips[0];
    const fullHousePair = pairs[0];
    const hand = [...fullHouseTrips, ...fullHousePair];
    return {
      rank: HandRank.FULL_HOUSE,
      rankName: HAND_NAMES[HandRank.FULL_HOUSE],
      hand,
      values: [fullHouseTrips[0].value, fullHousePair[0].value],
    };
  }
  
  // 3. Check for Flush
  const flush = checkForFlush(allCards);
  if (flush) {
    return {
      rank: HandRank.FLUSH,
      rankName: HAND_NAMES[HandRank.FLUSH],
      hand: flush,
      values: flush.map(c => c.value),
    };
  }
  
  // 4. Check for Straight
  const straight = checkForStraight(allCards);
  if (straight) {
    return {
      rank: HandRank.STRAIGHT,
      rankName: HAND_NAMES[HandRank.STRAIGHT],
      hand: straight,
      values: straight.map(c => c.value),
    };
  }
  
  // 5. Check for Three of a Kind
  if (trips.length > 0) {
    const threeOfAKind = trips[0];
    const kickers = allCards.filter(c => c.value !== threeOfAKind[0].value).slice(0, 2);
    const hand = [...threeOfAKind, ...kickers];
    return {
      rank: HandRank.THREE_OF_A_KIND,
      rankName: HAND_NAMES[HandRank.THREE_OF_A_KIND],
      hand,
      values: [threeOfAKind[0].value, ...kickers.map(k => k.value)],
    };
  }
  
  // 6. Check for Two Pair
  if (pairs.length >= 2) {
    const highPair = sortCards(pairs[0])[0].value > sortCards(pairs[1])[0].value ? pairs[0] : pairs[1];
    const lowPair = highPair === pairs[0] ? pairs[1] : pairs[0];
    const kickers = allCards.filter(c => c.value !== highPair[0].value && c.value !== lowPair[0].value).slice(0, 1);
    const hand = [...highPair, ...lowPair, ...kickers];
    return {
      rank: HandRank.TWO_PAIR,
      rankName: HAND_NAMES[HandRank.TWO_PAIR],
      hand,
      values: [highPair[0].value, lowPair[0].value, kickers[0].value],
    };
  }
  
  // 7. Check for One Pair
  if (pairs.length === 1) {
    const pair = pairs[0];
    const kickers = allCards.filter(c => c.value !== pair[0].value).slice(0, 3);
    const hand = [...pair, ...kickers];
    return {
      rank: HandRank.ONE_PAIR,
      rankName: HAND_NAMES[HandRank.ONE_PAIR],
      hand,
      values: [pair[0].value, ...kickers.map(k => k.value)],
    };
  }
  
  // 8. Fallback to High Card
  const highCardHand = allCards.slice(0, 5);
  return {
    rank: HandRank.HIGH_CARD,
    rankName: HAND_NAMES[HandRank.HIGH_CARD],
    hand: highCardHand,
    values: highCardHand.map(c => c.value),
  };
}; 