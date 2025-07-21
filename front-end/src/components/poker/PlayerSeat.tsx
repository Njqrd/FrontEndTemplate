import React from 'react';
import { Player, SeatPosition } from '@/types/player';
import Card from './Card';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PlayerSeatProps {
  player: Player;
  seatPosition: SeatPosition;
  onRemovePlayer?: (playerId: string) => void;
  canRemove?: boolean;
  isActive?: boolean;
  scale?: number;
  isLinearLayout?: boolean;
  lastAction?: {
    action: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
    amount?: number;
  };
  isFolded?: boolean;
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  seatPosition,
  onRemovePlayer,
  canRemove = false,
  isActive = true,
  scale = 0.8,
  isLinearLayout = false,
  lastAction,
  isFolded = false,
}) => {
  const handleRemove = () => {
    if (onRemovePlayer && canRemove && !player.isHero) {
      onRemovePlayer(player.id);
    }
  };

  const isHero = player.isHero;
  const containerWidth = isHero ? 280 : 140;
  const containerHeight = isHero ? 160 : 120;

  const getActionStyles = (action: string) => {
    const styles = {
      fold: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30',
      call: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30',
      raise: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30',
      bet: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30',
      'all-in': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30',
      check: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/30',
    };
    return styles[action] || 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-slate-500/30';
  };

  const getActionText = (action: any) => {
    const actionMap = {
      fold: 'FOLD',
      call: `CALL ${action.amount || 0}`,
      raise: `RAISE ${action.amount || 0}`,
      bet: `BET ${action.amount || 0}`,
      'all-in': 'ALL-IN',
      check: 'CHECK',
    };
    return actionMap[action.action] || action.action?.toUpperCase() || '';
  };

  if (!isLinearLayout) {
    // Legacy circular layout (simplified)
    return (
      <div
        className={cn(
          "absolute z-10 transition-all duration-300",
          isHero ? "transform -translate-x-1/2" : "transform -translate-x-1/2 -translate-y-1/2"
        )}
        style={{
          left: isHero ? '50%' : `calc(50% + ${seatPosition.x * scale * 0.65}px)`,
          top: isHero ? 'auto' : `calc(50% + ${seatPosition.y * scale * 0.65}px)`,
          bottom: isHero ? '40px' : 'auto',
        }}
      >
        <div className="text-white/80 text-sm font-medium">Legacy Layout</div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main Player Card Container */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-500 ease-out backdrop-blur-sm",
          "border border-white/10 shadow-xl",
          // Hero styling
          isHero && [
            "bg-gradient-to-br from-amber-50/95 via-amber-100/90 to-amber-200/85",
            "border-amber-300/50 shadow-amber-500/20",
            "ring-2 ring-amber-400/30 ring-offset-2 ring-offset-transparent",
            "p-5"
          ],
          // Non-hero styling
          !isHero && [
            isFolded
              ? "bg-gradient-to-br from-red-900/80 via-red-800/70 to-red-700/60 border-red-600/50 shadow-red-900/30"
              : "bg-gradient-to-br from-slate-800/90 via-slate-700/85 to-slate-600/80 border-slate-500/30 shadow-slate-900/40",
            "p-4"
          ],
          // State-based styling
          isActive ? "opacity-100" : "opacity-70",
          !player.isActive && "grayscale-[0.3]",
          isFolded && "saturate-50 blur-[0.5px] scale-95",
          // Hover effects
          "hover:shadow-2xl hover:scale-[1.02] hover:rotate-[0.5deg]"
        )}
        style={{
          width: containerWidth * scale,
          minHeight: containerHeight * scale,
        }}
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            {/* Player Name with Position Badge */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "font-bold truncate leading-tight px-3 py-1.5 rounded-lg",
                // Default sizing
                isHero ? "text-lg" : "text-base",
                // Position-based styling
                player.isDealer && [
                  "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
                  "shadow-md border border-amber-300/50"
                ],
                player.isSmallBlind && [
                  "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                  "shadow-md border border-blue-400/50"
                ],
                player.isBigBlind && [
                  "bg-gradient-to-r from-red-500 to-red-600 text-white",
                  "shadow-md border border-red-400/50"
                ],
                // Default non-position styling
                !player.isDealer && !player.isSmallBlind && !player.isBigBlind && [
                  isHero
                    ? "bg-amber-100/50 text-amber-900 border border-amber-200/50"
                    : isFolded
                      ? "bg-red-900/30 text-red-200/80 line-through border border-red-700/30"
                      : "bg-slate-700/50 text-slate-100 border border-slate-600/30"
                ]
              )}>
                {player.name}
                {/* Position Labels */}
                {player.isDealer && (
                  <span className="ml-1 text-xs opacity-90">DEALER</span>
                )}
                {player.isSmallBlind && (
                  <span className="ml-1 text-xs opacity-90">SB</span>
                )}
                {player.isBigBlind && (
                  <span className="ml-1 text-xs opacity-90">BB</span>
                )}
              </div>
            </div>
            
            {/* Hero Indicator */}
            {isHero && (
              <div className="text-sm text-amber-700/80 font-medium mt-1">
                (You)
              </div>
            )}
          </div>

          {/* Remove Button */}
          {canRemove && !isHero && (
            <button
              onClick={handleRemove}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "w-6 h-6 rounded-full bg-red-500 hover:bg-red-600",
                "flex items-center justify-center text-white",
                "shadow-lg hover:shadow-red-500/30"
              )}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Badge */}
        {lastAction && !isHero && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold",
              "shadow-lg border border-white/20",
              getActionStyles(lastAction.action)
            )}>
              {getActionText(lastAction)}
            </div>
          </div>
        )}

        {/* Player Cards */}
        <div className={cn(
          "flex justify-center mb-4",
          isHero ? "space-x-3" : "-space-x-2"
        )}>
          {player.holeCards && player.isHero ? (
            // Hero cards (face up, large size)
            player.holeCards.map((card, index) => (
              <div
                key={index}
                className="transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              >
                <Card suit={card.suit} rank={card.rank} faceUp size="large" />
              </div>
            ))
          ) : (
            // Other players' cards (face down, small size)
            <>
              <div className="transform transition-all duration-300 hover:scale-105">
                <Card suit="H" rank="A" faceUp={false} size="small" />
              </div>
              <div className="transform transition-all duration-300 hover:scale-105">
                <Card suit="H" rank="A" faceUp={false} size="small" />
              </div>
            </>
          )}
        </div>

        {/* Chips Display */}
        <div className="text-center">
          <div className={cn(
            "font-bold leading-tight",
            isHero
              ? "text-lg text-amber-800"
              : "text-sm text-slate-200"
          )}>
            <span className="text-xs opacity-75 block mb-1">Stack</span>
            ${player.chips.toLocaleString()}
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {player.isAllIn && (
            <div className={cn(
              "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full",
              "font-bold shadow-lg border border-purple-400/50",
              isHero ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
            )}>
              ALL-IN
            </div>
          )}
          
          {isFolded && (
            <div className={cn(
              "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full",
              "font-bold shadow-lg border border-red-400/50",
              isHero ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
            )}>
              FOLDED
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerSeat;