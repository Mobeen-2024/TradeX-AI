import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemStore } from '../../store/systemStore';
import { Beaker, Calculator, Activity, DollarSign, X } from 'lucide-react';

export const SimulationOverlay: React.FC = () => {
  const { isSimulationMode, globalMetrics, overrideState, setOverrideState, strategyOverrides, riskOverrides } = useSystemStore();
  const [isOpen, setIsOpen] = useState(true);

  // Local recomputations
  const baseSize = 50000; // Simulated base trade size in $
  
  const simParams = {
     riskMultiplier: overrideState.riskMode === 'CONSERVATIVE' ? 0.5 : overrideState.riskMode === 'AGGRESSIVE' ? 1.5 : 1.0,
     strategyWeight: overrideState.sizeMultiplier,
     globalAllocation: riskOverrides.emergencyThrottle
  };

  const expectedPositionSize = baseSize * simParams.riskMultiplier * simParams.strategyWeight * simParams.globalAllocation;
  
  // Fake projected impact based on system global metrics (just a UI simulation as requested)
  const expectedPnlImpact = (globalMetrics?.winRate || 0.55) * expectedPositionSize * 0.02; // Assuming ~2% gain on win
  const expectedDrawdownImpact = (expectedPositionSize / (globalMetrics?.totalCapital || 1000000)) * 100;

  if (!isSimulationMode) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           exit={{ y: 50, opacity: 0 }}
           className="fixed bottom-6 left-6 w-96 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#ff6b00]/50 rounded-xl shadow-[0_0_30px_rgba(255,107,0,0.15)] z-90 font-mono overflow-hidden"
        >
           <div className="bg-[#110a05] border-b border-[#ff6b00]/30 px-4 py-3 flex justify-between items-center">
              <h3 className="text-xs text-[#ff6b00] font-bold uppercase tracking-widest flex items-center gap-2">
                 <Beaker className="w-4 h-4" /> What-If Engine
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                 <X className="w-4 h-4" />
              </button>
           </div>
           
           <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                 <div className="bg-black/50 p-2 rounded border border-white/5 flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase">Risk Mult</span>
                    <span className="text-[#ffcc00] font-bold text-sm">{simParams.riskMultiplier.toFixed(2)}x</span>
                 </div>
                 <div className="bg-black/50 p-2 rounded border border-white/5 flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase">Strat Wgt</span>
                    <span className="text-[#00f0ff] font-bold text-sm">{simParams.strategyWeight.toFixed(2)}x</span>
                 </div>
                 <div className="bg-black/50 p-2 rounded border border-white/5 flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase">Allocation</span>
                    <span className="text-[#39ff14] font-bold text-sm">{simParams.globalAllocation.toFixed(2)}</span>
                 </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                       <DollarSign className="w-3.5 h-3.5" /> Est. Position Size
                    </div>
                    <div className="text-sm font-bold text-white">${expectedPositionSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                       <Calculator className="w-3.5 h-3.5" /> Exp. PnL Impact
                    </div>
                    <div className="text-sm font-bold text-[#39ff14]">+${expectedPnlImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                       <Activity className="w-3.5 h-3.5" /> Est. Drawdown Load
                    </div>
                    <div className="text-sm font-bold text-[#ff4500]">{expectedDrawdownImpact.toFixed(2)}%</div>
                 </div>
              </div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
