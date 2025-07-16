import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/types';
import { createDeck, shuffleDeck, dealCards } from '@/utils/deck';
import { evaluateHand } from '@/utils/hand-evaluator';
import Card from '@/components/poker/Card'; // Correctly import the Card component

// A re-usable PokerTable component that doesn't rely on global context
const PracticePokerTable: React.FC<{ holeCards: CardType[]; communityCards: CardType[] }> = ({ holeCards, communityCards }) => {
  const playerHand = evaluateHand(holeCards, communityCards);

  const displayCommunityCards: (CardType | null)[] = [...communityCards];
  while (displayCommunityCards.length < 5) {
    displayCommunityCards.push(null);
  }

  return (
    <div className="bg-green-800 border-4 border-yellow-700 rounded-full p-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="relative h-96">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-4">
          <h3 className="text-white absolute -top-10 left-1/2 -translate-x-1/2 text-xl font-bold">
            Community Cards
          </h3>
          {displayCommunityCards.map((card, index) =>
            card ? (
              <Card key={index} suit={card.suit} rank={card.rank} faceUp />
            ) : (
              <div key={index} className="w-24 h-36 rounded-lg bg-green-900 border-2 border-green-700" />
            )
          )}
        </div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white text-2xl font-bold">Pot: 1.5 BB</p>
        </div>
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

type Street = 'preflop' | 'flop' | 'turn' | 'river';

const PracticePage = () => {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [holeCards, setHoleCards] = useState<CardType[]>([]);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [street, setStreet] = useState<Street>('preflop');

  const dealNewHand = () => {
    const newDeck = shuffleDeck(createDeck());
    const { dealtCards: newHoleCards, remainingDeck } = dealCards(newDeck, 2);
    setHoleCards(newHoleCards);
    setCommunityCards([]);
    setDeck(remainingDeck);
    setStreet('preflop');
  };

  const dealNextStreet = () => {
    if (street === 'preflop') {
      const { dealtCards: flop, remainingDeck } = dealCards(deck, 3);
      setCommunityCards(flop);
      setDeck(remainingDeck);
      setStreet('flop');
    } else if (street === 'flop') {
      const { dealtCards: turn, remainingDeck } = dealCards(deck, 1);
      setCommunityCards([...communityCards, ...turn]);
      setDeck(remainingDeck);
      setStreet('turn');
    } else if (street === 'turn') {
      const { dealtCards: river, remainingDeck } = dealCards(deck, 1);
      setCommunityCards([...communityCards, ...river]);
      setDeck(remainingDeck);
      setStreet('river');
    }
  };

  useEffect(() => {
    dealNewHand();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-8">Practice Mode</h1>

      <div className="w-full max-w-4xl">
        {holeCards.length > 0 ? (
          <PracticePokerTable holeCards={holeCards} communityCards={communityCards} />
        ) : (
          <div className="h-[480px] flex items-center justify-center">
            <p className="text-white text-2xl">Click "Deal New Hand" to start.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-4">
        <Button size="lg" onClick={dealNewHand}>
          Deal New Hand
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={dealNextStreet}
          disabled={street !== 'preflop'}
        >
          Deal Flop
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={dealNextStreet}
          disabled={street !== 'flop'}
        >
          Deal Turn
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={dealNextStreet}
          disabled={street !== 'turn'}
        >
          Deal River
        </Button>
      </div>
    </div>
  );
};

export default PracticePage; 