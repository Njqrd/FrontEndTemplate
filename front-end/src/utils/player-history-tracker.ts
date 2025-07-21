import { Decision, Card } from '@/types';
import { PlayerType, PlayerDecisionHistory, PlayerSession } from '@/types/player';
import { DecisionEVAnalysis } from './advanced-scoring';

export interface PlayerHistoryManager {
  addDecision: (decision: PlayerDecisionHistory) => void;
  getDecisionHistory: (limit?: number) => PlayerDecisionHistory[];
  getSessionStats: () => PlayerSessionStats;
  getPlayerTendencies: () => PlayerTendencies;
  getRecentPerformance: (handCount: number) => PerformanceMetrics;
  generatePlayerReport: () => PlayerReport;
  updateSession: (sessionData: Partial<PlayerSession>) => void;
  getWeaknessAnalysis: () => WeaknessAnalysis;
}

export interface PlayerSessionStats {
  totalHands: number;
  totalDecisions: number;
  averageScore: number;
  totalEVLoss: number;
  winRate: number;
  vpipThisSession: number;
  pfrThisSession: number;
  aggressionFactor: number;
  netResult: number;
  bestDecision: PlayerDecisionHistory | null;
  worstDecision: PlayerDecisionHistory | null;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    currentStreakType: 'win' | 'loss' | 'none';
  };
}

export interface PlayerTendencies {
  positionStats: Record<string, {
    handsPlayed: number;
    vpip: number;
    pfr: number;
    averageScore: number;
    commonMistakes: string[];
  }>;
  
  streetStats: Record<string, {
    decisions: number;
    averageScore: number;
    foldFrequency: number;
    callFrequency: number;
    raiseFrequency: number;
    averageEVLoss: number;
  }>;
  
  opponentStats: Record<string, {
    handsPlayed: number;
    winRate: number;
    averageScore: number;
    adaptationScore: number; // How well they adapt to opponent type
  }>;
  
  handStrengthStats: Record<string, {
    timesPlayed: number;
    averageScore: number;
    optimalPlayRate: number;
    commonErrors: string[];
  }>;
}

export interface PerformanceMetrics {
  recentScore: number;
  trend: 'improving' | 'declining' | 'stable';
  trendStrength: number; // 1-10 scale
  evPerHand: number;
  decisionAccuracy: number;
  adaptationRate: number;
  learningSigns: string[];
}

export interface WeaknessAnalysis {
  primaryWeakness: string;
  secondaryWeakness: string;
  specificIssues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    frequency: number;
    examples: PlayerDecisionHistory[];
    improvement: string;
  }>;
  strengthAreas: string[];
  focusRecommendations: string[];
}

export interface PlayerReport {
  overview: {
    totalHands: number;
    overallScore: number;
    evPerHand: number;
    improvementRate: number;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  };
  
  performance: {
    recent: PerformanceMetrics;
    trends: {
      scoreTrend: Array<{ handNumber: number; score: number }>;
      evTrend: Array<{ handNumber: number; ev: number }>;
    };
  };
  
  tendencies: PlayerTendencies;
  weaknesses: WeaknessAnalysis;
  
