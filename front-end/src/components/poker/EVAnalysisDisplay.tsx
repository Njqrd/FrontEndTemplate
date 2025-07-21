import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EVAnalysisDisplayProps {
  evAnalysis: {
    decision: string;
    ev: number;
    equity?: number;
    bestAction: string;
  }[];
  className?: string;
}

const EVAnalysisDisplay: React.FC<EVAnalysisDisplayProps> = ({ evAnalysis, className }) => {
  if (!evAnalysis || evAnalysis.length === 0) {
    return null;
  }

  const getIcon = (ev: number) => {
    if (ev > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (ev < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getColor = (ev: number) => {
    if (ev > 0) return '#4ade80'; // green-400
    if (ev < 0) return '#f87171'; // red-400
    return '#9ca3af'; // gray-400
  };

  return (
    <div className={`bg-slate-800 p-4 rounded-lg border border-slate-600 ${className}`}>
      <h3 className="text-amber-200 font-bold text-sm tracking-wider mb-3">Expected Value (EV) Analysis</h3>
      <div className="space-y-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evAnalysis} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="decision" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value: number) => [value.toFixed(2), 'EV']}
              />
              <Bar dataKey="ev" name="EV">
                {evAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.ev)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {evAnalysis.map((item) => (
            <div key={item.decision} className={`p-2 rounded-md ${item.decision === item.bestAction ? 'bg-green-800/50 border-green-500' : 'bg-slate-700/50 border-slate-600'} border`}>
              <div className="text-xs font-bold uppercase text-slate-300">{item.decision}</div>
              <div className="flex items-center justify-center space-x-1 text-sm font-semibold">
                {getIcon(item.ev)}
                <span className={item.ev > 0 ? 'text-green-400' : item.ev < 0 ? 'text-red-400' : 'text-gray-400'}>
                  {item.ev.toFixed(2)} BB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EVAnalysisDisplay; 