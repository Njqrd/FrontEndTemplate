import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Scenario } from '@/types';
import { PlayerType, PlayerDecisionHistory, PlayerSession } from '@/types/player';
import { generateScenario } from '@/utils/scenario-generator';
import { generateAdvancedScenario, AdvancedScenarioConfig, EnhancedScenario } from '@/utils/advanced-scenario-generator';
import { analyzeDecisionEV, DecisionEVAnalysis } from '@/utils/advanced-scoring';
import { createPlayerHistoryManager, PlayerHistoryManager } from '@/utils/player-history-tracker';

// --- STATE SHAPE ---
interface PlayerStats {
  chips: number;
  correctAnswers: number;
  totalAnswered: number;
  streak: number;
  // Enhanced stats
  averageEVScore: number;
  totalEVLoss: number;
  decisionQuality: Record<string, number>; // Excellent, Good, etc.
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  improvementRate: number;
}

interface GameSettings {
  showMultiPlayerControls: boolean;
  autoAdvanceScenarios: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  randomizePositions: boolean;
  // Enhanced settings
  useAdvancedScoring: boolean;
  showEVAnalysis: boolean;
  trackPlayerHistory: boolean;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  focusArea: 'preflop' | 'flop' | 'turn' | 'river' | 'mixed';
  opponentTypes: PlayerType[];
  showOpponentStats: boolean;
  enableRealtimeAnalysis: boolean;
}

interface GameState {
  currentScenario: Scenario;
  playerStats: PlayerStats;
  gameSettings: GameSettings;
  isMultiPlayerMode: boolean;
  handInProgress: boolean;
  // Enhanced state
  currentEVAnalysis: DecisionEVAnalysis | null;
  playerHistory: PlayerHistoryManager;
  recentPerformance: {
    last10Hands: number[];
    trend: 'improving' | 'declining' | 'stable';
    strengths: string[];
    weaknesses: string[];
  };
  sessionStats: {
    handsPlayed: number;
    averageScore: number;
    bestDecision: PlayerDecisionHistory | null;
    worstDecision: PlayerDecisionHistory | null;
    totalEVLoss: number;
  };
  currentOpponents: Array<{
    type: PlayerType;
    name: string;
    recentActions: string[];
    statistics: any;
  }>;
}

