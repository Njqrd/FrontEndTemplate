import { Card, Suit, Rank } from '@/types';
import { rankToValue, evaluateHand, compareHands } from './hand-evaluator';
import { createDeck } from './deck';

export interface HandAnalysis {
  handType: string;
  currentStrength: number;
  requiredCards: Card[];
  probability: number;
  isPlayerPossible: boolean;
  isOpponentPossible: boolean;
  isMade: boolean; // true if hand is already complete
}

export interface AnalysisResult {
  playerAnalysis: HandAnalysis[];
  opponentThreats: HandAnalysis[];
  currentPlayerHand: {
    type: string;
    strength: number;
  };
}

// Helper function to get all cards of a specific suit
const getCardsOfSuit = (suit: Suit): Card[] => {
  const ranks: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  return ranks.map(rank => ({ suit, rank, value: rankToValue[rank] }));
};

// Helper function to get all cards of a specific rank
const getCardsOfRank = (rank: Rank): Card[] => {
  const suits: Suit[] = ['H', 'D', 'C', 'S'];
  return suits.map(suit => ({ suit, rank, value: rankToValue[rank] }));
};

// Helper function to remove used cards from available cards
const removeUsedCards = (availableCards: Card[], usedCards: Card[]): Card[] => {
  return availableCards.filter(available => 
    !usedCards.some(used => 
      used.suit === available.suit && used.rank === available.rank
    )
  );
};

// Helper to generate all unique two-card combinations from a deck
const generateTwoCardCombinations = (deck: Card[]): Card[][] => {
  const combinations: Card[][] = [];
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      combinations.push([deck[i], deck[j]]);
    }
  }
  return combinations;
};

export const enumerateBeatingHands = (
  heroHoleCards: Card[],
  communityCards: Card[]
): Card[][] => {
  const beatingHands: Card[][] = [];
  const fullDeck = createDeck();
  const knownCards = [...heroHoleCards, ...communityCards];

  const availableCards = removeUsedCards(fullDeck, knownCards);
  const possibleOpponentHands = generateTwoCardCombinations(availableCards);

  const heroHandEvaluated = evaluateHand(heroHoleCards, communityCards);

  for (const opponentHand of possibleOpponentHands) {
    const opponentHandEvaluated = evaluateHand(opponentHand, communityCards);
    const comparisonResult = compareHands(opponentHandEvaluated, heroHandEvaluated);

    // If opponentHand is stronger than heroHand
    if (comparisonResult === 1) {
      beatingHands.push(opponentHand);
    }
  }

  return beatingHands;
};

// Analyze flush possibilities
const analyzeFlush = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Count cards by suit
  const suitCounts: { [key in Suit]: Card[] } = { H: [], D: [], C: [], S: [] };
  allCards.forEach(card => {
    suitCounts[card.suit].push(card);
  });
  
  // Check each suit
  Object.entries(suitCounts).forEach(([suit, cards]) => {
    if (cards.length >= 3) { // Need at least 3 for a potential flush
      const suitCards = getCardsOfSuit(suit as Suit);
      const remainingCards = removeUsedCards(suitCards, allCards);
      
      const isMade = cards.length >= 5;
      const cardsNeeded = isMade ? 0 : 5 - cards.length;
      
      const analysis: HandAnalysis = {
        handType: `${suit} Flush`,
        currentStrength: 5, // Flush rank
        requiredCards: isMade ? [] : remainingCards.slice(0, cardsNeeded),
        probability: 0, // Will calculate later
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: isMade
      };
      
      analyses.push(analysis);
    }
  });
  
  return analyses;
};

// Analyze straight flush possibilities
const analyzeStraightFlush = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Group cards by suit
  const suitGroups: { [key in Suit]: Card[] } = { H: [], D: [], C: [], S: [] };
  allCards.forEach(card => {
    suitGroups[card.suit].push(card);
  });
  
  // Check each suit for straight flush possibilities
  Object.entries(suitGroups).forEach(([suit, cards]) => {
    if (cards.length >= 3) { // Need at least 3 cards of same suit
      // Sort cards by value (high to low)
      const sortedCards = cards.sort((a, b) => b.value - a.value);
      const uniqueValues = [...new Set(sortedCards.map(c => c.value))].sort((a, b) => b - a);
      
      if (uniqueValues.length < 3) return;
      
      // Check for potential straight flush sequences
      const checkStraightFlushPossibility = (startValue: number, endValue: number) => {
        const neededValues = [];
        for (let i = startValue; i <= endValue; i++) {
          neededValues.push(i);
        }
        
        // Count how many of the needed values we have in this suit
        const haveValues = neededValues.filter(val => uniqueValues.includes(val));
        const missingValues = neededValues.filter(val => !uniqueValues.includes(val));
        
        // Need at least 3 cards in suit for potential straight flush AND no more than 2 missing
        if (haveValues.length >= 3 && missingValues.length <= 2) {
          const requiredCards: Card[] = [];
          
          // Get all cards for missing values in this specific suit
          missingValues.forEach(value => {
            const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
            if (rank) {
              const requiredCard = { suit: suit as Suit, rank, value };
              // Only add if this card is not already used (not in allCards)
              const isCardUsed = allCards.some(card => 
                card.suit === requiredCard.suit && card.rank === requiredCard.rank
              );
              if (!isCardUsed) {
                requiredCards.push(requiredCard);
              }
            }
          });
          
          // Only return this analysis if we actually have required cards to suggest
          // (i.e., not all missing cards are already used)
          if (requiredCards.length > 0) {
            const isMade = missingValues.length === 0;
            const straightFlushType = isMade ? 'Straight Flush' : 'Straight Flush Draw';
            
            return {
              handType: `${suit} ${straightFlushType} (${endValue === 14 ? 'A' : endValue}-high)`,
              currentStrength: 8, // Straight flush rank
              requiredCards: isMade ? [] : requiredCards,
              probability: 0,
              isPlayerPossible: true,
              isOpponentPossible: true,
              isMade: isMade
            };
          }
        }
        
        return null;
      };
      
      // Check all possible 5-card straight flush sequences
      const straightFlushRanges = [
        [10, 14], // T-J-Q-K-A (Royal Flush)
        [9, 13],  // 9-T-J-Q-K
        [8, 12],  // 8-9-T-J-Q
        [7, 11],  // 7-8-9-T-J
        [6, 10],  // 6-7-8-9-T
        [5, 9],   // 5-6-7-8-9
        [4, 8],   // 4-5-6-7-8
        [3, 7],   // 3-4-5-6-7
        [2, 6],   // 2-3-4-5-6
        [1, 5],   // A-2-3-4-5 (wheel straight flush)
      ];
      
      // Special handling for wheel straight flush (A-2-3-4-5)
      const wheelValues = [14, 2, 3, 4, 5]; // A, 2, 3, 4, 5
      const haveWheelValues = wheelValues.filter(val => uniqueValues.includes(val));
      const missingWheelValues = wheelValues.filter(val => !uniqueValues.includes(val));
      
      if (haveWheelValues.length >= 3 && missingWheelValues.length <= 2) {
        const requiredCards: Card[] = [];
        missingWheelValues.forEach(value => {
          const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
          if (rank) {
            const requiredCard = { suit: suit as Suit, rank, value };
            // Only add if this card is not already used (not in allCards)
            const isCardUsed = allCards.some(card => 
              card.suit === requiredCard.suit && card.rank === requiredCard.rank
            );
            if (!isCardUsed) {
              requiredCards.push(requiredCard);
            }
          }
        });
        
        // Only add wheel straight flush if we have required cards to suggest
        if (requiredCards.length > 0 || missingWheelValues.length === 0) {
          const isMade = missingWheelValues.length === 0;
          const straightFlushType = isMade ? 'Straight Flush' : 'Straight Flush Draw';
          
          analyses.push({
            handType: `${suit} ${straightFlushType} (Wheel)`,
            currentStrength: 8,
            requiredCards: isMade ? [] : requiredCards,
            probability: 0,
            isPlayerPossible: true,
            isOpponentPossible: true,
            isMade: isMade
          });
        }
      }
      
      // Check regular straight flush possibilities
      for (const [start, end] of straightFlushRanges.slice(0, -1)) {
        const result = checkStraightFlushPossibility(start, end);
        if (result) {
          analyses.push(result);
        }
      }
    }
  });
  
  return analyses;
};

