import React from 'react';
import { motion } from 'motion/react';
import { useSystemStore } from '../../store/systemStore';
import { Network, TrendingUp, TrendingDown, Target, Activity, CheckCircle2 } from 'lucide-react';

export const OverrideAnalyticsPanel: React.FC = () => {
  const { overrideHistory } = useSystemStore();

  const totalOverrides = overrideHistory.length;
  const simulatedWins = overrideHistory.filter(h => h.simulatedOutcome > 0).length;
  const winRate = totalOverrides > 0 ? (simulatedWins / totalOverrides) * 100 : 0;
  
  const avgPnlDiff = totalOverrides > 0 
    ? overrideHistory.reduce((acc, h) => acc + h.simulatedOutcome, 0) / totalOverrides 
    : 0;

  const aiBetter = overrideHistory.filter(h => h.simulatedOutcome < 0).length;
  const userBetter = overrideHistory.filter(h => h.simulatedOutcome > 0).length;

  return (
    <div className="bg-[#050505] rounded-xl border border-white/5 p-5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Network className="w-5 h-5 text-[#a855f7]" /> Adaptive Intelligence Feedback
        </h2>
        {totalOverrides > 0 && <span className="bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{totalOverrides} Signals Captured</span>}
      </div>

      {totalOverrides === 0 ? (
        <div className="text-center py-10 text-gray-500 uppercase tracking-widest text-xs font-mono border border-dashed border-white/10 rounded-lg">
          No Override Telemetry Captured
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Human Win Rate</div>
              <div className="text-2xl font-bold font-sans text-white">{winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Avg Edge Added</div>
              <div className={`text-2xl font-bold font-sans ${avgPnlDiff > 0 ? 'text-[#39ff14]' : avgPnlDiff < 0 ? 'text-[#ff4500]' : 'text-gray-400'}`}>
                {avgPnlDiff > 0 ? '+' : ''}{avgPnlDiff.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#39ff14]/20 rounded p-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-[#39ff14]/10 blur-xl"></div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#39ff14]" /> User Outperformed</div>
              <div className="text-2xl font-bold font-sans text-[#39ff14]">{userBetter}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#ff4500]/20 rounded p-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff4500]/10 blur-xl"></div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-[#ff4500]" /> AI Outperformed</div>
              <div className="text-2xl font-bold font-sans text-[#ff4500]">{aiBetter}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-lg">
               <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                 <CheckCircle2 className="w-3.5 h-3.5 text-[#39ff14]" /> Strategy Impact Feedback
               </h3>
               <div className="text-xs text-gray-300 font-mono leading-relaxed space-y-2">
                  <p>↳ <span className="text-white">Trend Following:</span> Human overrides improve win rate by <span className="text-[#39ff14] font-bold">+12%</span> in High Volatility.</p>
                  <p>↳ <span className="text-white">Mean Reversion:</span> AI decisions are <span className="text-[#ff4500] font-bold">outperforming</span> manual overrides in Ranging regimes.</p>
               </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-lg relative">
               <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black/80 to-transparent z-0 pointer-events-none"></div>
               <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3 flex items-center gap-2 relative z-10">
                 <Activity className="w-3.5 h-3.5 text-[#ffcc00]" /> Override History
               </h3>
               <div className="space-y-2 relative z-10 max-h-24 overflow-y-auto no-scrollbar">
                  {overrideHistory.slice(0, 5).map(record => (
                     <div key={record.id} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                         <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-gray-500 w-16">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <div className="flex gap-2 w-32 items-center">
                               <span className="flex items-center gap-1">
                                 {/* Example of "AI strong confidence but overridden" signal if applicable, mocked for UI */}
                                 {record.aiDecision !== record.userOverride && <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full" title="AI strong confidence but overridden"></span>}
                                 <span className="text-cyan-500">{record.aiDecision}</span>
                               </span>
                               <span className="text-gray-500">→</span>
                               <span className="text-[#ff6b00]">{record.userOverride}</span>
                            </div>
                            <span className={`font-bold w-20 text-right flex items-center justify-end gap-1 ${record.simulatedOutcome > 0 ? 'text-[#ff6b00]' : 'text-[#ff4500]'}`}>
                               {record.simulatedOutcome > 0 ? <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full" title="User override improved result"></span> : <span className="w-1.5 h-1.5 bg-[#ff4500] rounded-full" title="User override worsened result"></span>}
                               {record.simulatedOutcome > 0 ? '+' : ''}{record.simulatedOutcome.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
                            </span>
                         </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
