import { Card } from '@/types';
import { analyzeHands, HandAnalysis, AnalysisResult } from '@/utils/hand-analyzer';
import { findOpponentWinningHands } from '@/utils/hand-strength-analyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Target, AlertTriangle, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import CardGrid from './CardGrid';
import MiniCard from './MiniCard';


interface HandAnalysisDisplayProps {
  holeCards: Card[];
  communityCards: Card[];
}

const HandAnalysisDisplay = ({ holeCards, communityCards }: HandAnalysisDisplayProps) => {
  const analysis: AnalysisResult = analyzeHands(holeCards, communityCards);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [opponentWinningHands, setOpponentWinningHands] = useState<string[][]>([]);

  useEffect(() => {
    if (communityCards.length === 5 && holeCards.length === 2) {
      // Convert to lowercase for consistency
      const heroCardStrings = holeCards.map(c => (c.rank + c.suit).toLowerCase());
      const boardCardStrings = communityCards.map(c => (c.rank + c.suit).toLowerCase());
      const hands = findOpponentWinningHands(heroCardStrings, boardCardStrings);
      setOpponentWinningHands(hands);
    } else {
      setOpponentWinningHands([]);
    }
  }, [holeCards, communityCards]);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const renderHandAnalysis = (handAnalysis: HandAnalysis, isPlayerSection: boolean = true, index: number = 0) => {
    const bgColor = isPlayerSection ? 'bg-emerald-700' : 'bg-red-700';
    const textColor = isPlayerSection ? 'text-emerald-100' : 'text-red-100';
    const sectionKey = `${isPlayerSection ? 'player' : 'opponent'}-${index}`;
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div key={handAnalysis.handType} className={`${bgColor} rounded-lg mb-2 overflow-hidden`}>
        <div 
          className="p-2 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              {handAnalysis.isMade ? (
                <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
              ) : (
                <Target className="h-3 w-3 text-yellow-400 flex-shrink-0" />
              )}
              <span className={`font-bold text-xs ${textColor} truncate`}>
                {handAnalysis.handType}
              </span>
              {!handAnalysis.isMade && handAnalysis.requiredCards.length > 0 && (
                <span className={`text-xs ${textColor} opacity-75 flex-shrink-0`}>
                  ({handAnalysis.requiredCards.length})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className={`text-xs ${textColor}`}>
                {handAnalysis.isMade ? 'MADE' : 'DRAW'}
              </span>
              {!isPlayerSection && handAnalysis.probability > 0 && (
                <span className="bg-red-900 text-red-100 px-1 py-0.5 rounded text-xs">
                  {Math.round(handAnalysis.probability * 100)}%
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-white" />
              ) : (
                <ChevronRight className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-2 pb-2">
            {!handAnalysis.isMade && handAnalysis.requiredCards.length > 0 && (
              <CardGrid 
                requiredCards={handAnalysis.requiredCards}
                title="Cards needed"
              />
            )}
            
            {!isPlayerSection && handAnalysis.requiredCards.length === 0 && (
              <div className="mt-2 p-2 bg-black bg-opacity-20 rounded">
                <p className={`text-xs ${textColor}`}>
                  Opponent could have this hand based on board texture and typical holdings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderWinningHandsSection = () => (
    <div className="bg-red-800 p-2 rounded-lg mb-2">
      <div className="flex items-center space-x-2 mb-2">
        <Eye className="h-3 w-3 text-red-300 flex-shrink-0" />
        <p className="text-red-100 text-xs font-bold">
          {opponentWinningHands.length} Opponent Hand{opponentWinningHands.length === 1 ? '' : 's'} Beat Your {analysis.currentPlayerHand.type}
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2">
        {opponentWinningHands.map((hand, index) => (
          <div key={index} className="flex items-center justify-center space-x-1 bg-black bg-opacity-25 p-1 rounded-md">
            <MiniCard card={hand[0]} />
            <MiniCard card={hand[1]} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderNoThreatsMessage = () => {
    if (communityCards.length === 5) {
      if (opponentWinningHands.length === 0) {
        return (
          <div className="bg-emerald-700 p-2 rounded-lg text-center">
            <p className="text-emerald-100 text-xs">
              <strong>You have the nuts!</strong> No possible opponent hand can beat your {analysis.currentPlayerHand.type}.
            </p>
          </div>
        );
      }
    }
    // Default message if no draw threats are found pre-river
    return (
      <div className="bg-slate-700 p-2 rounded-lg text-center">
        <p className="text-slate-300 text-xs">
          No significant draw threats detected for the opponent.
        </p>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-lg font-bold text-center mb-3 text-white">Hand Analysis</h3>
      
      <Tabs defaultValue="player" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="player" className="text-xs text-white !text-white">Your Possibilities</TabsTrigger>
          <TabsTrigger value="opponents" className="text-xs text-white">Opponent Threats</TabsTrigger>
        </TabsList>
        
        <div className="mt-3">
          <TabsContent value="player" className="data-[state=active]:block hidden">
            <div className="space-y-1">
              {analysis.playerAnalysis.length > 0 ? (
                analysis.playerAnalysis.map((handAnalysis, index) => 
                  renderHandAnalysis(handAnalysis, true, index)
                )
              ) : (
                <div className="bg-slate-700 p-2 rounded-lg text-center">
                  <p className="text-slate-300 text-xs">
                    No significant draws detected. Focus on your current hand strength.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="opponents" className="data-[state=active]:block hidden">
            <div className="space-y-1">
              <div className="bg-amber-800 p-2 rounded-lg mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-3 w-3 text-amber-300 flex-shrink-0" />
                  <p className="text-amber-100 text-xs">
                    Hands that could beat your <strong>{analysis.currentPlayerHand.type}</strong>
                  </p>
                </div>
              </div>

              {communityCards.length === 5 && opponentWinningHands.length > 0 && renderWinningHandsSection()}
              
              {analysis.opponentThreats.length > 0 ? (
                analysis.opponentThreats.map((handAnalysis, index) => 
                  renderHandAnalysis(handAnalysis, false, index)
                )
              ) : (
                renderNoThreatsMessage()
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};

export default HandAnalysisDisplay; 