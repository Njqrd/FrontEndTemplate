import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins, ArrowRight, X, Phone, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BettingAction {
  playerId: string;
  playerName: string;
  position: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
  amount?: number;
  isFolded?: boolean;
  isAllIn?: boolean;
  playerType?: string;
}

interface BettingActionSequenceProps {
  actions: BettingAction[];
  currentStreet: string;
  potSize: number;
  className?: string;
}

const BettingActionSequence: React.FC<BettingActionSequenceProps> = ({
  actions,
  currentStreet,
  potSize,
  className
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'fold':
        return <X className="w-3 h-3" />;
      case 'call':
        return <Phone className="w-3 h-3" />;
      case 'raise':
      case 'bet':
        return <TrendingUp className="w-3 h-3" />;
      case 'all-in':
        return <Coins className="w-3 h-3" />;
      case 'check':
        return <div className="w-3 h-3 rounded-full border border-current" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-current" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'fold':
        return 'bg-red-600 text-white';
      case 'call':
        return 'bg-blue-600 text-white';
      case 'raise':
      case 'bet':
        return 'bg-green-600 text-white';
      case 'all-in':
        return 'bg-purple-600 text-white';
      case 'check':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getActionText = (action: BettingAction) => {
    switch (action.action) {
      case 'fold':
        return 'FOLD';
      case 'call':
        return `CALL ${action.amount || 0}`;
      case 'raise':
        return `RAISE ${action.amount || 0}`;
      case 'bet':
        return `BET ${action.amount || 0}`;
      case 'all-in':
        return 'ALL-IN';
      case 'check':
        return 'CHECK';
      default:
        return action.action.toUpperCase();
    }
  };

  const activePlayers = actions.filter(a => !a.isFolded);
  const foldedPlayers = actions.filter(a => a.isFolded);

  return (
    <div className={cn("bg-slate-800 rounded-lg p-4 border border-slate-600", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-amber-200 font-bold text-sm tracking-wider">
          BETTING ACTION - {currentStreet.toUpperCase()}
        </h3>
        <div className="bg-amber-600 px-2 py-1 rounded text-black font-bold text-xs">
          POT: {potSize} BB
        </div>
      </div>

      {/* Action Sequence */}
      <div className="space-y-3">
        {/* Active Players */}
        {activePlayers.length > 0 && (
          <div>
            <h4 className="text-slate-300 font-medium text-xs mb-2">Active Players</h4>
            <div className="flex flex-wrap gap-2">
              {activePlayers.map((action, index) => (
                <div key={`${action.playerId}-${index}`} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-lg border border-slate-600">
                    <div className="text-slate-300 font-medium text-xs">
                      {action.playerName}
                    </div>
                    <Badge className={cn("text-xs px-2 py-1", getActionColor(action.action))}>
                      <div className="flex items-center space-x-1">
                        {getActionIcon(action.action)}
                        <span>{getActionText(action)}</span>
                      </div>
                    </Badge>
                    {action.playerType && (
                      <div className="text-xs text-slate-400">
                        ({action.playerType})
                      </div>
                    )}
                  </div>
                  {index < activePlayers.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folded Players */}
        {foldedPlayers.length > 0 && (
          <div>
            <h4 className="text-slate-400 font-medium text-xs mb-2">Folded Players</h4>
            <div className="flex flex-wrap gap-2">
              {foldedPlayers.map((action, index) => (
                <div key={`folded-${action.playerId}-${index}`} className="flex items-center space-x-2 opacity-60">
                  <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                    <div className="text-slate-500 font-medium text-xs line-through">
                      {action.playerName}
                    </div>
                    <Badge className="bg-red-700 text-white text-xs px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <X className="w-3 h-3" />
                        <span>FOLD</span>
                      </div>
                    </Badge>
                    {action.playerType && (
                      <div className="text-xs text-slate-500">
                        ({action.playerType})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center text-xs">
            <div className="text-slate-400">
              Players: {activePlayers.length} active, {foldedPlayers.length} folded
            </div>
            <div className="text-slate-400">
              Actions: {actions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingActionSequence; 