  recommendations: {
    immediate: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

/**
 * Creates a new player history manager
 */
export const createPlayerHistoryManager = (): PlayerHistoryManager => {
  let decisionHistory: PlayerDecisionHistory[] = [];
  let currentSession: PlayerSession = {
    sessionId: `session-${Date.now()}`,
    startTime: Date.now(),
    totalHands: 0,
    decisions: [],
    vpipThisSession: 0,
    pfrThisSession: 0,
    netResult: 0,
    biggestPot: 0,
    longestStreak: 0
  };

  const addDecision = (decision: PlayerDecisionHistory) => {
    decisionHistory.push(decision);
    currentSession.decisions.push(decision);
    currentSession.totalHands++;
    
    // Update session stats
    updateSessionStats(decision);
  };

  const updateSessionStats = (decision: PlayerDecisionHistory) => {
    // Update VPIP
    if (decision.action !== 'fold') {
      currentSession.vpipThisSession = 
        (currentSession.vpipThisSession * (currentSession.totalHands - 1) + 1) / currentSession.totalHands;
    }
    
    // Update PFR
    if (decision.street === 'Preflop' && decision.action === 'raise') {
      currentSession.pfrThisSession = 
        (currentSession.pfrThisSession * (currentSession.totalHands - 1) + 1) / currentSession.totalHands;
    }
    
    // Update net result
    if (decision.result === 'win') {
      currentSession.netResult += decision.potSize;
    } else if (decision.result === 'loss') {
      currentSession.netResult -= decision.amount || 0;
    }
    
    // Update biggest pot
    if (decision.potSize > currentSession.biggestPot) {
      currentSession.biggestPot = decision.potSize;
    }
  };

  const getDecisionHistory = (limit?: number): PlayerDecisionHistory[] => {
    return limit ? decisionHistory.slice(-limit) : decisionHistory;
  };

  const getSessionStats = (): PlayerSessionStats => {
    const scores = currentSession.decisions.map(d => calculateDecisionScore(d));
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const totalEVLoss = currentSession.decisions.reduce((sum, d) => sum + Math.max(0, d.ev), 0);
    const wins = currentSession.decisions.filter(d => d.result === 'win').length;
    const winRate = currentSession.totalHands > 0 ? wins / currentSession.totalHands : 0;
    
    const streakData = calculateStreakData(currentSession.decisions);
    const bestDecision = findBestDecision(currentSession.decisions);
    const worstDecision = findWorstDecision(currentSession.decisions);
    
    return {
      totalHands: currentSession.totalHands,
      totalDecisions: currentSession.decisions.length,
      averageScore,
      totalEVLoss,
      winRate,
      vpipThisSession: currentSession.vpipThisSession,
      pfrThisSession: currentSession.pfrThisSession,
      aggressionFactor: calculateAggressionFactor(currentSession.decisions),
      netResult: currentSession.netResult,
      bestDecision,
      worstDecision,
      streakData
    };
  };

  const getPlayerTendencies = (): PlayerTendencies => {
    const positionStats = calculatePositionStats(decisionHistory);
    const streetStats = calculateStreetStats(decisionHistory);
    const opponentStats = calculateOpponentStats(decisionHistory);
    const handStrengthStats = calculateHandStrengthStats(decisionHistory);
    
    return {
      positionStats,
      streetStats,
      opponentStats,
      handStrengthStats
    };
  };

  const getRecentPerformance = (handCount: number): PerformanceMetrics => {
    const recentDecisions = decisionHistory.slice(-handCount);
    const recentScores = recentDecisions.map(d => calculateDecisionScore(d));
    const recentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    const trend = calculateTrend(recentScores);
    const evPerHand = recentDecisions.reduce((sum, d) => sum + d.ev, 0) / recentDecisions.length;
    const decisionAccuracy = calculateDecisionAccuracy(recentDecisions);
    const adaptationRate = calculateAdaptationRate(recentDecisions);
    const learningSigns = identifyLearningSigns(recentDecisions);
    
    return {
      recentScore,
      trend: trend.direction,
      trendStrength: trend.strength,
      evPerHand,
      decisionAccuracy,
      adaptationRate,
      learningSigns
    };
  };

  const generatePlayerReport = (): PlayerReport => {
    const sessionStats = getSessionStats();
    const tendencies = getPlayerTendencies();
    const recentPerformance = getRecentPerformance(20);
    const weaknesses = getWeaknessAnalysis();
    
    const overview = {
      totalHands: sessionStats.totalHands,
      overallScore: sessionStats.averageScore,
      evPerHand: sessionStats.totalEVLoss / sessionStats.totalHands,
      improvementRate: calculateImprovementRate(decisionHistory),
      skillLevel: determineSkillLevel(sessionStats.averageScore, sessionStats.totalHands)
    };
    
    const performance = {
      recent: recentPerformance,
      trends: {
        scoreTrend: calculateScoreTrend(decisionHistory),
        evTrend: calculateEVTrend(decisionHistory)
      }
    };
    
    const recommendations = generateRecommendations(weaknesses, tendencies, recentPerformance);
    
    return {
      overview,
      performance,
      tendencies,
      weaknesses,
      recommendations
    };
  };

  const updateSession = (sessionData: Partial<PlayerSession>) => {
    currentSession = { ...currentSession, ...sessionData };
  };

  const getWeaknessAnalysis = (): WeaknessAnalysis => {
    const issues = identifySpecificIssues(decisionHistory);
    const primaryWeakness = identifyPrimaryWeakness(issues);
    const secondaryWeakness = identifySecondaryWeakness(issues);
    const strengthAreas = identifyStrengthAreas(decisionHistory);
    const focusRecommendations = generateFocusRecommendations(issues);
    
    return {
      primaryWeakness,
      secondaryWeakness,
      specificIssues: issues,
      strengthAreas,
      focusRecommendations
    };
  };

  return {
    addDecision,
    getDecisionHistory,
    getSessionStats,
    getPlayerTendencies,
    getRecentPerformance,
    generatePlayerReport,
    updateSession,
    getWeaknessAnalysis
  };
};

// Helper functions
const calculateDecisionScore = (decision: PlayerDecisionHistory): number => {
  // Simplified scoring based on EV
  const evNormalized = Math.max(0, 1 - Math.abs(decision.ev) / 10);
  return evNormalized * 100;
};

const calculateStreakData = (decisions: PlayerDecisionHistory[]) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  
  for (const decision of decisions) {
    if (decision.result === 'win') {
      if (currentStreakType === 'win') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'win';
      }
    } else if (decision.result === 'loss') {
      if (currentStreakType === 'loss') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'loss';
      }
    } else {
      currentStreak = 0;
      currentStreakType = 'none';
    }
    
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }
  
  return { currentStreak, longestStreak, currentStreakType };
};