// --- ACTIONS ---
type Action = 
  | { type: 'LOAD_NEW_SCENARIO' }
  | { type: 'LOAD_ADVANCED_SCENARIO'; payload: { config: AdvancedScenarioConfig } }
  | { type: 'SUBMIT_DECISION'; payload: { decision: string; evAnalysis: DecisionEVAnalysis } }
  | { type: 'SUBMIT_BASIC_DECISION'; payload: { correct: boolean } }
  | { type: 'TOGGLE_MULTI_PLAYER_MODE'; payload: { enabled: boolean } }
  | { type: 'UPDATE_GAME_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'SET_HAND_IN_PROGRESS'; payload: { inProgress: boolean } }
  | { type: 'RESET_PLAYER_STATS' }
  | { type: 'UPDATE_PLAYER_HISTORY'; payload: { decision: PlayerDecisionHistory } }
  | { type: 'SET_EV_ANALYSIS'; payload: { analysis: DecisionEVAnalysis } }
  | { type: 'UPDATE_SESSION_STATS' }
  | { type: 'ADD_OPPONENT'; payload: { opponent: any } }
  | { type: 'UPDATE_RECENT_PERFORMANCE' };

// --- INITIAL STATE ---
const historyManager = createPlayerHistoryManager();

const defaultAdvancedConfig: AdvancedScenarioConfig = {
  playerCount: 6,
  stackSizes: [100, 100, 100, 100, 100, 100],
  difficultyLevel: 2,
  focusArea: 'mixed',
  opponentTypes: ['TAG', 'LAG', 'TP', 'LP', 'TAG', 'LP'],
};

const initialState: GameState = {
  currentScenario: generateAdvancedScenario(defaultAdvancedConfig),
  playerStats: {
    chips: 1000,
    correctAnswers: 0,
    totalAnswered: 0,
    streak: 0,
    averageEVScore: 0,
    totalEVLoss: 0,
    decisionQuality: {
      'Excellent': 0,
      'Good': 0,
      'Acceptable': 0,
      'Poor': 0,
      'Terrible': 0
    },
    skillLevel: 'Beginner',
    improvementRate: 0
  },
  gameSettings: {
    showMultiPlayerControls: true,
    autoAdvanceScenarios: true,
    soundEnabled: false,
    animationsEnabled: true,
    randomizePositions: false,
    useAdvancedScoring: true,
    showEVAnalysis: true,
    trackPlayerHistory: true,
    difficultyLevel: 2,
    focusArea: 'mixed',
    opponentTypes: ['TAG', 'LAG', 'TP', 'LP'],
    showOpponentStats: true,
    enableRealtimeAnalysis: true
  },
  isMultiPlayerMode: true,
  handInProgress: false,
  currentEVAnalysis: null,
  playerHistory: historyManager,
  recentPerformance: {
    last10Hands: [],
    trend: 'stable',
    strengths: [],
    weaknesses: []
  },
  sessionStats: {
    handsPlayed: 0,
    averageScore: 0,
    bestDecision: null,
    worstDecision: null,
    totalEVLoss: 0
  },
  currentOpponents: []
};

// --- REDUCER ---
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'LOAD_NEW_SCENARIO': {
      const config = {
        ...defaultAdvancedConfig,
        difficultyLevel: state.gameSettings.difficultyLevel,
        focusArea: state.gameSettings.focusArea,
        opponentTypes: state.gameSettings.opponentTypes,
      };
      const advancedScenario = generateAdvancedScenario(config);
      return {
        ...state,
        currentScenario: advancedScenario,
        handInProgress: false,
        currentEVAnalysis: null,
        currentOpponents: advancedScenario.opponentProfiles.map(op => ({
          type: op.type,
          name: op.playerId,
          recentActions: op.recentActions,
          statistics: op.statistics
        }))
      };
    }
    
    case 'LOAD_ADVANCED_SCENARIO': {
      const advancedScenario = generateAdvancedScenario(action.payload.config);
      return {
        ...state,
        currentScenario: advancedScenario,
        handInProgress: false,
        currentEVAnalysis: null,
        currentOpponents: advancedScenario.opponentProfiles.map(op => ({
          type: op.type,
          name: op.playerId,
          recentActions: op.recentActions,
          statistics: op.statistics
        }))
      };
    }
    
    case 'SUBMIT_DECISION': {
      const { decision, evAnalysis } = action.payload;
      
      // Update player history
      const playerDecision: PlayerDecisionHistory = {
        handId: state.currentScenario.id,
        position: state.currentScenario.position,
        action: decision as any,
        street: state.currentScenario.street,
        potSize: state.currentScenario.potSize,
        equity: evAnalysis.equity,
        ev: evAnalysis.evDifference,
        timestamp: Date.now(),
        handStrength: 'Unknown', // TODO: Calculate from scenario
        result: 'fold' // TODO: Determine result
      };
      
      state.playerHistory.addDecision(playerDecision);
      
      // Update player stats with EV scoring
      const newStats = {
        ...state.playerStats,
        totalAnswered: state.playerStats.totalAnswered + 1,
        averageEVScore: (state.playerStats.averageEVScore * state.playerStats.totalAnswered + evAnalysis.score) / (state.playerStats.totalAnswered + 1),
        totalEVLoss: state.playerStats.totalEVLoss + evAnalysis.evDifference,
        decisionQuality: {
          ...state.playerStats.decisionQuality,
          [evAnalysis.decisionQuality]: (state.playerStats.decisionQuality[evAnalysis.decisionQuality as keyof typeof state.playerStats.decisionQuality] || 0) + 1,
        }
      };
      
      // Update correctAnswers based on decision quality
      if (evAnalysis.decisionQuality === 'Excellent' || evAnalysis.decisionQuality === 'Good') {
        newStats.correctAnswers += 1;
        newStats.streak = state.playerStats.streak + 1;
        newStats.chips = state.playerStats.chips + Math.floor(evAnalysis.score);
      } else {
        newStats.streak = 0;
        newStats.chips = state.playerStats.chips - Math.floor((100 - evAnalysis.score) / 2);
      }
      
      return {
        ...state,
        playerStats: newStats,
        currentEVAnalysis: evAnalysis,
        handInProgress: false,
        sessionStats: {
          ...state.sessionStats,
          handsPlayed: state.sessionStats.handsPlayed + 1,
          averageScore: (state.sessionStats.averageScore * state.sessionStats.handsPlayed + evAnalysis.score) / (state.sessionStats.handsPlayed + 1),
          totalEVLoss: state.sessionStats.totalEVLoss + evAnalysis.evDifference
        }
      };
    }
    
    case 'SUBMIT_BASIC_DECISION': {
      const { correct } = action.payload;
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          chips: state.playerStats.chips + (correct ? 100 : -50),
          correctAnswers: state.playerStats.correctAnswers + (correct ? 1 : 0),
          totalAnswered: state.playerStats.totalAnswered + 1,
          streak: correct ? state.playerStats.streak + 1 : 0,
        },
        handInProgress: false,
      };
    }
    
    case 'TOGGLE_MULTI_PLAYER_MODE': {
      return {
        ...state,
        isMultiPlayerMode: action.payload.enabled,
      };
    }
    
    case 'UPDATE_GAME_SETTINGS': {
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          ...action.payload,
        },
      };
    }
    
    case 'SET_HAND_IN_PROGRESS': {
      return {
        ...state,
        handInProgress: action.payload.inProgress,
      };
    }
    
    case 'RESET_PLAYER_STATS': {
      return {
        ...state,
        playerStats: {
          chips: 1000,
          correctAnswers: 0,
          totalAnswered: 0,
          streak: 0,
          averageEVScore: 0,
          totalEVLoss: 0,
          decisionQuality: {
            'Excellent': 0,
            'Good': 0,
            'Acceptable': 0,
            'Poor': 0,
            'Terrible': 0
          },
          skillLevel: 'Beginner',
          improvementRate: 0
        },
        sessionStats: {
          handsPlayed: 0,
          averageScore: 0,
          bestDecision: null,
          worstDecision: null,
          totalEVLoss: 0
        }
      };
    }
    
    case 'UPDATE_PLAYER_HISTORY': {
      state.playerHistory.addDecision(action.payload.decision);
      return state;
    }
    
    case 'SET_EV_ANALYSIS': {
      return {
        ...state,
        currentEVAnalysis: action.payload.analysis
      };
    }
    
    case 'UPDATE_SESSION_STATS': {
      const sessionStats = state.playerHistory.getSessionStats();
      return {
        ...state,
        sessionStats: {
          handsPlayed: sessionStats.totalHands,
          averageScore: sessionStats.averageScore,
          bestDecision: sessionStats.bestDecision,
          worstDecision: sessionStats.worstDecision,
          totalEVLoss: sessionStats.totalEVLoss
        }
      };
    }
    
    case 'ADD_OPPONENT': {
      return {
        ...state,
        currentOpponents: [...state.currentOpponents, action.payload.opponent]
      };
    }
    
    case 'UPDATE_RECENT_PERFORMANCE': {
      const performance = state.playerHistory.getRecentPerformance(10);
      return {
        ...state,
        recentPerformance: {
          last10Hands: performance.recentScore ? [performance.recentScore] : [],
          trend: performance.trend,
          strengths: performance.learningSigns,
          weaknesses: [] // TODO: Extract from weakness analysis
        }
      };
    }
    
    default:
      return state;
  }
};

