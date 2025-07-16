import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Scenario } from '@/types';
import { generateScenario } from '@/utils/scenario-generator';

// --- STATE SHAPE ---
interface PlayerStats {
  chips: number;
  correctAnswers: number;
  totalAnswered: number;
  streak: number;
}

interface GameState {
  currentScenario: Scenario;
  playerStats: PlayerStats;
  // TODO: Add gameSettings and progress tracking
}

// --- ACTIONS ---
type Action = { type: 'LOAD_DYNAMIC_SCENARIO' } | { type: 'SUBMIT_DECISION'; payload: { correct: boolean } };

// --- INITIAL STATE ---
const initialState: GameState = {
  currentScenario: generateScenario(),
  playerStats: {
    chips: 1000,
    correctAnswers: 0,
    totalAnswered: 0,
    streak: 0,
  },
};

// --- REDUCER ---
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'LOAD_DYNAMIC_SCENARIO': {
      return {
        ...state,
        currentScenario: generateScenario(),
      };
    }
    case 'SUBMIT_DECISION': {
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
      };
    }
    default:
      return state;
  }
};

// --- CONTEXT ---
interface GameContextType extends GameState {
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// --- PROVIDER ---
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return <GameContext.Provider value={{ ...state, dispatch }}>{children}</GameContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 