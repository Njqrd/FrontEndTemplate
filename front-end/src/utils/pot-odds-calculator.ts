/**
 * Calculates the pot odds given the pot size and the amount to call.
 *
 * @param potSize The total size of the pot before the call.
 * @param callSize The amount required to call the current bet.
 * @returns The pot odds as a decimal (e.g., 0.33 for 3:1 odds).
 */
export const calculatePotOdds = (potSize: number, callSize: number): number => {
  if (potSize + callSize === 0) {
    return 0;
  }
  return callSize / (potSize + callSize);
};

/**
 * Calculates the minimum equity required for a call to be profitable.
 * This is essentially the same as the pot odds.
 *
 * @param potSize The total size of the pot before the call.
 * @param callSize The amount required to call the current bet.
 * @returns The minimum equity required, as a decimal.
 */
export const calculateMinimumEquity = (potSize: number, callSize: number): number => {
  return calculatePotOdds(potSize, callSize);
};

/**
 * Calculates the Expected Value (EV) of making a call.
 *
 * @param equity The player's win percentage (equity) against the opponent's range.
 * @param potSize The total size of the pot *before* the player's call.
 * @param callSize The amount the player must pay to call.
 * @returns The expected value of the call. A positive EV means the call is profitable.
 */
export const calculateCallEV = (equity: number, potSize: number, callSize: number): number => {
  const totalPot = potSize + callSize;
  const ev = (equity * totalPot) - callSize;
  return ev;
};