// --- CONTEXT ---
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// --- PROVIDER ---
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- HOOK ---
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  const { state, dispatch } = context;
  
  return {
    // Legacy compatibility
    currentScenario: state.currentScenario,
    playerStats: state.playerStats,
    gameSettings: state.gameSettings,
    isMultiPlayerMode: state.isMultiPlayerMode,
    handInProgress: state.handInProgress,
    dispatch,
    
    // Enhanced features
    currentEVAnalysis: state.currentEVAnalysis,
    playerHistory: state.playerHistory,
    recentPerformance: state.recentPerformance,
    sessionStats: state.sessionStats,
    currentOpponents: state.currentOpponents,
    
    // Helper functions
    loadAdvancedScenario: (config: AdvancedScenarioConfig) => {
      dispatch({ type: 'LOAD_ADVANCED_SCENARIO', payload: { config } });
    },
    
    submitAdvancedDecision: (decision: string, evAnalysis: DecisionEVAnalysis) => {
      dispatch({ type: 'SUBMIT_DECISION', payload: { decision, evAnalysis } });
    },
    
    updateSessionStats: () => {
      dispatch({ type: 'UPDATE_SESSION_STATS' });
    },
    
    updateRecentPerformance: () => {
      dispatch({ type: 'UPDATE_RECENT_PERFORMANCE' });
    },
    
    getPlayerReport: () => {
      return state.playerHistory.generatePlayerReport();
    },
    
    getWeaknessAnalysis: () => {
      return state.playerHistory.getWeaknessAnalysis();
    }
  };
};

// --- HELPER FUNCTIONS ---
export const gameActions = {
  loadNewScenario: () => ({ type: 'LOAD_NEW_SCENARIO' } as const),
  loadAdvancedScenario: (config: AdvancedScenarioConfig) => ({ type: 'LOAD_ADVANCED_SCENARIO', payload: { config } } as const),
  submitDecision: (correct: boolean) => ({ type: 'SUBMIT_BASIC_DECISION', payload: { correct } } as const),
  submitAdvancedDecision: (decision: string, evAnalysis: DecisionEVAnalysis) => ({ type: 'SUBMIT_DECISION', payload: { decision, evAnalysis } } as const),
  toggleMultiPlayerMode: (enabled: boolean) => ({ type: 'TOGGLE_MULTI_PLAYER_MODE', payload: { enabled } } as const),
  updateGameSettings: (settings: Partial<GameSettings>) => ({ type: 'UPDATE_GAME_SETTINGS', payload: settings } as const),
  setHandInProgress: (inProgress: boolean) => ({ type: 'SET_HAND_IN_PROGRESS', payload: { inProgress } } as const),
  resetPlayerStats: () => ({ type: 'RESET_PLAYER_STATS' } as const),
  updatePlayerHistory: (decision: PlayerDecisionHistory) => ({ type: 'UPDATE_PLAYER_HISTORY', payload: { decision } } as const),
  setEVAnalysis: (analysis: DecisionEVAnalysis) => ({ type: 'SET_EV_ANALYSIS', payload: { analysis } } as const),
  updateSessionStats: () => ({ type: 'UPDATE_SESSION_STATS' } as const),
  addOpponent: (opponent: any) => ({ type: 'ADD_OPPONENT', payload: { opponent } } as const),
  updateRecentPerformance: () => ({ type: 'UPDATE_RECENT_PERFORMANCE' } as const)
};

export type { GameState, GameSettings, PlayerStats, Action }; 