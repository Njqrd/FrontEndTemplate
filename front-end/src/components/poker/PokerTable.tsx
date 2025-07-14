import React from 'react';
import Card from './Card';
import { useGame } from '@/contexts/GameContext';
import { Card as CardType } from '@/types';
import { evaluateHand } from '@/utils/hand-evaluator';

const PokerTable: React.FC = () => {
  const { currentScenario } = useGame();
  const { holeCards, communityCards, potSize } = currentScenario;

  const playerHand = evaluateHand(holeCards, communityCards);

  // Create a display array for all 5 community card slots
  const displayCommunityCards: (CardType | null)[] = [...communityCards];
  while (displayCommunityCards.length < 5) {
    displayCommunityCards.push(null);
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Outer Table Frame */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-6 rounded-3xl shadow-2xl border-4 border-amber-700">
        
        {/* Inner Felt Surface */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 rounded-2xl p-8 shadow-inner border-2 border-emerald-600 relative overflow-hidden">
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          
          {/* Main Game Area */}
          <div className="relative h-[500px]">
            
            {/* Dealer Position Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-black px-4 py-2 rounded-full shadow-lg border border-amber-300 font-bold text-sm">
                DEALER
              </div>
            </div>

            {/* Community Cards Area */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Community Cards Label */}
              <div className="text-center mb-4">
                <h3 className="text-amber-200 text-xl font-bold tracking-wider drop-shadow-lg">
                  COMMUNITY CARDS
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1 rounded-full"></div>
              </div>
              
              {/* Cards Container */}
              <div className="flex space-x-3 justify-center">
                {displayCommunityCards.map((card, index) =>
                  card ? (
                    <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                      <Card suit={card.suit} rank={card.rank} faceUp />
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="w-24 h-36 rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border-2 border-emerald-600 shadow-lg flex items-center justify-center"
                    >
                      <div className="w-16 h-24 rounded-lg border-2 border-dashed border-emerald-500 opacity-50"></div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Pot Display */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 px-8 py-4 rounded-2xl shadow-xl border-2 border-amber-400 text-center">
                <div className="text-black font-bold text-sm tracking-wide mb-1">POT</div>
                <div className="text-black text-3xl font-black tracking-wider">{potSize} BB</div>
                <div className="flex justify-center mt-2 space-x-1">
                  {Array.from({ length: Math.min(8, Math.floor(potSize / 5)) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-red-600 rounded-full border border-red-800 shadow-sm"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Area */}
            <div className="absolute top-96 left-1/2 transform -translate-x-1/2">
              {/* Player Cards */}
              <div className="flex space-x-3 justify-center mb-4">
                {holeCards.map((card, index) => (
                  <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                    <Card suit={card.suit} rank={card.rank} faceUp />
                  </div>
                ))}
              </div>
              
              {/* Player Info Panel */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 rounded-xl shadow-xl border border-slate-600">
                <div className="text-center">
                  <h3 className="text-amber-200 text-lg font-bold tracking-wider mb-2">YOUR HAND</h3>
                  {communityCards.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2 rounded-lg border border-emerald-500">
                      <p className="text-amber-100 font-bold text-lg tracking-wide">{playerHand.rankName}</p>
                    </div>
                  )}
                  {communityCards.length === 0 && (
                    <div className="text-slate-400 text-sm italic">
                      Waiting for community cards...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-amber-400 rounded-tl-lg opacity-60"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-amber-400 rounded-tr-lg opacity-60"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-amber-400 rounded-bl-lg opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-amber-400 rounded-br-lg opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable; 