// Analyze straight possibilities
const analyzeStraight = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Get unique ranks and sort them by value (high to low)
  const uniqueRanks = [...new Set(allCards.map(c => c.value))].sort((a, b) => b - a);
  
  if (uniqueRanks.length < 3) return analyses;
  
  // Check for potential straights by looking at consecutive sequences
  const checkStraightPossibility = (startValue: number, endValue: number) => {
    const neededValues = [];
    for (let i = startValue; i <= endValue; i++) {
      neededValues.push(i);
    }
    
    // Count how many of the needed values we have
    const haveValues = neededValues.filter(val => uniqueRanks.includes(val));
    const missingValues = neededValues.filter(val => !uniqueRanks.includes(val));
    
    // Need at least 3 cards for a potential straight
    if (haveValues.length >= 3 && missingValues.length <= 2) {
      const requiredCards: Card[] = [];
      
      // Get all cards for missing values
      missingValues.forEach(value => {
        const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
        if (rank) {
          requiredCards.push(...getCardsOfRank(rank));
        }
      });
      
      const isMade = missingValues.length === 0;
      const straightType = missingValues.length === 0 ? 'Straight' : 
                          missingValues.length === 1 ? 'Gutshot Straight' : 
                          'Open-Ended Straight';
      
      return {
        handType: `${straightType} (${endValue === 14 ? 'A' : endValue}-high)`,
        currentStrength: 4,
        requiredCards: isMade ? [] : requiredCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: isMade
      };
    }
    
    return null;
  };
  
  // Check all possible 5-card straights
  const straightRanges = [
    [10, 14], // T-J-Q-K-A
    [9, 13],  // 9-T-J-Q-K
    [8, 12],  // 8-9-T-J-Q
    [7, 11],  // 7-8-9-T-J
    [6, 10],  // 6-7-8-9-T
    [5, 9],   // 5-6-7-8-9
    [4, 8],   // 4-5-6-7-8
    [3, 7],   // 3-4-5-6-7
    [2, 6],   // 2-3-4-5-6
    [1, 5],   // A-2-3-4-5 (wheel)
  ];
  
  // Special handling for wheel (A-2-3-4-5)
  if (straightRanges[9]) {
    const wheelValues = [14, 2, 3, 4, 5]; // A, 2, 3, 4, 5
    const haveWheelValues = wheelValues.filter(val => uniqueRanks.includes(val));
    const missingWheelValues = wheelValues.filter(val => !uniqueRanks.includes(val));
    
    if (haveWheelValues.length >= 3 && missingWheelValues.length <= 2) {
      const requiredCards: Card[] = [];
      missingWheelValues.forEach(value => {
        const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
        if (rank) {
          requiredCards.push(...getCardsOfRank(rank));
        }
      });
      
      const isMade = missingWheelValues.length === 0;
      const straightType = missingWheelValues.length === 0 ? 'Straight' : 
                          missingWheelValues.length === 1 ? 'Gutshot Straight' : 
                          'Open-Ended Straight';
      
      analyses.push({
        handType: `${straightType} (Wheel)`,
        currentStrength: 4,
        requiredCards: isMade ? [] : requiredCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: isMade
      });
    }
  }
  
  // Check regular straights
  for (const [start, end] of straightRanges.slice(0, -1)) {
    const result = checkStraightPossibility(start, end);
    if (result) {
      analyses.push(result);
    }
  }
  
  return analyses;
};

