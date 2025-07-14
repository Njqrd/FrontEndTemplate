import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Trophy, Target } from 'lucide-react';

interface FeedbackDialogProps {
  isOpen: boolean;
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, isCorrect, explanation, onContinue }) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onContinue}>
      <AlertDialogContent className="max-w-2xl border-0 p-0 overflow-hidden bg-transparent">
        <div className={`relative bg-gradient-to-br ${
          isCorrect 
            ? 'from-emerald-900 via-emerald-800 to-emerald-900' 
            : 'from-red-900 via-red-800 to-red-900'
        } rounded-2xl shadow-2xl border-2 ${
          isCorrect ? 'border-emerald-400' : 'border-red-400'
        }`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isCorrect 
                ? 'from-emerald-400 via-transparent to-emerald-400' 
                : 'from-red-400 via-transparent to-red-400'
            } animate-pulse`}></div>
          </div>

          {/* Header Section */}
          <AlertDialogHeader className="relative p-0">
            <div className={`bg-gradient-to-r ${
              isCorrect 
                ? 'from-emerald-600 via-emerald-500 to-emerald-600' 
                : 'from-red-600 via-red-500 to-red-600'
            } px-8 py-6 border-b-2 ${
              isCorrect ? 'border-emerald-400' : 'border-red-400'
            }`}>
              <AlertDialogTitle className="flex items-center justify-center space-x-4 text-white">
                <div className="relative">
                  {isCorrect ? (
                    <div className="relative">
                      <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                      <div className="absolute inset-0 w-12 h-12 bg-emerald-400 rounded-full animate-ping opacity-25"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <XCircle className="w-12 h-12 text-white animate-pulse" />
                      <div className="absolute inset-0 w-12 h-12 bg-red-400 rounded-full animate-ping opacity-25"></div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-black tracking-wider">
                    {isCorrect ? 'EXCELLENT!' : 'INCORRECT'}
                  </h2>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {isCorrect ? (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-300" />
                        <span className="text-yellow-300 font-bold text-sm tracking-wide">OPTIMAL PLAY</span>
                        <Trophy className="w-5 h-5 text-yellow-300" />
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 text-orange-300" />
                        <span className="text-orange-300 font-bold text-sm tracking-wide">LEARNING OPPORTUNITY</span>
                        <Target className="w-5 h-5 text-orange-300" />
                      </>
                    )}
                  </div>
                </div>
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>

          {/* Content Section */}
          <div className="relative px-8 py-8">
            <AlertDialogDescription className="text-center">
              <div className={`bg-gradient-to-r ${
                isCorrect 
                  ? 'from-slate-800 via-slate-700 to-slate-800' 
                  : 'from-slate-800 via-slate-700 to-slate-800'
              } p-6 rounded-xl border ${
                isCorrect ? 'border-emerald-600' : 'border-red-600'
              } shadow-lg`}>
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  {explanation}
                </p>
              </div>
              
              {/* Motivational Message */}
              <div className="mt-6">
                {isCorrect ? (
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-3 rounded-lg border border-emerald-500">
                    <p className="text-emerald-100 font-bold text-sm">
                      🎯 Great decision! You're thinking like a pro player.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-3 rounded-lg border border-amber-500">
                    <p className="text-amber-100 font-bold text-sm">
                      💡 Every mistake is a step toward mastery. Keep practicing!
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </div>

          {/* Footer Section */}
          <AlertDialogFooter className="relative p-0">
            <div className="w-full px-8 py-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-slate-600">
              <AlertDialogAction 
                onClick={onContinue}
                className={`w-full py-4 px-8 rounded-xl font-black text-lg tracking-wider transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${
                  isCorrect 
                    ? 'from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500 border-2 border-emerald-400' 
                    : 'from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 border-2 border-amber-400'
                } text-white shadow-xl hover:shadow-2xl`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>NEXT HAND</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>

          {/* Decorative Elements */}
          <div className={`absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 ${
            isCorrect ? 'border-emerald-400' : 'border-red-400'
          } rounded-tl-lg opacity-60`}></div>
          <div className={`absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 ${
            isCorrect ? 'border-emerald-400' : 'border-red-400'
          } rounded-tr-lg opacity-60`}></div>
          <div className={`absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 ${
            isCorrect ? 'border-emerald-400' : 'border-red-400'
          } rounded-bl-lg opacity-60`}></div>
          <div className={`absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 ${
            isCorrect ? 'border-emerald-400' : 'border-red-400'
          } rounded-br-lg opacity-60`}></div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeedbackDialog; 