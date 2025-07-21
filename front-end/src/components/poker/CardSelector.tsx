import React from 'react';
import { Card, Suit, Rank } from '@/types';

interface CardSelectorProps {
  onSelect: (card: Card) => void;
  selectedCards: Card[];
  disabledCards?: Card[];
  title?: string;
  selectedCardDestinations?: Record<string, string>;
}

const CardSelector: React.FC<CardSelectorProps> = ({ onSelect, selectedCards, disabledCards = [], title, selectedCardDestinations = {} }) => {
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const ranks: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  const rankToValueMap: { [key in Rank]: number } = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
  };

  const suitSymbols: { [key in Suit]: string } = { S: '♠', H: '♥', D: '♦', C: '♣' };
  const suitColors: { [key in Suit]: string } = { S: 'text-gray-800', H: 'text-red-500', D: 'text-blue-500', C: 'text-green-500' };

  const isSelected = (card: Card) => selectedCards.some(c => c.rank === card.rank && c.suit === card.suit);
  const isDisabled = (card: Card) => disabledCards.some(c => c.rank === card.rank && c.suit === card.suit);

  const handleCardClick = (rank: Rank, suit: Suit) => {
    const card: Card = { rank, suit, value: rankToValueMap[rank] };
    if (!isDisabled(card)) {
      onSelect(card);
    }
  };

  // Color classes for each destination
  const destinationColors: Record<string, string> = {
    hero: 'border-white bg-white text-black',
    flop: 'border-blue-500 bg-blue-200 text-black',
    turn: 'border-yellow-400 bg-yellow-200 text-black',
    river: 'border-green-500 bg-green-200 text-black',
  };

  return (
    <div className="bg-slate-800 p-1 rounded-lg">
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      <div className="grid grid-cols-13 gap-x-2 gap-y-3">
        {ranks.map(rank => (
          <div key={rank} className="flex flex-col gap-y-2 gap-x-4">
            {suits.map(suit => {
              const card: Card = { rank, suit, value: rankToValueMap[rank] };
              const selected = isSelected(card);
              const disabled = isDisabled(card);
              const destination = selectedCardDestinations[`${card.rank}${card.suit}`];
              const colorClass = selected ? (destinationColors[destination] || 'border-yellow-500 bg-yellow-400 text-black') : '';

              return (
                <button
                  key={suit}
                  onClick={() => handleCardClick(rank, suit)}
                  disabled={disabled}
                  className={`w-6 h-12 flex flex-col items-center justify-center rounded-md border transition-all duration-150
                    ${suitColors[suit]}
                    ${selected ? `transform scale-105 shadow-lg ${colorClass}` : 'bg-slate-700 border-slate-600'}
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-600'}
                  `}
                >
                  <span className="text-xl font-bold">{rank}</span>
                  <span className="text-lg">{suitSymbols[suit]}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Add grid-cols-13 to tailwind config if it doesn't exist
// tailwind.config.js
// theme: {
//   extend: {
//     gridTemplateColumns: {
//       '13': 'repeat(13, minmax(0, 1fr))',
//     }
//   }
// }

export default CardSelector;