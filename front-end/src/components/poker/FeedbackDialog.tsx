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
import { CheckCircle2, XCircle } from 'lucide-react';

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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-base">
            {explanation}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onContinue}>
            Next Hand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeedbackDialog; 