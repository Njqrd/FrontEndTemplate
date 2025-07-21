import { Card, Suit, Rank } from '@/types';
import { rankToValue } from '@/utils/hand-evaluator';

interface CardGridProps {
  requiredCards: Card[];
  title?: string;
}

const CardGrid = ({ requiredCards, title }: CardGridProps) => {
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const ranks: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  const suitSymbols = {
    S: '♠',
    H: '♥', 
    D: '♦',
    C: '♣'
  };
  
  const suitColors = {
    S: 'text-gray-800',
    H: 'text-red-600',
    D: 'text-red-600', 
    C: 'text-gray-800'
  };
  
  // Create a set of required cards for quick lookup
  const requiredCardSet = new Set(
    requiredCards.map(card => `${card.rank}${card.suit}`)
  );
  
  const isCardRequired = (rank: Rank, suit: Suit): boolean => {
    return requiredCardSet.has(`${rank}${suit}`);
  };
  
  // If no required cards, don't render the grid
  if (requiredCards.length === 0) {
    return null;
  }
  
  // Find which ranks and suits have required cards
  const ranksWithCards = new Set<Rank>();
  const suitsWithCards = new Set<Suit>();
  
  requiredCards.forEach(card => {
    ranksWithCards.add(card.rank);
    suitsWithCards.add(card.suit);
  });
  
  // Filter to only show ranks and suits that have required cards
  const filteredRanks = ranks.filter(rank => ranksWithCards.has(rank));
  const filteredSuits = suits.filter(suit => suitsWithCards.has(suit));
  
  return (
    <div className="mt-3">
      {title && (
        <p className="text-sm text-slate-300 mb-2">{title}:</p>
      )}
      
      <div className="bg-slate-800 p-3 rounded-lg">
        {/* Header row with suits */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `auto ${filteredSuits.map(() => '2rem').join(' ')}` }}>
          <div className="w-8 h-6"></div> {/* Empty corner */}
          {filteredSuits.map(suit => (
            <div key={suit} className={`w-8 h-6 flex items-center justify-center text-sm font-bold ${suitColors[suit]}`}>
              {suitSymbols[suit]}
            </div>
          ))}
        </div>
        
        {/* Rank rows */}
        {filteredRanks.map(rank => (
          <div key={rank} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `auto ${filteredSuits.map(() => '2rem').join(' ')}` }}>
            {/* Rank label */}
            <div className="w-8 h-6 flex items-center justify-center text-xs font-bold text-slate-400">
              {rank}
            </div>
            
            {/* Cards for this rank */}
            {filteredSuits.map(suit => {
              const isRequired = isCardRequired(rank, suit);
              return (
                <div
                  key={`${rank}${suit}`}
                  className={`w-8 h-6 flex items-center justify-center text-xs font-mono rounded border transition-all duration-200 ${
                    isRequired
                      ? `bg-yellow-400 text-black border-yellow-500 font-bold shadow-md transform scale-110`
                      : `bg-slate-700 text-slate-500 border-slate-600 hover:bg-slate-600`
                  }`}
                >
                  <span className={`${isRequired ? 'text-black' : suitColors[suit]} ${isRequired ? 'font-bold' : 'opacity-50'}`}>
                    {rank}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-3 space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-400 rounded border border-yellow-500"></div>
            <span className="text-slate-300">Cards needed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-slate-700 rounded border border-slate-600"></div>
            <span className="text-slate-400">Other cards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGrid; 