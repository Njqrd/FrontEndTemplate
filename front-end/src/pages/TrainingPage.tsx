import PokerTable from '@/components/poker/PokerTable';
import HandAnalysisPanel from '@/components/poker/HandAnalysisPanel';

const TrainingPage = () => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Main Content */}
      <div className="relative z-10 h-screen flex gap-4 p-4 overflow-hidden">
        {/* Left Side - Poker Table (fixed height) */}
        <div className="flex-1 h-full">
          <PokerTable />
        </div>

        {/* Right Side - Hand Analysis Panel (scrollable) */}
        <div className="w-96 h-full flex-shrink-0">
          <HandAnalysisPanel />
        </div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full opacity-[0.03] blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full opacity-[0.03] blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default TrainingPage;
