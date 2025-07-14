import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Decision } from '@/types';
import FeedbackDialog from './FeedbackDialog';
import { TrendingDown, Minus, TrendingUp } from 'lucide-react';

const DecisionPanel: React.FC = () => {
  const { currentScenario, dispatch } = useGame();
  const [feedback, setFeedback] = useState<{ isOpen: boolean; isCorrect: boolean } | null>(null);

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
      {/* Main Decision Panel */}
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-600 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-8 py-4 border-b-2 border-amber-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <h2 className="text-black font-black text-xl tracking-wider">{currentScenario.title}</h2>
              </div>
              <div className="bg-black bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-black font-bold text-sm tracking-wide">{currentScenario.street.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Scenario Description */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-800 to-slate-700">
            <div className="text-center">
              <p className="text-slate-200 text-lg leading-relaxed font-medium">
                {currentScenario.action}
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <span className="px-3 py-1 bg-emerald-700 text-emerald-100 rounded-full text-xs font-semibold">
                  {currentScenario.position}
                </span>
                <span className="px-3 py-1 bg-blue-700 text-blue-100 rounded-full text-xs font-semibold">
                  {currentScenario.villainType}
                </span>
                <span className="px-3 py-1 bg-purple-700 text-purple-100 rounded-full text-xs font-semibold">
                  Stack: {currentScenario.effectiveStack} BB
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-8 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
            <div className="text-center mb-6">
              <h3 className="text-amber-200 text-xl font-bold tracking-wider mb-2">MAKE YOUR DECISION</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full"></div>
            </div>
            
            <div className="flex justify-center space-x-6">
              {/* Fold Button */}
              <button
                onClick={() => handleDecision('fold')}
                disabled={feedback?.isOpen}
                className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:via-red-400 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-xl border-2 border-red-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <TrendingDown className="w-6 h-6 text-white" />
                  <span className="text-white font-black text-lg tracking-wider">FOLD</span>
                </div>
              </button>

              {/* Call Button */}
              <button
                onClick={() => handleDecision('call')}
                disabled={feedback?.isOpen}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:via-blue-400 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-xl border-2 border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <Minus className="w-6 h-6 text-white" />
                  <span className="text-white font-black text-lg tracking-wider">CALL</span>
                </div>
              </button>

              {/* Raise Button */}
              <button
                onClick={() => handleDecision('raise')}
                disabled={feedback?.isOpen}
                className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-xl border-2 border-emerald-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <span className="text-white font-black text-lg tracking-wider">RAISE</span>
                </div>
              </button>
            </div>

            {/* Subtle Action Hint */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm italic">
                Choose wisely. Your decision will be evaluated against optimal play.
              </p>
            </div>
          </div>

          {/* Decorative Bottom Border */}
          <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
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

export default DecisionPanel; 