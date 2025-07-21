import React from 'react';
import { Card as CardType } from '@/types';

interface MiniCardProps {
  card: string; // e.g., 'As', 'Td', 'Kc'
}

const suitSymbols: { [key: string]: string } = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: { [key: string]: string } = {
  s: 'text-gray-800',
  h: 'text-red-600',
  d: 'text-blue-600',
  c: 'text-green-600',
};

const MiniCard: React.FC<MiniCardProps> = ({ card }) => {
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);

  return (
    <div className={`w-8 h-10 bg-white rounded-sm flex flex-col items-center justify-center p-1 shadow-md border border-gray-300`}>
      <span className={`font-bold text-sm ${suitColors[suit]}`}>{rank}</span>
      <span className={`text-xs ${suitColors[suit]}`}>{suitSymbols[suit]}</span>
    </div>
  );
};

export default MiniCard;