const findBestDecision = (decisions: PlayerDecisionHistory[]): PlayerDecisionHistory | null => {
  if (decisions.length === 0) return null;
  
  return decisions.reduce((best, current) => 
    calculateDecisionScore(current) > calculateDecisionScore(best) ? current : best
  );
};

const findWorstDecision = (decisions: PlayerDecisionHistory[]): PlayerDecisionHistory | null => {
  if (decisions.length === 0) return null;
  
  return decisions.reduce((worst, current) => 
    calculateDecisionScore(current) < calculateDecisionScore(worst) ? current : worst
  );
};

const calculateAggressionFactor = (decisions: PlayerDecisionHistory[]): number => {
  const aggressiveActions = decisions.filter(d => ['bet', 'raise'].includes(d.action)).length;
  const passiveActions = decisions.filter(d => ['call', 'check'].includes(d.action)).length;
  
  return passiveActions > 0 ? aggressiveActions / passiveActions : aggressiveActions;
};

const calculatePositionStats = (decisions: PlayerDecisionHistory[]) => {
  const positionGroups = decisions.reduce((groups, decision) => {
    if (!groups[decision.position]) {
      groups[decision.position] = [];
    }
    groups[decision.position].push(decision);
    return groups;
  }, {} as Record<string, PlayerDecisionHistory[]>);
  
  const positionStats: Record<string, any> = {};
  
  for (const [position, positionDecisions] of Object.entries(positionGroups)) {
    const handsPlayed = positionDecisions.length;
    const vpip = positionDecisions.filter(d => d.action !== 'fold').length / handsPlayed;
    const pfr = positionDecisions.filter(d => d.action === 'raise' && d.street === 'Preflop').length / handsPlayed;
    const averageScore = positionDecisions.reduce((sum, d) => sum + calculateDecisionScore(d), 0) / handsPlayed;
    const commonMistakes = identifyCommonMistakes(positionDecisions);
    
    positionStats[position] = {
      handsPlayed,
      vpip,
      pfr,
      averageScore,
      commonMistakes
    };
  }
  
  return positionStats;
};