// Analyze pair possibilities (enhanced)
const analyzePairs = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Count cards by rank
  const rankCounts: { [key: number]: Card[] } = {};
  allCards.forEach(card => {
    if (!rankCounts[card.value]) {
      rankCounts[card.value] = [];
    }
    rankCounts[card.value].push(card);
  });
  
  const pairs = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 2);
  const trips = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 3);
  const quads = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 4);
  
  // Check for potential trips from existing pairs
  pairs.forEach(([value, cards]) => {
    const remainingCards = getCardsOfRank(cards[0].rank);
    const availableCards = removeUsedCards(remainingCards, allCards);
    
    if (availableCards.length > 0) {
      analyses.push({
        handType: `Three of a Kind (${cards[0].rank}s)`,
        currentStrength: 3,
        requiredCards: availableCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: false
      });
    }
  });
  
  // Check for potential quads from existing trips
  trips.forEach(([value, cards]) => {
    const remainingCards = getCardsOfRank(cards[0].rank);
    const availableCards = removeUsedCards(remainingCards, allCards);
    
    if (availableCards.length > 0) {
      analyses.push({
        handType: `Four of a Kind (${cards[0].rank}s)`,
        currentStrength: 7,
        requiredCards: availableCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: false
      });
    }
  });
  
  return analyses;
};

// Analyze two pair possibilities (new function)
const analyzeTwoPair = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Count cards by rank
  const rankCounts: { [key: number]: Card[] } = {};
  allCards.forEach(card => {
    if (!rankCounts[card.value]) {
      rankCounts[card.value] = [];
    }
    rankCounts[card.value].push(card);
  });
  
  const pairs = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 2);
  const singles = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 1);
  
  // If we have one pair, check for potential second pair
  if (pairs.length === 1 && singles.length > 0) {
    const requiredCards: Card[] = [];
    
    // Get cards that would make a second pair
    singles.forEach(([value, cards]) => {
      const remainingCards = getCardsOfRank(cards[0].rank);
      const availableCards = removeUsedCards(remainingCards, allCards);
      requiredCards.push(...availableCards);
    });
    
    if (requiredCards.length > 0) {
      analyses.push({
        handType: 'Two Pair',
        currentStrength: 2,
        requiredCards: requiredCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: false
      });
    }
  }
  
  return analyses;
};

// Analyze full house possibilities (new function)
const analyzeFullHouse = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const allCards = [...holeCards, ...communityCards];
  const analyses: HandAnalysis[] = [];
  
  // Count cards by rank
  const rankCounts: { [key: number]: Card[] } = {};
  allCards.forEach(card => {
    if (!rankCounts[card.value]) {
      rankCounts[card.value] = [];
    }
    rankCounts[card.value].push(card);
  });
  
  const pairs = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 2);
  const trips = Object.entries(rankCounts).filter(([_, cards]) => cards.length === 3);
  
  // Case 1: Have trips, need a pair
  if (trips.length === 1 && pairs.length === 0) {
    const requiredCards: Card[] = [];
    
    // Get cards that would make a pair (excluding the trips rank)
    Object.entries(rankCounts).forEach(([value, cards]) => {
      if (cards.length === 1) {
        const remainingCards = getCardsOfRank(cards[0].rank);
        const availableCards = removeUsedCards(remainingCards, allCards);
        requiredCards.push(...availableCards);
      }
    });
    
    if (requiredCards.length > 0) {
      analyses.push({
        handType: `Full House (${trips[0][1][0].rank}s full)`,
        currentStrength: 6,
        requiredCards: requiredCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: false
      });
    }
  }
  
  // Case 2: Have pair, need trips
  if (pairs.length === 1 && trips.length === 0) {
    const requiredCards: Card[] = [];
    
    // Get cards that would make trips (excluding the pair rank)
    Object.entries(rankCounts).forEach(([value, cards]) => {
      if (cards.length === 1) {
        const remainingCards = getCardsOfRank(cards[0].rank);
        const availableCards = removeUsedCards(remainingCards, allCards);
        if (availableCards.length >= 2) {
          requiredCards.push(...availableCards.slice(0, 2));
        }
      }
    });
    
    if (requiredCards.length > 0) {
      analyses.push({
        handType: 'Full House',
        currentStrength: 6,
        requiredCards: requiredCards,
        probability: 0,
        isPlayerPossible: true,
        isOpponentPossible: true,
        isMade: false
      });
    }
  }
  
  return analyses;
};

