import { Card, Decision } from '@/types';
import { calculateEquityAgainstRange } from './equity-calculator';
import { parseRange } from './hand-range';
import { calculateCallEV } from './pot-odds-calculator';
import { evaluateHand } from './hand-evaluator';

export interface DecisionEVAnalysis {
  foldEV: number;
  callEV: number;
  raiseEV: number;
  optimalDecision: Decision;
  playerDecision: Decision;
  evDifference: number;
  decisionQuality: 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Terrible';
  score: number; // 0-100 score based on EV analysis
  explanation: string;
  equity: number;
  potOdds: number;
}

export interface ScenarioContext {
  holeCards: Card[];
  communityCards: Card[];
  potSize: number;
  betSize: number;
  stackSize: number;
  street: string;
}

// A generic, wide range for an unknown opponent.
const GENERIC_OPPONENT_RANGE = "22+, A2s+, K2s+, Q2s+, J2s+, T6s+, 96s+, 86s+, 75s+, 64s+, 54s, A2o+, KTo+, QTo+, JTo+";


/**
 * Analyzes a poker decision and calculates EV-based scoring
 */
export const analyzeDecisionEV = (
  context: ScenarioContext,
  playerDecision: Decision
): DecisionEVAnalysis => {
  const { holeCards, communityCards, potSize, betSize, stackSize } = context;
  
  // Use a generic opponent range
  const opponentRange = parseRange(GENERIC_OPPONENT_RANGE);
  
  // Calculate equity against opponent's range
  const equityResult = calculateEquityAgainstRange(holeCards, opponentRange, communityCards);
  const equity = equityResult.win + (equityResult.tie / 2);
  
  // Calculate pot odds
  const potOdds = betSize > 0 ? betSize / (potSize + betSize) : 0;
  
  // Calculate EV for each possible decision
  const foldEV = 0; // Always 0 - no money lost or gained
  const callEV = calculateCallEV(equity, potSize, betSize);
  // Simplified raise EV calculation
  const raiseEV = (equity > 0.6) ? callEV * 1.5 : callEV * 0.5;
  
  // Determine optimal decision
  const evOptions = [
    { decision: 'fold' as Decision, ev: foldEV },
    { decision: 'call' as Decision, ev: callEV },
    { decision: 'raise' as Decision, ev: raiseEV }
  ];
  
  const optimalChoice = evOptions.reduce((max, current) => 
    current.ev > max.ev ? current : max
  );
  
  const playerEV = evOptions.find(opt => opt.decision === playerDecision)?.ev || 0;
  const evDifference = optimalChoice.ev - playerEV;
  
  // Calculate decision quality and score
  const { decisionQuality, score } = calculateDecisionQuality(evDifference, betSize);
  
  // Generate explanation
  const explanation = generateEVExplanation(
    equity,
    potOdds,
    foldEV,
    callEV,
    raiseEV,
    optimalChoice.decision,
    playerDecision,
    evDifference
  );
  
  return {
    foldEV,
    callEV,
    raiseEV,
    optimalDecision: optimalChoice.decision,
    playerDecision,
    evDifference,
    decisionQuality,
    score,
    explanation,
    equity,
    potOdds
  };
};

/**
 * Determines decision quality based on EV difference
 */
const calculateDecisionQuality = (
  evDifference: number,
  betSize: number
): { decisionQuality: 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Terrible'; score: number } => {
  // Normalize EV difference by bet size for consistent scoring
  const normalizedEV = betSize > 0 ? evDifference / betSize : evDifference;
  
  if (normalizedEV <= 0.05) {
    return { decisionQuality: 'Excellent', score: 100 };
  } else if (normalizedEV <= 0.1) {
    return { decisionQuality: 'Good', score: 85 };
  } else if (normalizedEV <= 0.2) {
    return { decisionQuality: 'Acceptable', score: 70 };
  } else if (normalizedEV <= 0.4) {
    return { decisionQuality: 'Poor', score: 50 };
  } else {
    return { decisionQuality: 'Terrible', score: 25 };
  }
};

/**
 * Generates human-readable explanation of EV analysis
 */
