import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Decision } from '@/types';
import FeedbackDialog from './FeedbackDialog';

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
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-4">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <p className="font-bold text-lg">{currentScenario.title}</p>
            <p className="text-sm text-gray-400">{currentScenario.action}</p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleDecision('fold')}
              disabled={feedback?.isOpen}
            >
              Fold
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleDecision('call')}
              disabled={feedback?.isOpen}
            >
              Call
            </Button>
            <Button
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleDecision('raise')}
              disabled={feedback?.isOpen}
            >
              Raise
            </Button>
          </div>
        </div>
      </div>

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