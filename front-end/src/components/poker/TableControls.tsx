import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, RotateCcw, Play, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGame, gameActions } from '@/contexts/GameContext';

interface TableControlsProps {
  playerCount: number;
  canAddPlayer: boolean;
  canRemovePlayer: boolean;
  onAddPlayer: () => void;
  onRemovePlayer: () => void;
  onResetTable: () => void;
  onMoveButton: () => void;
  onStartHand?: () => void;
  className?: string;
}

const TableControls: React.FC<TableControlsProps> = ({
  playerCount,
  canAddPlayer,
  canRemovePlayer,
  onAddPlayer,
  onRemovePlayer,
  onResetTable,
  onMoveButton,
  onStartHand,
  className,
}) => {
  const { gameSettings, handInProgress, playerStats, dispatch } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleMultiPlayerMode = () => {
    dispatch(gameActions.toggleMultiPlayerMode(!gameSettings.showMultiPlayerControls));
  };

  const handleUpdateSettings = (settings: Partial<typeof gameSettings>) => {
    dispatch(gameActions.updateGameSettings(settings));
  };

  const handleResetStats = () => {
    dispatch(gameActions.resetPlayerStats());
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      
      {/* Main Controls */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-xl border-2 border-slate-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-200 font-bold text-sm tracking-wider">TABLE CONTROLS</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Player Count Display */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-600">
            <span className="text-slate-400 text-xs">Players:</span>
            <span className="text-amber-200 font-bold text-sm">{playerCount}/10</span>
          </div>
        </div>

        {/* Player Management */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={onAddPlayer}
            disabled={!canAddPlayer || handInProgress}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-white border border-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Player</span>
          </Button>
          
          <Button
            onClick={onRemovePlayer}
            disabled={!canRemovePlayer || handInProgress}
            size="sm"
            variant="destructive"
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-white border border-white"
          >
            <Minus className="w-4 h-4" />
            <span>Remove</span>
          </Button>
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onMoveButton}
            disabled={handInProgress}
            size="sm"
            variant="outline"
            className="disabled:opacity-50 disabled:cursor-not-allowed text-xs text-white border-white"
          >
            Move Button
          </Button>
          
          <Button
            onClick={onResetTable}
            disabled={handInProgress}
            size="sm"
            variant="outline"
            className="flex items-center space-x-1 text-xs text-white border-white"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Start Hand Button */}
        {onStartHand && (
          <div className="mt-4 pt-3 border-t border-slate-600">
            <Button
              onClick={onStartHand}
              disabled={handInProgress}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-white border border-white"
            >
              <Play className="w-4 h-4" />
              <span>Start Hand</span>
            </Button>
          </div>
        )}
      </div>

      {/* Player Stats Panel */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-xl border-2 border-slate-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-200 font-bold text-sm tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>YOUR STATS</span>
          </h3>
          <Button
            onClick={handleResetStats}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 text-white border-white"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{playerStats.chips}</div>
            <div className="text-xs text-slate-400">Chips</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{playerStats.streak}</div>
            <div className="text-xs text-slate-400">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {playerStats.totalAnswered > 0 ? Math.round((playerStats.correctAnswers / playerStats.totalAnswered) * 100) : 0}%
            </div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-300">{playerStats.totalAnswered}</div>
            <div className="text-xs text-slate-400">Hands</div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-xl border-2 border-slate-600 p-4">
          <h3 className="text-amber-200 font-bold text-sm tracking-wider mb-3">SETTINGS</h3>
          
          <div className="space-y-4">
            {/* Game Settings */}
            <div>
              <label className="text-slate-300 text-xs mb-2 block">Game Settings</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.autoAdvanceScenarios}
                    onChange={(e) => handleUpdateSettings({ autoAdvanceScenarios: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300 text-xs">Auto-advance scenarios</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.animationsEnabled}
                    onChange={(e) => handleUpdateSettings({ animationsEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300 text-xs">Enable animations</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.soundEnabled}
                    onChange={(e) => handleUpdateSettings({ soundEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300 text-xs">Enable sound</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.randomizePositions}
                    onChange={(e) => handleUpdateSettings({ randomizePositions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300 text-xs">Randomize positions each hand</span>
                </label>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="text-slate-300 text-xs mb-2 block">Quick Actions</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    // Add 3 players quickly
                    for (let i = 0; i < 3 && canAddPlayer; i++) {
                      onAddPlayer();
                    }
                  }}
                  disabled={!canAddPlayer || handInProgress}
                  size="sm"
                  variant="outline"
                  className="text-xs text-white border-white"
                >
                  Add 3 Players
                </Button>
                
                <Button
                  onClick={() => {
                    // Fill table to 6 players
                    while (playerCount < 6 && canAddPlayer) {
                      onAddPlayer();
                    }
                  }}
                  disabled={!canAddPlayer || playerCount >= 6 || handInProgress}
                  size="sm"
                  variant="outline"
                  className="text-xs text-white border-white"
                >
                  Fill to 6
                </Button>
              </div>
            </div>

            {/* Table Information */}
            <div>
              <label className="text-slate-300 text-xs mb-2 block">Table Info</label>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Min Players: 2</div>
                <div>Max Players: 10</div>
                <div>Current: {playerCount} players</div>
                <div>Hand Status: {handInProgress ? 'In Progress' : 'Ready'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700 p-3">
        <h4 className="text-amber-200 font-bold text-xs mb-2">INSTRUCTIONS</h4>
        <ul className="text-slate-400 text-xs space-y-1">
          <li>• Add/remove players to change table size</li>
          <li>• Move Button advances the dealer position</li>
          <li>• Reset returns table to default state</li>
          <li>• Hero (you) cannot be removed</li>
          <li>• Controls disabled during active hands</li>
        </ul>
      </div>
    </div>
  );
};

export default TableControls; 