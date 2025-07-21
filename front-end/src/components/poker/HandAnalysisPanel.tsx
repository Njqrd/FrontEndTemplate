import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HandAnalysisDisplay from './HandAnalysisDisplay';
import HandRankingsGuide from './HandRankingsGuide';
import { evaluateHand } from '@/utils/hand-evaluator';
import { useEquity } from '@/hooks/useEquity';
import { Card } from '@/types';
import { BarChart3, BookOpen, Percent, Calculator } from 'lucide-react';
import { analyzeDecisionEV, ScenarioContext } from '@/utils/advanced-scoring';

const cardToString = (card: Card): string => {
  const rank = card.rank === '10' ? 'T' : card.rank;
  const suit = card.suit;
  return `${rank}${suit}`;
};

interface HandAnalysisPanelProps {
  villainCount: number;
  heroHand?: Card[];
  communityCards?: Card[];
}

const HandAnalysisPanel: React.FC<HandAnalysisPanelProps> = ({ villainCount, heroHand: heroHandProp, communityCards: communityCardsProp }) => {
  const { currentScenario } = useGame();

  const isSandboxMode = !!heroHandProp;

  const heroCards = heroHandProp ?? currentScenario?.holeCards ?? [];
  const communityCards = communityCardsProp ?? currentScenario?.communityCards ?? [];

  const heroCardStrings = heroCards.map(cardToString);
  const boardCardStrings = communityCards.map(cardToString);

  const equityData = useEquity(heroCardStrings, boardCardStrings, villainCount, 10000);

  // --- EV Calculation ---
  const performEVAnalysis = () => {
    if (isSandboxMode || !currentScenario || !equityData) return null;

    const potSize = currentScenario.potSize;
    const betSize = Math.max(15, potSize * 0.5); 
    
    const context: ScenarioContext = {
      holeCards: currentScenario.holeCards,
      communityCards: currentScenario.communityCards,
      potSize: potSize,
      betSize: betSize,
      stackSize: 100,
      street: currentScenario.street,
    };
    
    const evAnalysis = analyzeDecisionEV(context, 'call');
    
    const potOdds = betSize > 0 ? (betSize / (potSize + betSize)) * 100 : 0;
    const equity = (equityData.wins / equityData.sims) + ((equityData.chops / equityData.sims) / 2);

    return {
      ...evAnalysis,
      potOdds,
      equity: equity * 100,
      betSize,
    };
  };

  const evCalculationData = performEVAnalysis();
  // --- End EV Calculation ---

  // Only analyze if at least 3 community cards (flop) are present
  const canAnalyze = communityCards.length >= 3;

  if (isSandboxMode && (!heroCards || heroCards.length < 2)) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-600 overflow-hidden flex flex-col items-center justify-center p-6 text-center">

        <BarChart3 className="h-16 w-16 text-slate-500 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Build a Scenario</h3>
        <p className="text-slate-400 max-w-sm">
          Use the controls on the right to select your hole cards, community cards, and number of opponents to see a real-time analysis of your hand's strength and equity.
        </p>
      </div>
    );
  }

  // New: Not enough community cards for analysis
  if (isSandboxMode && !canAnalyze) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-600 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <BarChart3 className="h-16 w-16 text-slate-500 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Select Community Cards</h3>
        <p className="text-slate-400 max-w-sm">
          Please select at least 3 community cards (the flop) to begin analysis.
        </p>
      </div>
    );
  }

  if (!isSandboxMode && !currentScenario) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-2xl border-2 border-slate-700 p-6 flex items-center justify-center">
        <p className="text-slate-400">Loading scenario...</p>
      </div>
    );
  }

  const playerHand = canAnalyze ? evaluateHand(heroCards, communityCards) : null;

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
          <TabsList className={`grid w-full ${isSandboxMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="analysis" className="flex items-center space-x-2 text-white !text-white">
              <BarChart3 className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            {!isSandboxMode && (
              <TabsTrigger value="ev_explained" className="flex items-center space-x-2 text-white">
                <Calculator className="h-4 w-4" />
                <span>EV Explained</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="ranking" className="flex items-center space-x-2 text-white">
              <BookOpen className="h-4 w-4" />
              <span>Rankings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pt-2 pb-3">
          <TabsContent value="analysis">
            {/* --- Equity Display --- */}
            {equityData && (
              <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-md text-amber-400 flex items-center mb-3">
                  <Percent className="h-5 w-5 mr-2" />
                  Equity vs. {villainCount} Random Hand{villainCount > 1 ? 's' : ''}
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {`${((equityData.wins / equityData.sims) * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-slate-400">Win</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-300">
                      {`${((equityData.chops / equityData.sims) * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-slate-400">Tie</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {`${(((equityData.sims - equityData.wins - equityData.chops) / equityData.sims) * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-slate-400">Loss</div>
                  </div>
                </div>
              </div>
            )}
            {/* --- End Equity Display --- */}
            <HandAnalysisDisplay
              holeCards={heroCards}
              communityCards={communityCards}
            />
          </TabsContent>

          {!isSandboxMode && (
            <TabsContent value="ev_explained">
              {evCalculationData ? (
                <div className="space-y-4 text-slate-300">
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
                     <h3 className="font-bold text-md text-amber-400 flex items-center mb-3">
                      <Calculator className="h-5 w-5 mr-2" />
                      Expected Value (EV) Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">EV tells you the long-term profitability of an action. It's different from equity, which is just your chance of winning.</p>
                    
                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                      <div className="font-semibold">Your Equity:</div>
                      <div className="text-right font-mono">{evCalculationData.equity.toFixed(1)}%</div>
                      
                      <div className="font-semibold">Pot Size:</div>
                      <div className="text-right font-mono">{currentScenario.potSize} BB</div>

                      <div className="font-semibold">Bet to Call:</div>
                      <div className="text-right font-mono">{evCalculationData.betSize.toFixed(1)} BB</div>
                      
                      <div className="font-semibold">Pot Odds:</div>
                      <div className="text-right font-mono">{evCalculationData.potOdds.toFixed(1)}%</div>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">You need at least {evCalculationData.potOdds.toFixed(1)}% equity for a call to be profitable. Your hand has {evCalculationData.equity.toFixed(1)}% equity.</p>
                    
                     {/* Results */}
                     <div className="space-y-2">
                      <div className={`p-2 rounded-md border ${evCalculationData.optimalDecision === 'fold' ? 'bg-amber-900/50 border-amber-500' : 'border-transparent'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Fold EV</span>
                          <span className="font-mono text-lg font-bold">{evCalculationData.foldEV.toFixed(2)} BB</span>
                        </div>
                      </div>
                       <div className={`p-2 rounded-md border ${evCalculationData.optimalDecision === 'call' ? 'bg-amber-900/50 border-amber-500' : 'border-transparent'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Call EV</span>
                          <span className="font-mono text-lg font-bold">{evCalculationData.callEV.toFixed(2)} BB</span>
                        </div>
                      </div>
                       <div className={`p-2 rounded-md border ${evCalculationData.optimalDecision === 'raise' ? 'bg-amber-900/50 border-amber-500' : 'border-transparent'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Raise EV</span>
                          <span className="font-mono text-lg font-bold">{evCalculationData.raiseEV.toFixed(2)} BB</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-xs text-amber-200 bg-slate-800 p-2 rounded-md">
                      Optimal decision is to <strong className="uppercase">{evCalculationData.optimalDecision}</strong> because it has the highest Expected Value.
                    </div>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-xs">
                    <h4 className="font-bold text-slate-300 mb-2">How is Call EV Calculated?</h4>
                    <p className="font-mono bg-slate-800 p-2 rounded-md mb-2 text-center">
                      (Equity × Total Pot) - Amount to Call
                    </p>
                    <p className="text-slate-400">
                      This formula calculates your average gain/loss. We multiply your win chance (Equity) by what you could win (Total Pot) and then subtract what you must risk (Amount to Call). A positive result means the call is profitable over time.
                    </p>
                  </div>
                </div>
              ) : (
                <p>Calculating EV...</p>
              )}
            </TabsContent>
          )}

          <TabsContent value="ranking">
            <HandRankingsGuide playerHandRank={playerHand?.rank} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HandAnalysisPanel;
 