import { Card } from '@/types';
import { Hand, parseRange } from './hand-range';
import { calculateEquityAgainstRange } from './equity-calculator';
import { calculateCallEV } from './pot-odds-calculator';

export type Decision = 'Fold' | 'Call' | 'Raise' | 'Check';

export interface DecisionAnalysis {
  decision: Decision;
  reason: string;
  equity: number;
  callEV: number;
}

/**
 * The core decision-making engine for the poker trainer.
 * It analyzes a scenario and determines the most profitable action.
 *
 * @param playerHoleCards The player's two hole cards.
 * @param communityCards The cards on the board.
 * @param potSize The current size of the pot.
 * @param callSize The amount required to call. A value of 0 means the player can check.
 * @param opponentRangeString The opponent's estimated hand range as a string.
 * @returns A decision analysis object with the recommended action and reasoning.
 */
export const analyzeDecision = (
  playerHoleCards: Card[],
  communityCards: Card[],
  potSize: number,
  callSize: number,
  opponentRangeString: string
): DecisionAnalysis => {
  // 1. Parse the opponent's hand range
  const opponentRange = parseRange(opponentRangeString);

  // 2. Calculate player's equity against that range
  const equityResult = calculateEquityAgainstRange(
    playerHoleCards,
    opponentRange,
    communityCards
  );
  const equity = equityResult.win + (equityResult.tie / 2); // Effective equity

  // 3. Handle the "Check" option
  if (callSize === 0) {
    return {
      decision: 'Check',
      reason: 'There is no bet to call. Checking is the passive option to see the next card.',
      equity,
      callEV: 0,
    };
  }

  // 4. Calculate the Expected Value (EV) of calling
  const callEV = calculateCallEV(equity, potSize, callSize);

  // 5. Make the decision: Call or Fold
  if (callEV > 0) {
    return {
      decision: 'Call',
      reason: `Calling is profitable in the long run. Your equity (${(equity * 100).toFixed(1)}%) is greater than the required pot odds, leading to a positive Expected Value of ${callEV.toFixed(2)} chips.`,
      equity,
      callEV,
    };
  } else {
    return {
      decision: 'Fold',
      reason: `Calling is not profitable. Your equity (${(equity * 100).toFixed(1)}%) is too low to justify the call, leading to a negative Expected Value of ${callEV.toFixed(2)} chips.`,
      equity,
      callEV,
    };
  }
};
