import { HAND_RANKINGS } from '@/data/hand-rankings';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, ArrowUp, XCircle } from 'lucide-react';

interface HandRankingsGuideProps {
  playerHandRank: number;
}

const HandRankingsGuide = ({ playerHandRank }: HandRankingsGuideProps) => {
  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-center mb-4 text-white">Hand Rankings Cheatsheet</h3>
      <Table>
        <TableCaption>A list of poker hand rankings, from strongest to weakest.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-white">Status</TableHead>
            <TableHead className="text-white">Hand</TableHead>
            <TableHead className="text-white">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {HAND_RANKINGS.map((hand) => {
            const isPlayerHand = hand.rankValue === playerHandRank;
            const isStronger = hand.rankValue > playerHandRank;

            return (
              <TableRow key={hand.rankName} className={isPlayerHand ? 'bg-emerald-800' : ''}>
                <TableCell className="font-medium">
                  {isPlayerHand ? (
                    <span className="flex items-center text-green-400">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Your Hand
                    </span>
                  ) : isStronger ? (
                    <span className="flex items-center text-amber-400">
                      <ArrowUp className="mr-2 h-5 w-5" />
                      Beats You
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-500">
                      <XCircle className="mr-2 h-5 w-5" />
                      Weaker
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-white">{hand.rankName}</TableCell>
                <TableCell className="text-white">{hand.description}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default HandRankingsGuide; 