const calculateStreetStats = (decisions: PlayerDecisionHistory[]) => {
  const streetGroups = decisions.reduce((groups, decision) => {
    if (!groups[decision.street]) {
      groups[decision.street] = [];
    }
    groups[decision.street].push(decision);
    return groups;
  }, {} as Record<string, PlayerDecisionHistory[]>);
  
  const streetStats: Record<string, any> = {};
  
  for (const [street, streetDecisions] of Object.entries(streetGroups)) {
    const decisions = streetDecisions.length;
    const averageScore = streetDecisions.reduce((sum, d) => sum + calculateDecisionScore(d), 0) / decisions;
    const foldFrequency = streetDecisions.filter(d => d.action === 'fold').length / decisions;
    const callFrequency = streetDecisions.filter(d => d.action === 'call').length / decisions;
    const raiseFrequency = streetDecisions.filter(d => d.action === 'raise').length / decisions;
    const averageEVLoss = streetDecisions.reduce((sum, d) => sum + Math.max(0, d.ev), 0) / decisions;
    
    streetStats[street] = {
      decisions,
      averageScore,
      foldFrequency,
      callFrequency,
      raiseFrequency,
      averageEVLoss
    };
  }
  
  return streetStats;
};

const calculateOpponentStats = (decisions: PlayerDecisionHistory[]) => {
  // Simplified opponent tracking
  return {};
};

const calculateHandStrengthStats = (decisions: PlayerDecisionHistory[]) => {
  const handGroups = decisions.reduce((groups, decision) => {
    if (!groups[decision.handStrength]) {
      groups[decision.handStrength] = [];
    }
    groups[decision.handStrength].push(decision);
    return groups;
  }, {} as Record<string, PlayerDecisionHistory[]>);
  
  const handStrengthStats: Record<string, any> = {};
  
  for (const [handStrength, handDecisions] of Object.entries(handGroups)) {
    const timesPlayed = handDecisions.length;
    const averageScore = handDecisions.reduce((sum, d) => sum + calculateDecisionScore(d), 0) / timesPlayed;
    const optimalPlayRate = handDecisions.filter(d => calculateDecisionScore(d) > 80).length / timesPlayed;
    const commonErrors = identifyCommonErrors(handDecisions);
    
    handStrengthStats[handStrength] = {
      timesPlayed,
      averageScore,
      optimalPlayRate,
      commonErrors
    };
  }
  
  return handStrengthStats;
};

const calculateTrend = (scores: number[]): { direction: 'improving' | 'declining' | 'stable'; strength: number } => {
  if (scores.length < 3) return { direction: 'stable', strength: 0 };
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  const strength = Math.min(10, Math.abs(difference) / 10);
  
  if (difference > 5) return { direction: 'improving', strength };
  if (difference < -5) return { direction: 'declining', strength };
  return { direction: 'stable', strength };
};

const calculateDecisionAccuracy = (decisions: PlayerDecisionHistory[]): number => {
  const accurateDecisions = decisions.filter(d => calculateDecisionScore(d) > 70).length;
  return decisions.length > 0 ? accurateDecisions / decisions.length : 0;
};

const calculateAdaptationRate = (decisions: PlayerDecisionHistory[]): number => {
  // Simplified adaptation rate calculation
  return 0.75; // Placeholder
};

const identifyLearningSigns = (decisions: PlayerDecisionHistory[]): string[] => {
  const signs = [];
  
  if (decisions.length >= 10) {
    const recentScores = decisions.slice(-5).map(d => calculateDecisionScore(d));
    const earlierScores = decisions.slice(-10, -5).map(d => calculateDecisionScore(d));
    
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
    
    if (recentAvg > earlierAvg + 5) {
      signs.push('Improving decision quality');
    }
    
    if (recentScores.filter(s => s > 80).length > earlierScores.filter(s => s > 80).length) {
      signs.push('More optimal decisions');
    }
  }
  
  return signs;
};

