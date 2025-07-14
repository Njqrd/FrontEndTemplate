import PokerTable from '@/components/poker/PokerTable';
import DecisionPanel from '@/components/poker/DecisionPanel';

const TrainingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <PokerTable />
        <DecisionPanel />
      </div>
    </div>
  );
};

export default TrainingPage;
