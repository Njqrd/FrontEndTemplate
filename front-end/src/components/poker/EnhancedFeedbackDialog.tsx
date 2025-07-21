import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Trophy, Target, TrendingUp, TrendingDown, Minus, BarChart3, Brain, Eye } from 'lucide-react';
import { DecisionEVAnalysis } from '@/utils/advanced-scoring';
import { Scenario } from '@/types';
import { PlayerType } from '@/types/player';
import { PLAYER_PROFILES } from '@/utils/player-profiles';

interface EnhancedFeedbackDialogProps {
  isOpen: boolean;
  evAnalysis: DecisionEVAnalysis;
  scenario: Scenario;
  onContinue: () => void;
  opponentType?: PlayerType;
  playerHistory?: Array<{
    handId: string;
    decision: string;
    score: number;
    ev: number;
  }>;
}

const EnhancedFeedbackDialog: React.FC<EnhancedFeedbackDialogProps> = ({
  isOpen,
  evAnalysis,
  scenario,
  onContinue,
  opponentType = 'UNKNOWN',
  playerHistory = []
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  
  if (!isOpen) return null;

  const isCorrect = evAnalysis.decisionQuality === 'Excellent' || evAnalysis.decisionQuality === 'Good';
  const opponentProfile = PLAYER_PROFILES[opponentType];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Acceptable': return 'bg-yellow-500';
      case 'Poor': return 'bg-orange-500';
      case 'Terrible': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'Excellent': return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'Good': return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case 'Acceptable': return <Target className="w-6 h-6 text-yellow-400" />;
      case 'Poor': return <XCircle className="w-6 h-6 text-orange-400" />;
      case 'Terrible': return <XCircle className="w-6 h-6 text-red-400" />;
      default: return <Minus className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTrendIcon = () => {
    if (playerHistory.length < 2) return <Minus className="w-4 h-4" />;
    
    const recentScores = playerHistory.slice(-5).map(h => h.score);
    const earlierScores = playerHistory.slice(-10, -5).map(h => h.score);
    
    if (earlierScores.length === 0) return <Minus className="w-4 h-4" />;
    
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
    
    if (recentAvg > earlierAvg + 5) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (recentAvg < earlierAvg - 5) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onContinue}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 p-0 bg-transparent">
        <div className={`relative bg-gradient-to-br ${
          isCorrect 
            ? 'from-emerald-900 via-emerald-800 to-emerald-900' 
            : 'from-slate-900 via-slate-800 to-slate-900'
        } rounded-2xl shadow-2xl border-2 ${
          isCorrect ? 'border-emerald-400' : 'border-slate-600'
        }`}>
          
          {/* Header Section */}
          <AlertDialogHeader className="relative p-0">
            <div className={`bg-gradient-to-r ${
              isCorrect 
                ? 'from-emerald-600 via-emerald-500 to-emerald-600' 
                : 'from-slate-700 via-slate-600 to-slate-700'
            } px-8 py-6 border-b-2 ${
              isCorrect ? 'border-emerald-400' : 'border-slate-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getQualityIcon(evAnalysis.decisionQuality)}
                  <div>
                    <AlertDialogTitle className="text-white font-black text-2xl tracking-wider">
                      {evAnalysis.decisionQuality.toUpperCase()} DECISION
                    </AlertDialogTitle>
                    <div className="text-white text-sm font-medium opacity-90">
                      Score: {evAnalysis.score}/100 | EV: {evAnalysis.evDifference > 0 ? '-' : '+'}{Math.abs(evAnalysis.evDifference).toFixed(2)} BB
                    </div>
                  </div>
                </div>
                
                {/* Score Badge */}
                <div className="flex items-center space-x-4">
                  <Badge className={`${getQualityColor(evAnalysis.decisionQuality)} text-white px-3 py-1 text-sm font-bold`}>
                    {evAnalysis.score}/100
                  </Badge>
                  <div className="flex items-center space-x-2 text-white text-sm">
                    {getTrendIcon()}
                    <span>Trend</span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogHeader>

          {/* Content Section */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="analysis">EV Analysis</TabsTrigger>
                <TabsTrigger value="opponent">Opponent</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="improvement">Improvement</TabsTrigger>
              </TabsList>
              
              {/* EV Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Expected Value Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-slate-300 text-sm">Fold EV</div>
                        <div className="text-white text-lg font-bold">{evAnalysis.foldEV.toFixed(2)} BB</div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-slate-300 text-sm">Call EV</div>
                        <div className="text-white text-lg font-bold">{evAnalysis.callEV.toFixed(2)} BB</div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-slate-300 text-sm">Raise EV</div>
                        <div className="text-white text-lg font-bold">{evAnalysis.raiseEV.toFixed(2)} BB</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-300 mb-2">
                        <span>Your Equity</span>
                        <span>{(evAnalysis.equity * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={evAnalysis.equity * 100} className="h-2" />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-300 mb-2">
                        <span>Pot Odds Required</span>
                        <span>{(evAnalysis.potOdds * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={evAnalysis.potOdds * 100} className="h-2" />
                    </div>
                    
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <div className="text-slate-300 text-sm mb-2">Decision Analysis</div>
                      <div className="text-white text-sm leading-relaxed">
                        {evAnalysis.explanation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Opponent Tab */}
              <TabsContent value="opponent" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Opponent Profile: {opponentProfile.name}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      {opponentProfile.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-3">Key Statistics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300">VPIP</span>
                            <span className="text-white">{opponentProfile.baseStats.vpip}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">PFR</span>
                            <span className="text-white">{opponentProfile.baseStats.pfr}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Aggression Factor</span>
                            <span className="text-white">{opponentProfile.baseStats.aggressionFactor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">C-Bet Frequency</span>
                            <span className="text-white">{opponentProfile.baseStats.cBetFrequency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Fold to C-Bet</span>
                            <span className="text-white">{opponentProfile.baseStats.foldToCBet}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-3">Exploitation Strategy</h4>
                        <div className="space-y-2">
                          {opponentProfile.exploitationStrategies.map((strategy, index) => (
                            <div key={index} className="bg-slate-700 p-2 rounded text-slate-300 text-sm">
                              • {strategy}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Badge variant="outline" className="text-white border-slate-600">
                            Difficulty: {opponentProfile.difficulty}
                          </Badge>
                          <Badge variant="outline" className={`ml-2 ${
                            opponentProfile.profitability === 'High' ? 'text-green-400 border-green-400' :
                            opponentProfile.profitability === 'Medium' ? 'text-yellow-400 border-yellow-400' :
                            opponentProfile.profitability === 'Low' ? 'text-orange-400 border-orange-400' :
                            'text-red-400 border-red-400'
                          }`}>
                            Profitability: {opponentProfile.profitability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Session Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Hands Played</span>
                          <span className="text-white">{playerHistory.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Average Score</span>
                          <span className="text-white">
                            {playerHistory.length > 0 
                              ? (playerHistory.reduce((sum, h) => sum + h.score, 0) / playerHistory.length).toFixed(1)
                              : '0.0'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Total EV Loss</span>
                          <span className="text-white">
                            {playerHistory.length > 0 
                              ? (playerHistory.reduce((sum, h) => sum + Math.max(0, h.ev), 0)).toFixed(2) + ' BB'
                              : '0.00 BB'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Decision Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['Excellent', 'Good', 'Acceptable', 'Poor', 'Terrible'].map((quality) => {
                          const count = playerHistory.filter(h => {
                            if (h.score >= 95) return quality === 'Excellent';
                            if (h.score >= 85) return quality === 'Good';
                            if (h.score >= 70) return quality === 'Acceptable';
                            if (h.score >= 50) return quality === 'Poor';
                            return quality === 'Terrible';
                          }).length;
                          
                          const percentage = playerHistory.length > 0 ? (count / playerHistory.length) * 100 : 0;
                          
                          return (
                            <div key={quality} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`}></div>
                                <span className="text-slate-300">{quality}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white text-sm">{count}</span>
                                <span className="text-slate-400 text-sm">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Improvement Tab */}
              <TabsContent value="improvement" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Improvement Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Key Learning Points</h4>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <ul className="text-slate-300 space-y-2">
                            <li>• Understanding opponent types is crucial for EV maximization</li>
                            <li>• Equity calculations should drive decision-making, not hand strength alone</li>
                            <li>• Position and stack sizes significantly impact optimal play</li>
                            <li>• Consistent decision quality leads to long-term profitability</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Next Steps</h4>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <div className="text-slate-300 space-y-2">
                            <p>Based on your performance, focus on:</p>
                            <ul className="mt-2 space-y-1">
                              {evAnalysis.score < 70 && (
                                <li>• Review basic pot odds and equity calculations</li>
                              )}
                              {evAnalysis.evDifference > 0.5 && (
                                <li>• Study opponent tendencies and exploitation strategies</li>
                              )}
                              {evAnalysis.decisionQuality === 'Poor' || evAnalysis.decisionQuality === 'Terrible' && (
                                <li>• Practice fundamental decision-making concepts</li>
                              )}
                              <li>• Continue analyzing hands with EV calculations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <AlertDialogFooter className="px-6 pb-6">
            <AlertDialogAction
              onClick={onContinue}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Continue Training
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EnhancedFeedbackDialog; 