import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
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
              <div className="flex items-center justify-center space-x-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                ) : (
                  <XCircle className="w-12 h-12 text-white animate-pulse" />
                )}
                <div className="text-center">
                  <AlertDialogTitle className="text-white font-black text-2xl tracking-wider mb-1">
                    {isCorrect ? 'CORRECT!' : 'INCORRECT!'}
                  </AlertDialogTitle>
                  <div className="text-white text-sm font-medium opacity-90">
                    {isCorrect ? 'Excellent decision-making!' : 'Learning opportunity ahead!'}
                  </div>
                </div>
                {isCorrect ? (
                  <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
                ) : (
                  <Target className="w-10 h-10 text-orange-400 animate-pulse" />
                )}
              </div>
            </div>
          </AlertDialogHeader>

          {/* Content Section */}
          <div className="relative px-8 py-8">
            <div className={`bg-gradient-to-r ${
              isCorrect 
                ? 'from-slate-800 via-slate-700 to-slate-800' 
                : 'from-slate-800 via-slate-700 to-slate-800'
            } p-6 rounded-xl border ${
              isCorrect ? 'border-emerald-600' : 'border-red-600'
            } shadow-lg`}>
              <div className="text-slate-200 text-lg leading-relaxed font-medium">
                {explanation}
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="mt-6">
              {isCorrect ? (
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-3 rounded-lg border border-emerald-500">
                  <div className="text-emerald-100 font-bold text-sm">
                    🎯 Great decision! You're thinking like a pro player.
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-3 rounded-lg border border-amber-500">
                  <div className="text-amber-100 font-bold text-sm">
                    💡 Every mistake is a step toward mastery. Keep practicing!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Section */}
          <AlertDialogFooter className="relative p-0">
            <div className="w-full px-8 py-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-slate-600">
              <AlertDialogAction 
                onClick={onContinue}
                className={`w-full py-4 px-8 rounded-xl font-black text-lg tracking-wider transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${
                  isCorrect 
                    ? 'from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500' 
                    : 'from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500'
                } text-white border-2 ${
                  isCorrect ? 'border-emerald-400' : 'border-blue-400'
                } shadow-lg`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                  <span>CONTINUE</span>
                </div>
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-white opacity-30 rounded-tl-md"></div>
          <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-white opacity-30 rounded-tr-md"></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-white opacity-30 rounded-bl-md"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-white opacity-30 rounded-br-md"></div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeedbackDialog; 