const calculateImprovementRate = (decisions: PlayerDecisionHistory[]): number => {
  if (decisions.length < 10) return 0;
  
  const recentScores = decisions.slice(-10).map(d => calculateDecisionScore(d));
  const earlierScores = decisions.slice(-20, -10).map(d => calculateDecisionScore(d));
  
  if (earlierScores.length === 0) return 0;
  
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
  
  return (recentAvg - earlierAvg) / 10; // Normalize to 0-10 scale
};

const determineSkillLevel = (averageScore: number, totalHands: number): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' => {
  if (totalHands < 10) return 'Beginner';
  if (averageScore < 50) return 'Beginner';
  if (averageScore < 70) return 'Intermediate';
  if (averageScore < 85) return 'Advanced';
  return 'Expert';
};

const calculateScoreTrend = (decisions: PlayerDecisionHistory[]) => {
  return decisions.map((decision, index) => ({
    handNumber: index + 1,
    score: calculateDecisionScore(decision)
  }));
};

const calculateEVTrend = (decisions: PlayerDecisionHistory[]) => {
  return decisions.map((decision, index) => ({
    handNumber: index + 1,
    ev: decision.ev
  }));
};

const identifySpecificIssues = (decisions: PlayerDecisionHistory[]) => {
  const issues = [];
  
  const foldingTooMuch = decisions.filter(d => d.action === 'fold' && calculateDecisionScore(d) < 50).length;
  if (foldingTooMuch > decisions.length * 0.3) {
    issues.push({
      issue: 'Folding too often with playable hands',
      severity: 'high' as const,
      frequency: foldingTooMuch / decisions.length,
      examples: decisions.filter(d => d.action === 'fold' && calculateDecisionScore(d) < 50).slice(0, 3),
      improvement: 'Study pot odds and equity calculations'
    });
  }
  
  return issues;
};

const identifyPrimaryWeakness = (issues: any[]): string => {
  if (issues.length === 0) return 'No significant weaknesses identified';
  
  const highSeverityIssues = issues.filter(i => i.severity === 'high');
  if (highSeverityIssues.length > 0) {
    return highSeverityIssues[0].issue;
  }
  
  return issues[0].issue;
};

const identifySecondaryWeakness = (issues: any[]): string => {
  if (issues.length < 2) return 'No secondary weakness identified';
  
  const sortedIssues = issues.sort((a, b) => b.frequency - a.frequency);
  return sortedIssues[1].issue;
};

const identifyStrengthAreas = (decisions: PlayerDecisionHistory[]): string[] => {
  const strengths = [];
  
  const goodDecisions = decisions.filter(d => calculateDecisionScore(d) > 80);
  if (goodDecisions.length > decisions.length * 0.6) {
    strengths.push('Strong overall decision making');
  }
  
  return strengths;
};

const generateFocusRecommendations = (issues: any[]): string[] => {
  return issues.map(issue => issue.improvement);
};

const generateRecommendations = (weaknesses: WeaknessAnalysis, tendencies: PlayerTendencies, performance: PerformanceMetrics) => {
  const immediate = [
    'Focus on ' + weaknesses.primaryWeakness,
    'Review recent hands with poor scores'
  ];
  
  const mediumTerm = [
    'Study opponent types and their tendencies',
    'Practice equity calculations'
  ];
  
  const longTerm = [
    'Develop advanced hand reading skills',
    'Study game theory optimal play'
  ];
  
  return { immediate, mediumTerm, longTerm };
};

const identifyCommonMistakes = (decisions: PlayerDecisionHistory[]): string[] => {
  const mistakes = [];
  
  const poorDecisions = decisions.filter(d => calculateDecisionScore(d) < 50);
  if (poorDecisions.length > 0) {
    mistakes.push('Suboptimal decision making');
  }
  
  return mistakes;
};

const identifyCommonErrors = (decisions: PlayerDecisionHistory[]): string[] => {
  return identifyCommonMistakes(decisions);
};

export default createPlayerHistoryManager; 