const generateEVExplanation = (
  equity: number,
  potOdds: number,
  foldEV: number,
  callEV: number,
  raiseEV: number,
  optimalDecision: Decision,
  playerDecision: Decision,
  evDifference: number
): string => {
  const equityPercent = (equity * 100).toFixed(1);
  const potOddsPercent = (potOdds * 100).toFixed(1);
  
  let explanation = `Your hand has ${equityPercent}% equity against a typical opponent's range. `;
  explanation += `You need ${potOddsPercent}% equity to break even on a call.\n\n`;
  
  explanation += `EV Analysis:\n`;
  explanation += `• Fold EV: ${foldEV.toFixed(2)} BB\n`;
  explanation += `• Call EV: ${callEV.toFixed(2)} BB\n`;
  explanation += `• Raise EV: ${raiseEV.toFixed(2)} BB\n\n`;
  
  explanation += `Optimal Decision: ${optimalDecision.toUpperCase()}\n`;
  explanation += `Your Decision: ${playerDecision.toUpperCase()}\n`;
  
  if (evDifference > 0) {
    explanation += `\nYour decision cost you ${evDifference.toFixed(2)} BB in expected value. `;
    explanation += `This is because ${getDecisionReasoning(playerDecision, optimalDecision, equity, potOdds)}.`;
  } else {
    explanation += `\nExcellent decision! You made the optimal play.`;
  }
  
  return explanation;
};

/**
 * Provides specific reasoning for why a decision was suboptimal
 */
const getDecisionReasoning = (
  playerDecision: Decision,
  optimalDecision: Decision,
  equity: number,
  potOdds: number
): string => {
  if (playerDecision === 'fold' && optimalDecision === 'call') {
    return `you folded when you had sufficient equity (${(equity * 100).toFixed(1)}%) to call profitably.`;
  }
  
  if (playerDecision === 'call' && optimalDecision === 'fold') {
    return `you called without sufficient equity (${(equity * 100).toFixed(1)}%).`;
  }
  
  if (playerDecision === 'fold' && optimalDecision === 'raise') {
    return `you folded when you had a strong enough hand to raise for value.`;
  }
  
  if (playerDecision === 'call' && optimalDecision === 'raise') {
    return `you called when raising would have been more profitable due to your strong equity.`;
  }
  
  if (playerDecision === 'raise' && (optimalDecision === 'fold' || optimalDecision === 'call')) {
    return `you raised when a more passive line was optimal.`;
  }
    
  return `the EV calculation shows a different decision would have been more profitable.`;
};


/**
 * Calculates comprehensive session score based on multiple decisions
 */
export const calculateSessionScore = (decisions: DecisionEVAnalysis[]): {
  averageScore: number;
  totalEVLoss: number;
  decisionBreakdown: Record<string, number>;
  improvement: string[];
} => {
  const scores = decisions.map(d => d.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const totalEVLoss = decisions.reduce((sum, d) => sum + d.evDifference, 0);
  
  const decisionBreakdown = decisions.reduce((breakdown, d) => {
    breakdown[d.decisionQuality] = (breakdown[d.decisionQuality] || 0) + 1;
    return breakdown;
  }, {} as Record<string, number>);
  
  const improvement = generateImprovementSuggestions(decisions);
  
  return {
    averageScore,
    totalEVLoss,
    decisionBreakdown,
    improvement
  };
};

/**
 * Generates personalized improvement suggestions based on decision patterns
 */
const generateImprovementSuggestions = (decisions: DecisionEVAnalysis[]): string[] => {
  const suggestions: string[] = [];
  
  // Analyze common mistakes
  const foldingMistakes = decisions.filter(d => d.playerDecision === 'fold' && d.optimalDecision !== 'fold');
  const callingMistakes = decisions.filter(d => d.playerDecision === 'call' && d.optimalDecision !== 'call');
  const raisingMistakes = decisions.filter(d => d.playerDecision === 'raise' && d.optimalDecision !== 'raise');
  
  if (foldingMistakes.length > decisions.length * 0.3) {
    suggestions.push('You are folding too often with profitable hands. Work on recognizing when you have sufficient equity to continue.');
  }
  
  if (callingMistakes.length > decisions.length * 0.3) {
    suggestions.push('You are calling too often without proper odds. Focus on pot odds calculations and opponent profiling.');
  }
  
  if (raisingMistakes.length > decisions.length * 0.3) {
    suggestions.push('You are raising in spots where other actions are more profitable. Consider fold equity and opponent tendencies.');
  }
  
  const averageEVLoss = decisions.reduce((sum, d) => sum + d.evDifference, 0) / decisions.length;
  if (averageEVLoss > 0.2) {
    suggestions.push('Focus on studying opponent types and their tendencies. Understanding player profiles will improve your EV significantly.');
  }
  
  return suggestions;
};

export default analyzeDecisionEV; 