// Analyze opponent straight flush threats (board cards only)
const analyzeOpponentStraightFlushThreats = (communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  
  // Group board cards by suit
  const suitGroups: { [key in Suit]: Card[] } = { H: [], D: [], C: [], S: [] };
  communityCards.forEach(card => {
    suitGroups[card.suit].push(card);
  });
  
  // Check each suit for straight flush potential
  Object.entries(suitGroups).forEach(([suit, cards]) => {
    if (cards.length >= 2) { // Need at least 2 cards of same suit on board for opponent threat
      const uniqueValues = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);
      
      if (uniqueValues.length >= 2) {
        // Check for potential straight flush sequences
        const checkOpponentStraightFlushThreat = (startValue: number, endValue: number) => {
          const neededValues = [];
          for (let i = startValue; i <= endValue; i++) {
            neededValues.push(i);
          }
          
          // Count how many of the needed values are on the board in this suit
          const boardHasValues = neededValues.filter(val => uniqueValues.includes(val));
          const missingValues = neededValues.filter(val => !uniqueValues.includes(val));
          
          // If board has 2+ cards in sequence and missing ≤ 3, it's a potential threat
          if (boardHasValues.length >= 2 && missingValues.length <= 3) {
            const requiredCards: Card[] = [];
            missingValues.forEach(value => {
              const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
              if (rank) {
                // For a straight flush threat, the required card must be of the correct suit
                const requiredCard: Card = { suit: suit as Suit, rank, value };
                // Ensure this specific card is not on the board
                if (!communityCards.some(c => c.rank === rank && c.suit === suit)) {
                  requiredCards.push(requiredCard);
                }
              }
            });

            return {
              handType: `${suit} Straight Flush Threat`,
              currentStrength: 8,
              requiredCards: requiredCards,
              probability: boardHasValues.length >= 3 ? 0.15 : 0.05,
              isPlayerPossible: false,
              isOpponentPossible: true,
              isMade: boardHasValues.length >= 4 // Very unlikely but possible
            };
          }
          
          return null;
        };
        
        // Check all possible straight flush ranges
        const straightFlushRanges = [
          [10, 14], [9, 13], [8, 12], [7, 11], [6, 10], 
          [5, 9], [4, 8], [3, 7], [2, 6]
        ];
        
        for (const [start, end] of straightFlushRanges) {
          const threat = checkOpponentStraightFlushThreat(start, end);
          if (threat) {
            threats.push(threat);
            break; // Only add one straight flush threat per suit
          }
        }
        
        // Check wheel straight flush
        const wheelValues = [14, 2, 3, 4, 5];
        const boardHasWheelValues = wheelValues.filter(val => uniqueValues.includes(val));
        
        if (boardHasWheelValues.length >= 2) {
          const requiredCards: Card[] = [];
          const missingWheelValues = wheelValues.filter(val => !uniqueValues.includes(val));
          missingWheelValues.forEach(value => {
            const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
            if (rank) {
              const requiredCard: Card = { suit: suit as Suit, rank, value };
              if (!communityCards.some(c => c.rank === rank && c.suit === suit)) {
                requiredCards.push(requiredCard);
              }
            }
          });

          threats.push({
            handType: `${suit} Straight Flush Threat (Wheel)`,
            currentStrength: 8,
            requiredCards: requiredCards,
            probability: boardHasWheelValues.length >= 3 ? 0.15 : 0.05,
            isPlayerPossible: false,
            isOpponentPossible: true,
            isMade: boardHasWheelValues.length >= 4
          });
        }
      }
    }
  });
  
  return threats;
};

