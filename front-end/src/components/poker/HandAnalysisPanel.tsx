import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HandAnalysisDisplay from './HandAnalysisDisplay';
import HandRankingsGuide from './HandRankingsGuide';
import { evaluateHand } from '@/utils/hand-evaluator';
import { BarChart3, BookOpen } from 'lucide-react';

const HandAnalysisPanel: React.FC = () => {
  const { currentScenario } = useGame();
  
  if (!currentScenario) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-2xl border-2 border-slate-700 p-6 flex items-center justify-center">
        <p className="text-slate-400">Loading scenario...</p>
      </div>
    );
  }

  const playerHand = evaluateHand(currentScenario.holeCards, currentScenario.communityCards);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-600 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-3 border-b-2 border-amber-400 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <h2 className="text-black font-black text-lg tracking-wider">HAND ANALYSIS</h2>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="w-full flex-1 min-h-0 flex flex-col">
        <div className="px-3 pt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Rankings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pt-2 pb-3">
          <TabsContent value="analysis">
            <HandAnalysisDisplay
              holeCards={currentScenario.holeCards}
              communityCards={currentScenario.communityCards}
            />
          </TabsContent>

          <TabsContent value="ranking">
            <HandRankingsGuide playerHandRank={playerHand.rank} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HandAnalysisPanel; 