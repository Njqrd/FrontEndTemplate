import React, { useState, useMemo } from 'react';
import { Card } from '@/types';
import CardSelector from '@/components/poker/CardSelector';
import HandAnalysisPanel from '@/components/poker/HandAnalysisPanel';
import CardComponent from '@/components/poker/Card';
import Header from '@/components/layout/Header';

const SandboxPage = () => {
  const [heroCards, setHeroCards] = useState<Card[]>([]);
  const [flopCards, setFlopCards] = useState<Card[]>([]);
  const [turnCard, setTurnCard] = useState<Card[]>([]);
  const [riverCard, setRiverCard] = useState<Card[]>([]);
  const [opponentCount, setOpponentCount] = useState<number>(1);

  const [activeSelector, setActiveSelector] = useState<'hero' | 'flop' | 'turn' | 'river' | null>('hero');

  const allSelectedCards = useMemo(() => {
    return [...heroCards, ...flopCards, ...turnCard, ...riverCard];
  }, [heroCards, flopCards, turnCard, riverCard]);

  // --- Card Selector Enable/Disable Logic ---
  const isFlopComplete = flopCards.length === 3;
  const isTurnComplete = turnCard.length === 1;

  const handleCardSelect = (card: Card) => {
    if (!activeSelector) return;

    // Prevent selecting turn before flop is complete, or river before turn is complete
    if ((activeSelector === 'turn' && !isFlopComplete) || (activeSelector === 'river' && !isTurnComplete)) {
      return;
    }

    const isAlreadySelected = allSelectedCards.some(c => c.rank === card.rank && c.suit === card.suit);

    if (isAlreadySelected) {
      setHeroCards(prev => prev.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      setFlopCards(prev => prev.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      setTurnCard(prev => prev.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      setRiverCard(prev => prev.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      return;
    }

    switch (activeSelector) {
      case 'hero':
        if (heroCards.length < 2) setHeroCards(prev => [...prev, card]);
        break;
      case 'flop':
        if (flopCards.length < 3) setFlopCards(prev => [...prev, card]);
        break;
      case 'turn':
        if (isFlopComplete && turnCard.length < 1) setTurnCard([card]);
        break;
      case 'river':
        if (isTurnComplete && riverCard.length < 1) setRiverCard([card]);
        break;
    }
  };
  
  const communityCards = [...flopCards, ...turnCard, ...riverCard];

  // Build a map of selected card destinations
  const selectedCardDestinations: Record<string, string> = {};
  heroCards.forEach(card => { selectedCardDestinations[`${card.rank}${card.suit}`] = 'hero'; });
  flopCards.forEach(card => { selectedCardDestinations[`${card.rank}${card.suit}`] = 'flop'; });
  turnCard.forEach(card => { selectedCardDestinations[`${card.rank}${card.suit}`] = 'turn'; });
  riverCard.forEach(card => { selectedCardDestinations[`${card.rank}${card.suit}`] = 'river'; });

  const renderCardPlaceholder = (count: number, max: number, type: string) => {
    if (count < max) {
      return <div className="text-gray-500 text-sm">Select {type} ({count}/{max})</div>;
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col bg-gray-100 dark:bg-gray-900">

      <div className="flex-1 h-full w-full bg-gray-900 text-white p-0 flex gap-4">
        {/* Main Analysis Panel */}
        <div className="flex-1 flex flex-col">
          <HandAnalysisPanel 
              heroHand={heroCards} 
              communityCards={communityCards} 
              villainCount={opponentCount} 
          />
        </div>

        {/* Controls Sidebar */}
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">Poker Sandbox</h1>
            <p className="text-gray-400 text-sm">Build a hand to see real-time analysis.</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            {/* Hero Hand */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-amber-400">Your Hand</h2>
                {heroCards.length > 0 && (
                  <button
                    className="text-gray-400 hover:text-red-500 text-xl px-2 focus:outline-none"
                    title="Clear Hero Hand"
                    onClick={() => setHeroCards([])}
                    aria-label="Clear Hero Hand"
                  >
                    ×
                  </button>
                )}
              </div>
              <div 
                className={`p-2 rounded-md border-2 ${activeSelector === 'hero' ? 'border-blue-500' : 'border-white'} cursor-pointer bg-gray-900/50`}
                onClick={() => setActiveSelector('hero')}
              >
                <div className="flex gap-4 h-32 items-center justify-center">
                  {heroCards.map((card, i) => <CardComponent key={i} suit={card.suit} rank={card.rank} faceUp={true} />)}
                  {renderCardPlaceholder(heroCards.length, 2, 'Hero')}
                </div>
              </div>
            </div>

            {/* Community Cards */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-amber-400">Community Cards</h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-medium text-blue-300">Flop</span>
                  {flopCards.length > 0 && (
                    <button
                      className="text-gray-400 hover:text-red-500 text-xl px-2 focus:outline-none"
                      title="Clear Flop"
                      onClick={() => setFlopCards([])}
                      aria-label="Clear Flop"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div 
                  className={`p-2 rounded-md border-2 ${activeSelector === 'flop' ? 'border-blue-500' : 'border-blue-500'} cursor-pointer bg-gray-900/50`}
                  onClick={() => setActiveSelector('flop')}
                >
                  <div className="flex gap-4 h-32 items-center justify-center">
                    {flopCards.map((card, i) => <CardComponent key={i} suit={card.suit} rank={card.rank} faceUp={true} />)}
                    {renderCardPlaceholder(flopCards.length, 3, 'Flop')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-medium text-yellow-300">Turn</span>
                      {turnCard.length > 0 && (
                        <button
                          className="text-gray-400 hover:text-red-500 text-xl px-2 focus:outline-none"
                          title="Clear Turn"
                          onClick={() => setTurnCard([])}
                          aria-label="Clear Turn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div 
                      className={`p-2 rounded-md border-2 ${activeSelector === 'turn' ? 'border-blue-500' : 'border-yellow-400'} cursor-pointer bg-gray-900/50 ${!isFlopComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => isFlopComplete && setActiveSelector('turn')}
                      title={!isFlopComplete ? 'Select all 3 flop cards first' : ''}
                    >
                      <div className="flex gap-4 h-32 items-center justify-center">
                        {turnCard.map((card, i) => <CardComponent key={i} suit={card.suit} rank={card.rank} faceUp={true} />)}
                        {renderCardPlaceholder(turnCard.length, 1, 'Turn')}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-medium text-green-300">River</span>
                      {riverCard.length > 0 && (
                        <button
                          className="text-gray-400 hover:text-red-500 text-xl px-2 focus:outline-none"
                          title="Clear River"
                          onClick={() => setRiverCard([])}
                          aria-label="Clear River"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div 
                      className={`p-2 rounded-md border-2 ${activeSelector === 'river' ? 'border-blue-500' : 'border-green-500'} cursor-pointer bg-gray-900/50 ${!isTurnComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => isTurnComplete && setActiveSelector('river')}
                      title={!isTurnComplete ? 'Select the turn card first' : ''}
                    >
                      <div className="flex gap-4 h-32 items-center justify-center">
                        {riverCard.map((card, i) => <CardComponent key={i} suit={card.suit} rank={card.rank} faceUp={true} />)}
                        {renderCardPlaceholder(riverCard.length, 1, 'River')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Opponents */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-amber-400">Opponents</h2>
              <select
                value={opponentCount}
                onChange={(e) => setOpponentCount(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded-md p-2 w-full"
              >
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} Opponent{i > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg flex-1">
            <h2 className="text-lg font-semibold mb-2 text-center text-amber-400">Select Cards</h2>
            <CardSelector
              onSelect={handleCardSelect}
              selectedCards={allSelectedCards}
              disabledCards={allSelectedCards}
              selectedCardDestinations={selectedCardDestinations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxPage;