import { Card } from '@/types';
import { evaluateHand, compareHands } from './hand-evaluator';
import { createDeck, shuffleDeck } from './deck';
import { Hand } from './hand-range';

interface EquityResult {
  win: number;
  tie: number;
  loss: number;
}

const SIMULATION_COUNT_SINGLE = 10000; // High accuracy for single hand vs hand
const SIMULATION_COUNT_RANGE = 200;   // Lower count per hand, but high total simulations

/**
 * Calculates the equity of a player's hand against a single opponent's hand
 * through Monte Carlo simulation.
 */
export const calculateEquity = (
  playerHoleCards: Card[],
  opponentHoleCards: Card[],
  communityCards: Card[]
): EquityResult => {
  const knownCards = [...playerHoleCards, ...opponentHoleCards, ...communityCards];
  
  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let i = 0; i < SIMULATION_COUNT_SINGLE; i++) {
    const fullDeck = createDeck();
    const remainingDeck = fullDeck.filter(deckCard => 
      !knownCards.some(knownCard => 
        knownCard.rank === deckCard.rank && knownCard.suit === deckCard.suit
      )
    );
    const shuffledDeck = shuffleDeck(remainingDeck);
    const cardsToDeal = 5 - communityCards.length;
    const dealtCards = shuffledDeck.slice(0, cardsToDeal);
    const finalCommunityCards = [...communityCards, ...dealtCards];
    const playerHand = evaluateHand(playerHoleCards, finalCommunityCards);
    const opponentHand = evaluateHand(opponentHoleCards, finalCommunityCards);
    const result = compareHands(playerHand, opponentHand);
    if (result === 1) wins++;
    else if (result === 0) ties++;
    else losses++;
  }

  return {
    win: wins / SIMULATION_COUNT_SINGLE,
    tie: ties / SIMULATION_COUNT_SINGLE,
    loss: losses / SIMULATION_COUNT_SINGLE,
  };
};

/**
 * Calculates the equity of a player's hand against a range of opponent hands.
 *
 * @param playerHoleCards The player's two hole cards.
 * @param opponentRange An array of possible two-card hands for the opponent.
 * @param communityCards The cards currently on the board.
 * @returns An object containing the average win, tie, and loss percentages.
 */
export const calculateEquityAgainstRange = (
  playerHoleCards: Card[],
  opponentRange: Hand[],
  communityCards: Card[]
): EquityResult => {
  let totalWins = 0;
  let totalTies = 0;
  let totalLosses = 0;

  // Filter out opponent hands that conflict with player's hand or community cards
  const playerAndBoardCards = [...playerHoleCards, ...communityCards];
  const validOpponentRange = opponentRange.filter(opponentHand => 
    !opponentHand.some(opponentCard => 
      playerAndBoardCards.some(knownCard => 
        knownCard.rank === opponentCard.rank && knownCard.suit === opponentCard.suit
      )
    )
  );

  if (validOpponentRange.length === 0) {
    return { win: 0, tie: 0, loss: 1 }; // Or handle as an error
  }

  // Iterate over each hand in the opponent's range
  for (const opponentHoleCards of validOpponentRange) {
    const knownCards = [...playerHoleCards, ...opponentHoleCards, ...communityCards];
    
    // Run a smaller number of simulations for each hand in the range
    for (let i = 0; i < SIMULATION_COUNT_RANGE; i++) {
      const fullDeck = createDeck();
      const remainingDeck = fullDeck.filter(deckCard => 
        !knownCards.some(knownCard => 
          knownCard.rank === deckCard.rank && knownCard.suit === deckCard.suit
        )
      );
      const shuffledDeck = shuffleDeck(remainingDeck);
      const cardsToDeal = 5 - communityCards.length;
      const dealtCards = shuffledDeck.slice(0, cardsToDeal);
      const finalCommunityCards = [...communityCards, ...dealtCards];
      const playerHand = evaluateHand(playerHoleCards, finalCommunityCards);
      const opponentHand = evaluateHand(opponentHoleCards, finalCommunityCards);
      const result = compareHands(playerHand, opponentHand);
      
      if (result === 1) totalWins++;
      else if (result === 0) totalTies++;
      else totalLosses++;
    }
  }

  const totalSimulations = validOpponentRange.length * SIMULATION_COUNT_RANGE;

  if (totalSimulations === 0) {
    return { win: 0, tie: 0, loss: 1 }; // Avoid division by zero
  }

  return {
    win: totalWins / totalSimulations,
    tie: totalTies / totalSimulations,
    loss: totalLosses / totalSimulations,
  };
};

import { evaluateCards } from 'phe';
import { parseCardString, areCardsUnique } from './card-utils';
import { createDeck } from './deck';

const deck = [...'23456789TJQKA'].flatMap(r =>
  ['c','d','h','s'].map(s => r+s)
);

function remove<T>(arr:T[], removeSet:Set<T>){return arr.filter(x=>!removeSet.has(x));}

export async function monteCarloEquity(
  heroStrings:string[], boardStrings:string[], villains:number, sims=10000
){
  let wins=0, chops=0;

  // 1. Card Normalization and Validation
  let heroCards;
  let boardCards;
  try {
    heroCards = heroStrings.map(parseCardString);
    boardCards = boardStrings.map(parseCardString);
  } catch (error) {
    console.error("Error parsing cards:", error.message);
    return { equity: 0, wins: 0, chops: 0, sims: sims, error: error.message };
  }

  const allKnownCards = [...heroCards, ...boardCards];
  if (!areCardsUnique(allKnownCards)) {
    const errorMessage = "Duplicate cards detected in hero or board hands.";
    console.error(errorMessage);
    return { equity: 0, wins: 0, chops: 0, sims: sims, error: errorMessage };
  }

  // Convert Card objects back to string for phe library
  const heroPhe = heroCards.map(c => `${c.rank === '10' ? 'T' : c.rank}${c.suit.toLowerCase()}`);
  const boardPhe = boardCards.map(c => `${c.rank === '10' ? 'T' : c.rank}${c.suit.toLowerCase()}`);

  console.log("--- Monte Carlo Equity Calculation ---");
  console.log("Hero Cards:", heroPhe);
  console.log("Board Cards:", boardPhe);
  console.log("Number of Villains:", villains);

  const dead = new Set([...heroPhe, ...boardPhe]);

  for(let i=0;i<sims;i++){
    const live   = remove(deck, dead).sort(()=>0.5-Math.random());
    const villainHands = Array.from({length:villains},
                        (_,k)=>live.slice(2*k,2*k+2));
    const restDeck = live.slice(2*villains);
    const need = 5-boardPhe.length;
    const runout = restDeck.slice(0, need);

    const heroRank = evaluateCards([...heroPhe, ...boardPhe, ...runout]);
    const villainRanks = villainHands
            .map(h=>evaluateCards([...h, ...boardPhe, ...runout]));
    const best = Math.min(heroRank, ...villainRanks);
    const heroIsBest = heroRank === best;
    const numBest = villainRanks.filter(r => r === best).length + (heroIsBest ? 1 : 0);

    if (heroIsBest) {
      if (numBest === 1) wins++;
      else chops++;
    }
  }
  const equity = (wins + chops/2) / sims;
  return { equity, wins, chops, sims };
}