const analyzeOpponentStraightThreats = (communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  const boardValues = [...new Set(communityCards.map(c => c.value))];

  if (boardValues.length < 2) return [];

  const straightRanges = [
    [10, 14], [9, 13], [8, 12], [7, 11], [6, 10], 
    [5, 9], [4, 8], [3, 7], [2, 6], [1, 5] // Added wheel
  ];

  straightRanges.forEach(range => {
    const start = range[0];
    const end = range[1];
    let neededValues: number[] = [];
    if(start === 1 && end === 5) { // Wheel case
      neededValues = [14, 2, 3, 4, 5];
    } else {
      for (let i = start; i <= end; i++) {
        neededValues.push(i);
      }
    }

    const boardHas = neededValues.filter(v => boardValues.includes(v));
    const opponentNeeds = neededValues.filter(v => !boardValues.includes(v));

    // Threat exists if board has >= 2 cards for the straight, and opponent needs <= 3 cards
    if (boardHas.length >= 2 && opponentNeeds.length <= 3) {
      const requiredCards: Card[] = [];
      opponentNeeds.forEach(value => {
        const rank = Object.keys(rankToValue).find(key => rankToValue[key] === value) as Rank;
        const cardsOfRank = getCardsOfRank(rank);
        const available = removeUsedCards(cardsOfRank, communityCards);
        requiredCards.push(...available);
      });
      
      if(requiredCards.length > 0) {
        const handType = `Straight Threat (${end === 14 ? 'A' : end === 5 ? '5' : end}-high)`;
        // Avoid duplicate threats for the same range
        if (!threats.some(t => t.handType === handType)) {
          threats.push({
            handType: handType,
            currentStrength: 4,
            requiredCards: requiredCards,
            probability: boardHas.length >= 3 ? 0.25 : 0.12,
            isPlayerPossible: false,
            isOpponentPossible: true,
            isMade: boardHas.length >= 4,
          });
        }
      }
    }
  });

  return threats;
}

const analyzeOpponentPairThreats = (communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  const boardValues = [...new Set(communityCards.map(c => c.value))].sort((a,b) => b-a);
  const highestBoardCardValue = boardValues[0];
  
  if(!highestBoardCardValue) return [];

  // 1. Top Pair Threat: Opponent pairs the highest card on the board
  const topCardRank = Object.keys(rankToValue).find(key => rankToValue[key] === highestBoardCardValue) as Rank;
  if(topCardRank) {
    const required = removeUsedCards(getCardsOfRank(topCardRank), communityCards);
    if(required.length > 0) {
       threats.push({
        handType: `Top Pair (${topCardRank}s)`,
        currentStrength: 1,
        requiredCards: required,
        probability: 0.25,
        isPlayerPossible: false,
        isOpponentPossible: true,
        isMade: false,
      });
    }
  }

  // 2. Overpair Threat: Opponent holds a pocket pair higher than the board
  const allRanks = Object.keys(rankToValue).sort((a,b) => rankToValue[b] - rankToValue[a]);
  const higherRanks = allRanks.filter(rank => rankToValue[rank] > highestBoardCardValue);

  higherRanks.forEach(rank => {
    const required = removeUsedCards(getCardsOfRank(rank as Rank), communityCards);
    if (required.length >= 2) { // Needs to be a pocket pair
       threats.push({
        handType: `Overpair (${rank}s)`,
        currentStrength: 1,
        requiredCards: required,
        probability: 0.06, // Probability of a specific pocket pair
        isPlayerPossible: false,
        isOpponentPossible: true,
        isMade: false,
      });
    }
  });

  return threats;
}

const analyzeOpponentTwoPairThreats = (communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  const boardRanks: { [key: number]: Card[] } = {};
  communityCards.forEach(c => {
    if (!boardRanks[c.value]) boardRanks[c.value] = [];
    boardRanks[c.value].push(c);
  });

  const pairsOnBoard = Object.values(boardRanks).filter(cards => cards.length === 2);
  const singlesOnBoard = Object.values(boardRanks).filter(cards => cards.length === 1);

  // Case 1: Board is unpaired (e.g., K 8 2). Opponent needs two cards like [K, 8].
  if (singlesOnBoard.length >= 2) {
    // Generate combinations of two single cards on the board
    for (let i = 0; i < singlesOnBoard.length; i++) {
      for (let j = i + 1; j < singlesOnBoard.length; j++) {
        const card1 = singlesOnBoard[i][0];
        const card2 = singlesOnBoard[j][0];
        const required: Card[] = [
          ...removeUsedCards(getCardsOfRank(card1.rank), communityCards),
          ...removeUsedCards(getCardsOfRank(card2.rank), communityCards)
        ];
        
        threats.push({
          handType: `Two Pair (${card1.rank}s & ${card2.rank}s)`,
          currentStrength: 2,
          requiredCards: required,
          probability: 0.18,
          isPlayerPossible: false,
          isOpponentPossible: true,
          isMade: false,
        });
      }
    }
  }

  // Case 2: Board has one pair (e.g., K K 7). Opponent needs a pair with a single card.
  if (pairsOnBoard.length === 1 && singlesOnBoard.length > 0) {
    const pairRank = pairsOnBoard[0][0].rank;
    singlesOnBoard.forEach(single => {
      const singleRank = single[0].rank;
      const required = removeUsedCards(getCardsOfRank(singleRank), communityCards);
      
      threats.push({
        handType: `Two Pair (${pairRank}s & ${singleRank}s)`,
        currentStrength: 2,
        requiredCards: required,
        probability: 0.20,
        isPlayerPossible: false,
        isOpponentPossible: true,
        isMade: false,
      });
    });
  }

  return threats;
};

