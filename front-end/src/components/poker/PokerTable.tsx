import React, { useState, useEffect } from 'react';
import Card from './Card';
import PlayerSeat from './PlayerSeat';
import TableControls from './TableControls';
import { useGame, gameActions } from '@/contexts/GameContext';
import { usePlayerManager, UsePlayerManagerReturn } from '@/hooks/usePlayerManager';
import { Card as CardType, Decision } from '@/types';
import { evaluateHand } from '@/utils/hand-evaluator';
import FeedbackDialog from './FeedbackDialog';
import EnhancedFeedbackDialog from './EnhancedFeedbackDialog';
import EVAnalysisDisplay from './EVAnalysisDisplay';
import { Eye, EyeOff, BarChart3, Brain, TrendingUp } from 'lucide-react';
import { analyzeDecisionEV, ScenarioContext, DecisionEVAnalysis } from '@/utils/advanced-scoring';
import { Badge } from '@/components/ui/badge';

interface PokerTableProps {
  playerManager: UsePlayerManagerReturn;
}

const PokerTable: React.FC<PokerTableProps> = ({ playerManager }) => {
  const { currentScenario, dispatch, gameSettings, handInProgress, playerHistory, sessionStats, recentPerformance } = useGame();
  const { holeCards, communityCards, potSize, position } = currentScenario;
  const [feedback, setFeedback] = useState<{ 
    isOpen: boolean; 
    isCorrect: boolean; 
    evAnalysis?: any; 
    opponentType?: any; 
  } | null>(null);
  
  const [evAnalysisForDisplay, setEvAnalysisForDisplay] = useState<DecisionEVAnalysis | null>(null);

  const [showControls, setShowControls] = useState(() => {
    return gameSettings?.showMultiPlayerControls ?? true;
  });

  const {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    moveButton,
    resetTable,
    canAddPlayer,
    canRemovePlayer,
    heroPlayer,
  } = playerManager;

  // Update hero player with current scenario hole cards
  useEffect(() => {
    if (heroPlayer) {
      updatePlayer(heroPlayer.id, {
        holeCards: holeCards,
      });
    }
  }, [holeCards, heroPlayer?.id, updatePlayer]);

  // Sync controls visibility with game settings
  useEffect(() => {
    if (gameSettings?.showMultiPlayerControls !== undefined) {
      setShowControls(gameSettings.showMultiPlayerControls);
    }
  }, [gameSettings?.showMultiPlayerControls]);

  const playerHand = evaluateHand(holeCards, communityCards);

  // Create a display array for all 5 community card slots
  const displayCommunityCards: (CardType | null)[] = [...communityCards];
  while (displayCommunityCards.length < 5) {
    displayCommunityCards.push(null);
  }

  // Separate hero from opponents
  const opponents = players.filter(p => !p.isHero);
  const hero = players.find(p => p.isHero);

  const handleDecision = (decision: Decision) => {
    if (handInProgress) return;
    
    dispatch(gameActions.setHandInProgress(true));
    
    // Use advanced EV analysis if enabled
    if (gameSettings?.useAdvancedScoring) {
      const context: ScenarioContext = {
        holeCards: holeCards,
        communityCards: communityCards,
        potSize: potSize,
        betSize: Math.max(15, potSize * 0.5), // Simplified bet size
        stackSize: 100, // Simplified stack size
        street: currentScenario.street
      };
      
      const evAnalysis = analyzeDecisionEV(context, decision);
      dispatch(gameActions.submitAdvancedDecision(decision, evAnalysis));
      
      setEvAnalysisForDisplay(evAnalysis);

      setFeedback({ 
        isOpen: true, 
        isCorrect: evAnalysis.decisionQuality === 'Excellent' || evAnalysis.decisionQuality === 'Good',
        evAnalysis: evAnalysis
      });
    } else {
      // Legacy simple scoring
      const isCorrect = decision === currentScenario.correctDecision;
      dispatch(gameActions.submitDecision(isCorrect));
      
      setFeedback({ isOpen: true, isCorrect });
    }
  };

  const handleContinue = () => {
    setFeedback(null);
    setEvAnalysisForDisplay(null);
    
    if (gameSettings?.autoAdvanceScenarios) {
      // Only randomize positions if the toggle is enabled
      if (gameSettings?.randomizePositions) {
        moveButton(); // Move button/randomize positions for auto-advance
      }
      dispatch(gameActions.loadNewScenario());
    } else {
      dispatch(gameActions.setHandInProgress(false));
    }
  };

  const handleRemoveLastPlayer = () => {
    const lastNonHeroPlayer = players.filter(p => !p.isHero).pop();
    if (lastNonHeroPlayer) {
      removePlayer(lastNonHeroPlayer.id);
    }
  };

  const handleStartHand = () => {
    moveButton(); // Move button/randomize positions first
    dispatch(gameActions.setHandInProgress(true));
    dispatch(gameActions.loadNewScenario());
  };

  const toggleControlsVisibility = () => {
    const newVisibility = !showControls;
    setShowControls(newVisibility);
    dispatch(gameActions.updateGameSettings({ showMultiPlayerControls: newVisibility }));
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        {/* Background */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 h-full relative">
          
          {/* Table Controls Toggle */}
          <button
            onClick={toggleControlsVisibility}
            className="absolute top-4 right-4 z-30 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center space-x-2"
          >
            {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showControls ? 'Hide Controls' : 'Show Controls'}</span>
          </button>

          {/* Advanced Features Indicators */}
          {gameSettings?.useAdvancedScoring && (
            <div className="absolute top-4 right-48 z-30 flex items-center space-x-3">
              {/* Performance Indicator */}
              <div className="bg-slate-800 px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-white">Score: {sessionStats?.averageScore.toFixed(1) || '0.0'}</span>
              </div>
              
              {/* Trend Indicator */}
              <div className="bg-slate-800 px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                <TrendingUp className={`w-4 h-4 ${
                  recentPerformance?.trend === 'improving' ? 'text-green-400' :
                  recentPerformance?.trend === 'declining' ? 'text-red-400' :
                  'text-gray-400'
                }`} />
                <span className="text-white capitalize">{recentPerformance?.trend || 'stable'}</span>
              </div>
              
              {/* EV Analysis Badge */}
              <div className="bg-slate-800 px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-white">EV Analysis</span>
              </div>
            </div>
          )}

          {/* Table Controls */}
          {showControls && (
            <div className="absolute top-4 left-4 z-20 w-64">
              <TableControls
                playerCount={players.length}
                canAddPlayer={canAddPlayer}
                canRemovePlayer={canRemovePlayer}
                onAddPlayer={addPlayer}
                onRemovePlayer={handleRemoveLastPlayer}
                onResetTable={resetTable}
                onMoveButton={moveButton}
                onStartHand={handleStartHand}
              />
            </div>
          )}

          {/* Main Layout Container */}
          <div className="h-full flex flex-col justify-between py-8 px-4">
            
            {/* Top Section - All Opponents */}
            <div className="flex-shrink-0">
              <div className="flex justify-center items-start space-x-4 flex-wrap max-w-6xl mx-auto min-h-[140px]">
                {opponents.map((player) => {
                  return (
                    <div key={player.id} className="relative mb-4">
                      <PlayerSeat
                        player={player}
                        seatPosition={{ angle: 0, radius: 0, x: 0, y: 0 }}
                        onRemovePlayer={removePlayer}
                        canRemove={canRemovePlayer && !handInProgress}
                        isActive={player.isActive}
                        scale={0.9}
                        isLinearLayout={true}
                      />
                    </div>
                  );
                })}
                {opponents.length === 0 && (
                  <div className="text-amber-200 text-lg font-medium opacity-60 flex items-center justify-center h-full">
                    No opponents - Add players to practice
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - Community Cards and Game Info */}
            <div className="flex-grow flex flex-col justify-center items-center space-y-6">
              
              {/* Hand Status */}
              {handInProgress && (
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 rounded-full text-black font-bold text-sm shadow-lg animate-pulse">
                  HAND IN PROGRESS
                </div>
              )}

              {/* Community Cards */}
              <div className="text-center">
                <h3 className="text-amber-200 text-xl font-bold tracking-wider drop-shadow-lg mb-4">
                  COMMUNITY CARDS
                </h3>
                
                <div className="flex space-x-3 justify-center mb-6">
                  {displayCommunityCards.map((card, index) =>
                    card ? (
                      <div 
                        key={index} 
                        className="transform transition-all duration-300 hover:scale-105"
                      >
                        <Card suit={card.suit} rank={card.rank} faceUp size="large" />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="w-24 h-36 rounded-md bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border border-emerald-600 shadow-md flex items-center justify-center"
                      >
                        <div className="w-12 h-18 rounded-sm border border-dashed border-emerald-500 opacity-50"></div>
                      </div>
                    )
                  )}
                </div>

                {/* Pot Display */}
                <div className="mb-4">
                  <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 px-4 py-2 rounded-lg shadow-lg border border-amber-400 text-center">
                    <div className="text-black font-bold text-xs tracking-wide mb-1">POT</div>
                    <div className="text-black text-lg font-black tracking-wider">{potSize} BB</div>
                    <div className="flex justify-center mt-1 space-x-1">
                      {Array.from({ length: Math.min(4, Math.floor(potSize / 5)) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-600 rounded-full border border-red-800 shadow-sm"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {evAnalysisForDisplay && (
                  <div className="max-w-md mx-auto">
                    <EVAnalysisDisplay
                      evAnalysis={[
                        { decision: 'Fold', ev: evAnalysisForDisplay.foldEV, bestAction: evAnalysisForDisplay.optimalDecision },
                        { decision: 'Call', ev: evAnalysisForDisplay.callEV, bestAction: evAnalysisForDisplay.optimalDecision },
                        { decision: 'Raise', ev: evAnalysisForDisplay.raiseEV, bestAction: evAnalysisForDisplay.optimalDecision },
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Hero Player and Decision Panel */}
            <div className="flex-shrink-0">
              <div className="flex items-end justify-center w-full px-4 space-x-4">
                
                {/* Betting Action Sequence - Left (Removed) */}
                <div className="flex-1 max-w-sm">
                </div>
                
                {/* Hero Player - Centered */}
                {hero && (
                  <div className="flex-shrink-0">
                    <PlayerSeat
                      player={hero}
                      seatPosition={{ angle: 0, radius: 0, x: 0, y: 0 }}
                      onRemovePlayer={removePlayer}
                      canRemove={false}
                      isActive={hero.isActive}
                      scale={1.0}
                      isLinearLayout={true}
                      isFolded={false}
                      lastAction={undefined}
                    />
                  </div>
                )}

                {/* Combined Decision Info and Action Buttons - Right of Hero */}
                <div className="flex-1 max-w-sm">
                  {heroPlayer && (
                    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 rounded-lg shadow-lg border border-slate-600 h-full flex flex-col justify-center">
                      <div className="flex flex-col space-y-4">
                        
                        {/* Decision Info - Top */}
                        <div className="text-center">
                          <h3 className="text-amber-200 text-sm font-bold tracking-wider mb-2">YOUR DECISION</h3>
                          {communityCards.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-3 py-1 rounded-md border border-emerald-500 mb-2">
                              <p className="text-amber-100 font-bold text-sm tracking-wide">{playerHand.rankName}</p>
                            </div>
                          )}
                          <div className="text-amber-200 text-sm">Position: {position}</div>
                        </div>

                        {/* Decision Buttons - Bottom */}
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => handleDecision('fold')}
                            disabled={feedback?.isOpen || handInProgress}
                            className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:via-red-400 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg shadow-lg border border-red-400 transition-all duration-300 transform hover:scale-105"
                          >
                            <span className="relative z-10 text-white font-bold text-sm">❌ FOLD</span>
                          </button>
                          
                          <button
                            onClick={() => handleDecision('call')}
                            disabled={feedback?.isOpen || handInProgress}
                            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:via-blue-400 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg shadow-lg border border-blue-400 transition-all duration-300 transform hover:scale-105"
                          >
                            <span className="relative z-10 text-white font-bold text-sm">📞 CALL</span>
                          </button>
                          
                          <button
                            onClick={() => handleDecision('raise')}
                            disabled={feedback?.isOpen || handInProgress}
                            className="group relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-green-700 hover:from-green-500 hover:via-green-400 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg shadow-lg border border-green-400 transition-all duration-300 transform hover:scale-105"
                          >
                            <span className="relative z-10 text-white font-bold text-sm">🚀 RAISE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      {feedback?.evAnalysis ? (
        <EnhancedFeedbackDialog
          isOpen={feedback?.isOpen ?? false}
          evAnalysis={feedback.evAnalysis}
          scenario={currentScenario}
          onContinue={handleContinue}
          playerHistory={
            playerHistory?.getDecisionHistory(20).map(h => ({
              handId: h.handId,
              decision: h.action, 
              score: h.ev, // Using ev as a proxy for score
              ev: h.ev,
            })) || []
          }
        />
      ) : (
        <FeedbackDialog
          isOpen={feedback?.isOpen ?? false}
          isCorrect={feedback?.isCorrect ?? false}
          onContinue={handleContinue}
          explanation={
            feedback?.isCorrect
              ? `Correct! The right move was to ${currentScenario.correctDecision}.`
              : `The correct decision was to ${currentScenario.correctDecision}. Keep practicing!`
          }
        />
      )}
    </>
  );
};

export default PokerTable; 