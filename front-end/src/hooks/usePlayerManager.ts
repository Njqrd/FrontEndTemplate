import { useState, useCallback } from 'react';
import { Player, GameSettings } from '@/types/player';
import { 
  generatePlayerName, 
  generateAvatarColor, 
  getOptimalSeatPosition,
  getBlindPositions,
  getNextButtonPosition
} from '@/utils/table-positioning';
import { useGame } from '@/contexts/GameContext';

export interface UsePlayerManagerReturn {
  players: Player[];
  gameSettings: GameSettings;
  addPlayer: () => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  moveButton: () => void;
  resetTable: () => void;
  canAddPlayer: boolean;
  canRemovePlayer: boolean;
  heroPlayer: Player | null;
}

const DEFAULT_GAME_SETTINGS: GameSettings = {
  minPlayers: 2,
  maxPlayers: 10,
  smallBlind: 1,
  bigBlind: 2,
  startingChips: 1000,
  autoAdvance: true,
};

export function usePlayerManager(): UsePlayerManagerReturn {
  const { gameSettings: contextGameSettings } = useGame();

  const [players, setPlayers] = useState<Player[]>(() => {
    // Initialize with 2 players (minimum)
    const initialPlayers: Player[] = [
      {
        id: 'hero',
        name: 'Hero',
        chips: DEFAULT_GAME_SETTINGS.startingChips,
        position: 0,
        isHero: true,
        isActive: true,
        holeCards: null,
        isDealer: true,
        isBigBlind: false,
        isSmallBlind: true, // In heads-up, button is small blind
        isAllIn: false,
        currentBet: 0,
        hasActed: false,
        avatarColor: generateAvatarColor(0),
      },
      {
        id: 'villain',
        name: 'Villain',
        chips: DEFAULT_GAME_SETTINGS.startingChips,
        position: 1,
        isHero: false,
        isActive: true,
        holeCards: null,
        isDealer: false,
        isBigBlind: true,
        isSmallBlind: false,
        isAllIn: false,
        currentBet: 0,
        hasActed: false,
        avatarColor: generateAvatarColor(1),
      },
    ];
    return initialPlayers;
  });

  const [gameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [buttonPosition, setButtonPosition] = useState<number>(0);

  // Helper to find hero player
  const heroPlayer = players.find(p => p.isHero) || null;

  // Check if we can add/remove players
  const canAddPlayer = players.length < gameSettings.maxPlayers;
  const canRemovePlayer = players.length > gameSettings.minPlayers;

  // Add a new player
  const addPlayer = useCallback(() => {
    if (!canAddPlayer) return;

    const occupiedPositions = players.map(p => p.position);
    const newPosition = getOptimalSeatPosition(occupiedPositions, gameSettings.maxPlayers);
    
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: generatePlayerName(players.length),
      chips: gameSettings.startingChips,
      position: newPosition,
      isHero: false,
      isActive: true,
      holeCards: null,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: false,
      isAllIn: false,
      currentBet: 0,
      hasActed: false,
      avatarColor: generateAvatarColor(players.length),
    };

    setPlayers(prev => {
      const newPlayers = [...prev, newPlayer];
      return updateBlindPositions(newPlayers, buttonPosition);
    });
  }, [players, canAddPlayer, gameSettings, buttonPosition]);

  // Remove a player
  const removePlayer = useCallback((playerId: string) => {
    if (!canRemovePlayer || playerId === 'hero') return; // Can't remove hero

    setPlayers(prev => {
      const newPlayers = prev.filter(p => p.id !== playerId);
      // Recalculate positions and blinds
      return updateBlindPositions(newPlayers, buttonPosition);
    });
  }, [canRemovePlayer, buttonPosition]);

  // Update a specific player
  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, ...updates }
          : player
      )
    );
  }, []);

  // Move dealer button to next position
  const moveButton = useCallback(() => {
    console.log('moveButton called, randomizePositions:', contextGameSettings.randomizePositions);
    
    if (contextGameSettings.randomizePositions) {
      console.log('Randomizing button position...');
      // Randomly select a new button position
      const newButtonPosition = Math.floor(Math.random() * players.length);
      console.log('New random button position:', newButtonPosition);
      
      // Update both button position and players in one go
      setButtonPosition(newButtonPosition);
      setPlayers(prev => updateBlindPositions(prev, newButtonPosition));
    } else {
      console.log('Not randomizing, just moving button');
      const newButtonPosition = getNextButtonPosition(buttonPosition, players.length);
      console.log('New sequential button position:', newButtonPosition);
      
      setButtonPosition(newButtonPosition);
      setPlayers(prev => updateBlindPositions(prev, newButtonPosition));
    }
  }, [buttonPosition, players.length, contextGameSettings.randomizePositions]);

  // Reset table to initial state
  const resetTable = useCallback(() => {
    setPlayers([
      {
        id: 'hero',
        name: 'Hero',
        chips: gameSettings.startingChips,
        position: 0,
        isHero: true,
        isActive: true,
        holeCards: null,
        isDealer: true,
        isBigBlind: false,
        isSmallBlind: true,
        isAllIn: false,
        currentBet: 0,
        hasActed: false,
        avatarColor: generateAvatarColor(0),
      },
      {
        id: 'villain',
        name: 'Villain',
        chips: gameSettings.startingChips,
        position: 1,
        isHero: false,
        isActive: true,
        holeCards: null,
        isDealer: false,
        isBigBlind: true,
        isSmallBlind: false,
        isAllIn: false,
        currentBet: 0,
        hasActed: false,
        avatarColor: generateAvatarColor(1),
      },
    ]);
    setButtonPosition(0);
  }, [gameSettings]);

  return {
    players,
    gameSettings,
    addPlayer,
    removePlayer,
    updatePlayer,
    moveButton,
    resetTable,
    canAddPlayer,
    canRemovePlayer,
    heroPlayer,
  };
}

// Helper function to update blind positions
function updateBlindPositions(players: Player[], buttonPosition: number): Player[] {
  console.log('updateBlindPositions called with buttonPosition:', buttonPosition);
  const { smallBlind, bigBlind } = getBlindPositions(buttonPosition, players.length);
  console.log('Blind positions - SB:', smallBlind, 'BB:', bigBlind);
  
  const updatedPlayers = players.map((player, index) => {
    let positionName = '';
    if (index === buttonPosition) {
      positionName = player.isHero ? 'Hero (Dealer)' : 'Dealer';
    } else if (index === smallBlind) {
      positionName = player.isHero ? 'Hero (Small Blind)' : 'Small Blind';
    } else if (index === bigBlind) {
      positionName = player.isHero ? 'Hero (Big Blind)' : 'Big Blind';
    } else {
      positionName = player.isHero ? 'Hero' : `Player ${index + 1}`;
    }
    
    console.log(`Player ${index}: ${player.name} -> ${positionName}`);
    
    return {
      ...player,
      name: positionName,
      isDealer: index === buttonPosition,
      isSmallBlind: index === smallBlind,
      isBigBlind: index === bigBlind,
    };
  });
  
  console.log('Updated players:', updatedPlayers.map(p => p.name));
  return updatedPlayers;
} 