const analyzeOpponentSetThreats = (communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  const boardRanks: { [key: number]: Card[] } = {};
  communityCards.forEach(c => {
    if (!boardRanks[c.value]) boardRanks[c.value] = [];
    boardRanks[c.value].push(c);
  });

  // Case 1: Trips threat (pair on board)
  Object.values(boardRanks).filter(cards => cards.length === 2).forEach(pair => {
    const rank = pair[0].rank;
    const remainingCards = removeUsedCards(getCardsOfRank(rank), communityCards);
    if (remainingCards.length > 0) {
      threats.push({
        handType: `Trips (${rank}s)`,
        currentStrength: 3,
        requiredCards: remainingCards,
        probability: 0.10, // Moderate probability
        isPlayerPossible: false,
        isOpponentPossible: true,
        isMade: false,
      });
    }
  });

  // Case 2: Set threat (pocket pair matching a board card)
  Object.values(boardRanks).filter(cards => cards.length === 1).forEach(unpairedCard => {
    const rank = unpairedCard[0].rank;
    const remainingCards = removeUsedCards(getCardsOfRank(rank), communityCards);
    if (remainingCards.length >= 2) {
      threats.push({
        handType: `Set of ${rank}s`,
        currentStrength: 3,
        requiredCards: remainingCards, // Opponent needs two of these
        probability: 0.12,
        isPlayerPossible: false,
        isOpponentPossible: true,
        isMade: false,
      });
    }
  });
  
  return threats;
}


// Analyze opponent threats (enhanced)
const analyzeOpponentThreats = (holeCards: Card[], communityCards: Card[]): HandAnalysis[] => {
  const threats: HandAnalysis[] = [];
  
  // Get player's current hand strength for comparison
  const playerHand = evaluateHand(holeCards, communityCards);
  const playerStrength = playerHand.rank;
  
  // Analyze board texture to determine realistic threats
  const boardCards = communityCards;
  if (boardCards.length < 3) return threats;
  
  // 0. Straight flush threats (highest priority)
  const straightFlushThreats = analyzeOpponentStraightFlushThreats(communityCards);
  threats.push(...straightFlushThreats);
  
  // 1. Flush threats - check if board has flush potential
  const suitCounts: { [key in Suit]: number } = { H: 0, D: 0, C: 0, S: 0 };
  boardCards.forEach(card => {
    suitCounts[card.suit]++;
  });
  
  // Filter out flush threats for suits that already have straight flush threats
  const straightFlushThreatSuits = new Set(straightFlushThreats.map(sf => sf.handType.split(' ')[0]));
  
  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (count >= 2 && !straightFlushThreatSuits.has(suit)) {
      const allSuitCards = getCardsOfSuit(suit as Suit);
      // For opponent threats, used cards are only the community cards
      const availableCards = removeUsedCards(allSuitCards, communityCards);

      if (availableCards.length >= 2) { // Opponent needs 2 cards for a flush
        threats.push({
          handType: `${suit} Flush Threat`,
          currentStrength: 5,
          requiredCards: availableCards, // Show all possible cards opponent might have
          probability: count >= 3 ? 0.35 : 0.15,
          isPlayerPossible: false,
          isOpponentPossible: true,
          isMade: count >= 3
        });
      }
    }
  });

  // 2. Straight threats - check for straight potential
  const straightThreats = analyzeOpponentStraightThreats(communityCards);
  threats.push(...straightThreats);
  
  // 3. Pair/Set threats based on board pairs
  const setThreats = analyzeOpponentSetThreats(communityCards);
  threats.push(...setThreats);

  const rankCounts: { [key: number]: number } = {};
  boardCards.forEach(card => {
    rankCounts[card.value] = (rankCounts[card.value] || 0) + 1;
  });
  
  const boardPairs = Object.entries(rankCounts).filter(([_, count]) => count >= 2);
  const boardTrips = Object.entries(rankCounts).filter(([_, count]) => count >= 3);
  
  // Full house threats
  if (boardPairs.length > 0 || boardTrips.length > 0) {
    threats.push({
      handType: 'Full House',
      currentStrength: 6,
      requiredCards: [],
      probability: boardTrips.length > 0 ? 0.15 : 0.08,
      isPlayerPossible: false,
      isOpponentPossible: true,
      isMade: false
    });
  }
  
  const twoPairThreats = analyzeOpponentTwoPairThreats(communityCards);
  threats.push(...twoPairThreats);

  // Add Pair threats
  const pairThreats = analyzeOpponentPairThreats(communityCards);
  threats.push(...pairThreats);
  
  // Filter threats that are stronger than player's hand
  const significantThreats = threats.filter(threat => 
    threat.currentStrength > playerStrength
  );
  
  // Sort by strength (highest first)
  return significantThreats.sort((a, b) => b.currentStrength - a.currentStrength);
};

// Main analysis function
export const analyzeHands = (holeCards: Card[], communityCards: Card[]): AnalysisResult => {
  // If the board is complete, only show the final hand (no draws or threats)
  if (communityCards.length === 5) {
    const currentPlayerHand = evaluateHand(holeCards, communityCards);
    return {
      playerAnalysis: [],
      opponentThreats: [],
      currentPlayerHand: {
        type: currentPlayerHand.rankName,
        strength: currentPlayerHand.rank
      }
    };
  }

  const playerAnalysis: HandAnalysis[] = [];
  
  // Analyze straight flush possibilities (highest priority)
  const straightFlushAnalysis = analyzeStraightFlush(holeCards, communityCards);
  playerAnalysis.push(...straightFlushAnalysis);
  
  // Analyze flush possibilities (but only if no straight flush draws exist for the same suit)
  const flushAnalysis = analyzeFlush(holeCards, communityCards);
  const straightFlushSuits = new Set(straightFlushAnalysis.map(sf => sf.handType.split(' ')[0]));
  const filteredFlushAnalysis = flushAnalysis.filter(flush => {
    const flushSuit = flush.handType.split(' ')[0];
    return !straightFlushSuits.has(flushSuit);
  });
  playerAnalysis.push(...filteredFlushAnalysis);
  
  // Analyze straight possibilities
  const straightAnalysis = analyzeStraight(holeCards, communityCards);
  playerAnalysis.push(...straightAnalysis);
  
  // Analyze pair improvements
  const pairAnalysis = analyzePairs(holeCards, communityCards);
  playerAnalysis.push(...pairAnalysis);
  
  // Analyze two pair possibilities
  const twoPairAnalysis = analyzeTwoPair(holeCards, communityCards);
  playerAnalysis.push(...twoPairAnalysis);
  
  // Analyze full house possibilities
  const fullHouseAnalysis = analyzeFullHouse(holeCards, communityCards);
  playerAnalysis.push(...fullHouseAnalysis);
  
  // Enhanced opponent threat analysis
  const opponentThreats = analyzeOpponentThreats(holeCards, communityCards);
  
  // Get current player hand info
  const currentPlayerHand = evaluateHand(holeCards, communityCards);
  
  return {
    playerAnalysis: playerAnalysis.sort((a, b) => b.currentStrength - a.currentStrength),
    opponentThreats,
    currentPlayerHand: {
      type: currentPlayerHand.rankName,
      strength: currentPlayerHand.rank
    }
  };
}; 