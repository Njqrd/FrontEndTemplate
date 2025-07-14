import { cn } from "@/utils/cn";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface CardProps {
  suit: Suit;
  rank: Rank;
  faceUp?: boolean;
  className?: string;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const Card = ({ suit, rank, faceUp = false, className }: CardProps) => {
  const suitColor = (suit === "hearts" || suit === "diamonds") ? "text-red-600" : "text-gray-800";

  if (!faceUp) {
    return (
      <div
        className={cn(
          "w-24 h-36 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-600 to-blue-800 p-1 shadow-lg",
          "flex items-center justify-center",
          "transition-transform duration-200 ease-in-out hover:-translate-y-1",
          className
        )}
      >
        <div className="w-full h-full rounded-md border border-blue-400 bg-blue-700" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-24 h-36 bg-white rounded-lg shadow-lg p-2 border border-gray-200",
        "flex flex-col justify-between font-sans",
        "transition-transform duration-200 ease-in-out hover:-translate-y-1",
        suitColor,
        className
      )}
    >
      <div className="flex flex-col items-start">
        <div className="text-2xl font-bold leading-none">{rank}</div>
        <div className="text-xl leading-none">{suitSymbols[suit]}</div>
      </div>
      <div className="flex justify-center items-center text-5xl font-bold">
        {suitSymbols[suit]}
      </div>
      <div className="flex flex-col items-end transform rotate-180">
        <div className="text-2xl font-bold leading-none">{rank}</div>
        <div className="text-xl leading-none">{suitSymbols[suit]}</div>
      </div>
    </div>
  );
};

export default Card;