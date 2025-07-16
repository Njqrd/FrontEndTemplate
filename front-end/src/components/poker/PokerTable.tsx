import React, { useState } from 'react';
import Card from './Card';
import { useGame } from '@/contexts/GameContext';
import { Card as CardType, Decision } from '@/types';
import { evaluateHand } from '@/utils/hand-evaluator';
import FeedbackDialog from './FeedbackDialog';
import { TrendingDown, Minus, TrendingUp } from 'lucide-react';

const PokerTable: React.FC = () => {
  const { currentScenario, dispatch } = useGame();
  const { holeCards, communityCards, potSize, position } = currentScenario;
  const [feedback, setFeedback] = useState<{ isOpen: boolean; isCorrect: boolean } | null>(null);

  const playerHand = evaluateHand(holeCards, communityCards);

  // Create a display array for all 5 community card slots
  const displayCommunityCards: (CardType | null)[] = [...communityCards];
  while (displayCommunityCards.length < 5) {
    displayCommunityCards.push(null);
  }

  const handleDecision = (decision: Decision) => {
    const isCorrect = decision === currentScenario.correctDecision;
    dispatch({ type: 'SUBMIT_DECISION', payload: { correct: isCorrect } });
    setFeedback({ isOpen: true, isCorrect });
  };

  const handleContinue = () => {
    setFeedback(null);
    dispatch({ type: 'LOAD_DYNAMIC_SCENARIO' });
  };

  return (
    <>
      <div className="relative w-full h-full">
        {/* Outer Table Frame */}
        <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-3 rounded-3xl shadow-2xl border-4 border-amber-700 h-full">
          
          {/* Inner Felt Surface */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 rounded-2xl p-4 shadow-inner border-2 border-emerald-600 relative overflow-hidden h-full">
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            
            {/* Main Game Area */}
            <div className="relative h-full flex flex-col">
              
              {/* Dealer Position Indicator */}
              <div className="flex justify-center mb-2">
                <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-black px-3 py-1 rounded-full shadow-lg border border-amber-300 font-bold text-xs">
                  DEALER
                </div>
              </div>

              {/* Scenario Info Bar */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-xl border border-slate-600 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      <h3 className="text-amber-200 font-bold text-xs tracking-wider">{currentScenario.title}</h3>
                      <div className="bg-amber-600 text-black px-2 py-0.5 rounded text-xs font-bold">
                        {currentScenario.street.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-slate-200 text-xs font-medium">{currentScenario.action}</p>
                    <div className="mt-1 flex space-x-2">
                      <span className="px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded text-xs font-semibold">
                        {currentScenario.position}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-700 text-blue-100 rounded text-xs font-semibold">
                        {currentScenario.villainType}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-700 text-purple-100 rounded text-xs font-semibold">
                        Stack: {currentScenario.effectiveStack} BB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Cards Area */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Community Cards Label */}
                <div className="text-center mb-3">
                  <h3 className="text-amber-200 text-lg font-bold tracking-wider drop-shadow-lg">
                    COMMUNITY CARDS
                  </h3>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1 rounded-full"></div>
                </div>
                
                {/* Cards Container */}
                <div className="flex space-x-2 justify-center">
                  {displayCommunityCards.map((card, index) =>
                    card ? (
                      <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                        <Card suit={card.suit} rank={card.rank} faceUp />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="w-18 h-24 rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border-2 border-emerald-600 shadow-lg flex items-center justify-center"
                      >
                        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-emerald-500 opacity-50"></div>
                      </div>
                    )
                  )}
                </div>

                {/* Pot Display */}
                <div className="mt-4 mb-4">
                  <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 px-4 py-2 rounded-2xl shadow-xl border-2 border-amber-400 text-center">
                    <div className="text-black font-bold text-xs tracking-wide mb-1">POT</div>
                    <div className="text-black text-lg font-black tracking-wider">{potSize} BB</div>
                    <div className="flex justify-center mt-1 space-x-1">
                      {Array.from({ length: Math.min(6, Math.floor(potSize / 5)) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-600 rounded-full border border-red-800 shadow-sm"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Area */}
              <div className="mt-auto">
                {/* Player Cards */}
                <div className="flex space-x-2 justify-center mb-3">
                  {holeCards.map((card, index) => (
                    <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                      <Card suit={card.suit} rank={card.rank} faceUp />
                    </div>
                  ))}
                </div>
                
                {/* Player Info Panel */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-3 py-2 rounded-xl shadow-xl border border-slate-600 mb-3">
                  <div className="text-center">
                    <h3 className="text-amber-200 text-sm font-bold tracking-wider mb-1">YOUR HAND</h3>
                    {communityCards.length > 0 && (
                      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-2 py-1 rounded-lg border border-emerald-500">
                        <p className="text-amber-100 font-bold text-sm tracking-wide">{playerHand.rankName}</p>
                      </div>
                    )}
                    {communityCards.length === 0 && (
                      <div className="text-slate-400 text-xs italic">
                        Waiting for community cards...
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-1">
                    <p className="text-amber-200 text-xs font-bold">Position: {position}</p>
                  </div>
                </div>

                {/* Decision Buttons */}
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleDecision('fold')}
                    disabled={feedback?.isOpen}
                    className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:via-red-400 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg shadow-lg border-2 border-red-400 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3 text-white" />
                      <span className="text-white font-bold text-xs tracking-wider">FOLD</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDecision('call')}
                    disabled={feedback?.isOpen}
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:via-blue-400 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg shadow-lg border-2 border-blue-400 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative flex items-center space-x-1">
                      <Minus className="w-3 h-3 text-white" />
                      <span className="text-white font-bold text-xs tracking-wider">CALL</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDecision('raise')}
                    disabled={feedback?.isOpen}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg shadow-lg border-2 border-emerald-400 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-white" />
                      <span className="text-white font-bold text-xs tracking-wider">RAISE</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-4 border-t-4 border-amber-400 rounded-tl-lg opacity-60"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-4 border-t-4 border-amber-400 rounded-tr-lg opacity-60"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-4 border-b-4 border-amber-400 rounded-bl-lg opacity-60"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-4 border-b-4 border-amber-400 rounded-br-lg opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      {feedback?.isOpen && (
        <FeedbackDialog
          isOpen={feedback.isOpen}
          isCorrect={feedback.isCorrect}
          explanation={currentScenario.explanation}
          onContinue={handleContinue}
        />
      )}
    </>
  );
};

export default PokerTable; 