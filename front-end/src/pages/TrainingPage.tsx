import PokerTable from '@/components/poker/PokerTable';
import DecisionPanel from '@/components/poker/DecisionPanel';

const TrainingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 tracking-wider drop-shadow-lg mb-4">
            POKER TRAINING
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-slate-400 text-lg font-medium mt-4 tracking-wide">
            Master your decision-making with dynamic scenarios
          </p>
        </div>

        {/* Game Components */}
        <div className="w-full max-w-7xl space-y-6">
          <PokerTable />
          <DecisionPanel />
        </div>

        {/* Bottom Accent */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <span>Every decision shapes your poker mastery</span>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full opacity-[0.03] blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full opacity-[0.03] blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default TrainingPage;
