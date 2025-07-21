import { cn } from "@/utils/cn";
import { Suit, Rank } from "@/types";

interface CardProps {
  suit: Suit;
  rank: Rank;
  faceUp?: boolean;
  className?: string;
  size?: 'large' | 'small';
}

const suitSymbols: { [key in Suit]: string } = {
  H: "♥",
  D: "♦",
  C: "♣",
  S: "♠",
};

const Card = ({ suit, rank, faceUp = false, className, size = 'large' }: CardProps) => {
  const suitColor = (suit === "H" || suit === "D") ? "text-red-600" : "text-gray-800";
  
  // Size configurations
  const sizeConfig = {
    large: {
      dimensions: "w-[6rem] h-[9rem]", // w-24 h-36
      padding: "p-2",
      paddingFaceDown: "p-1.5",
      rankSize: "text-base",
      suitSize: "text-sm",
      centerSuitSize: "text-3xl"
    },
    small: {
      dimensions: "w-[3rem] h-[4.5rem]", // w-12 h-18
      padding: "p-1",
      paddingFaceDown: "p-0.5",
      rankSize: "text-xs",
      suitSize: "text-xs",
      centerSuitSize: "text-lg"
    }
  };
  
  const config = sizeConfig[size];

  if (!faceUp) {
    return (
      <div
        className={cn(
          `${config.dimensions} rounded-md border border-gray-300 bg-gradient-to-br from-blue-600 to-blue-800 ${config.paddingFaceDown} shadow-md`,
          "flex items-center justify-center",
          "transition-transform duration-200 ease-in-out hover:-translate-y-1",
          className
        )}
      >
        <div className="w-full h-full rounded-sm border border-blue-400 bg-blue-700" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        `${config.dimensions} bg-white rounded-md shadow-md ${config.padding} border border-gray-200`,
        "flex flex-col justify-between font-sans",
        "transition-transform duration-200 ease-in-out hover:-translate-y-1",
        suitColor,
        className
      )}
    >
      <div className="flex flex-col items-start">
        <div className={`${config.rankSize} font-bold leading-none`}>{rank}</div>
        <div className={`${config.suitSize} leading-none`}>{suitSymbols[suit]}</div>
      </div>
      <div className={`flex justify-center items-center ${config.centerSuitSize} font-bold`}>
        {suitSymbols[suit]}
      </div>
      <div className="flex flex-col items-end transform rotate-180">
        <div className={`${config.rankSize} font-bold leading-none`}>{rank}</div>
        <div className={`${config.suitSize} leading-none`}>{suitSymbols[suit]}</div>
      </div>
    </div>
  );
};

export default Card;