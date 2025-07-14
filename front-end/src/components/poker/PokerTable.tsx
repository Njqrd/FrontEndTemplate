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
    <div className="bg-green-800 border-4 border-yellow-700 rounded-full p-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="relative h-96">
        {/* Community Card Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-4">
          <h3 className="text-white absolute -top-10 left-1/2 -translate-x-1/2 text-xl font-bold">
            Community Cards
          </h3>
          {displayCommunityCards.map((card, index) =>
            card ? (
              <Card key={index} suit={card.suit} rank={card.rank} faceUp />
            ) : (
              <div
                key={index}
                className="w-24 h-36 rounded-lg bg-green-900 border-2 border-green-700"
              />
            )
          )}
        </div>

        {/* Pot Area */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white text-2xl font-bold">Pot: {potSize} BB</p>
        </div>

        {/* Player Hand Area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex space-x-2">
            {holeCards.map((card, index) => (
              <Card key={index} suit={card.suit} rank={card.rank} faceUp />
            ))}
          </div>
          <div className="text-center mt-2">
            <h3 className="text-white text-xl font-bold">Your Hand</h3>
            {communityCards.length > 0 && (
               <p className="text-yellow-300 font-semibold text-lg">{playerHand.rankName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable; 