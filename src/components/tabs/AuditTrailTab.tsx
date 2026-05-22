import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Target, AlertTriangle, Lock, Clock, History, Save, Download } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';

export function AuditTrailTab() {
  const { overrideHistory, lockOverrides, setLockOverrides, saveSessionSnapshot, loadSessionSnapshot, sessionSnapshot } = useSystemStore();
  const [filterStr, setFilterStr] = useState("");

  const handleToggleLock = () => {
    setLockOverrides(!lockOverrides);
  };

  const filteredHistory = overrideHistory.filter(h => 
      !filterStr || 
      h.strategyId.toLowerCase().includes(filterStr.toLowerCase()) || 
      h.correlationId.toLowerCase().includes(filterStr.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col min-h-full py-8 text-white w-full font-mono"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
               <History className="w-6 h-6 text-gray-300" />
            </div>
            <div>
               <h2 className="text-3xl font-bold font-sans text-white tracking-tight">Audit & Governance</h2>
               <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">Override Persistence & Session Stability</p>
            </div>
        </div>
        
        <div className="flex gap-3">
             <button 
                onClick={handleToggleLock}
                className={`flex items-center gap-2 px-4 py-2 border rounded-sm transition-colors text-xs font-bold uppercase tracking-widest ${lockOverrides ? 'border-[#39ff14]/50 bg-[#39ff14]/10 text-[#39ff14]' : 'border-gray-700 text-gray-400 hover:text-white'}`}
             >
                <Lock className="w-4 h-4" />
                {lockOverrides ? "System Locked" : "Lock Overrides"}
             </button>
             
             <button 
                onClick={saveSessionSnapshot}
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-sm text-xs text-gray-300 hover:bg-[#111] uppercase tracking-widest transition"
             >
                <Save className="w-4 h-4" />
                Session Snapshot
             </button>

             {sessionSnapshot && (
               <button 
                  onClick={loadSessionSnapshot}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-sm text-xs text-[#00f0ff] bg-[#00f0ff]/5 hover:bg-[#00f0ff]/10 uppercase tracking-widest transition"
               >
                  <Download className="w-4 h-4" />
                  Restore
               </button>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full h-[600px] overflow-hidden flex-col">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 flex flex-col h-full overflow-hidden">
             
             <div className="flex items-center justify-between gap-4 mb-4 border-b border-[#1a1a1a] pb-4">
                 <div className="flex items-center gap-2">
                     <Shield className="w-4 h-4 text-[#facc15]" />
                     <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Chronological Event Logs</h3>
                 </div>
                 
                 <input 
                    type="text"
                    value={filterStr}
                    onChange={(e) => setFilterStr(e.target.value)}
                    placeholder="Filter by correlation ID or strategy..."
                    className="bg-[#111] border border-[#333] px-3 py-1 text-xs outline-none focus:border-[#0ea5e9] w-64"
                 />
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 no-scrollbar font-mono text-[10px]">
                 {filteredHistory.length === 0 ? (
                     <div className="text-center text-gray-600 mt-10 uppercase tracking-widest text-[10px]">No override activity logged. System is operating autonomously.</div>
                 ) : (
                     filteredHistory.map((log, i) => (
                         <div key={log.id || i} className="mb-2 pb-2 border-b border-[#111] flex flex-col gap-2 p-2 hover:bg-[#0a0a0a] group transition-colors">
                             <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                   <Clock className="w-3 h-3 text-gray-500" />
                                   <span className="text-gray-400 opacity-90">{new Date(log.timestamp).toISOString()}</span>
                                   <span className="text-gray-500 font-bold bg-[#1a1a1a] px-2 py-0.5 rounded text-[9px]">{log.correlationId}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest ${log.userOverride ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20'}`}>
                                    {log.userOverride ? "MANUAL OVERRIDE" : "AI AUTONOMOUS"}
                                </span>
                             </div>
                             
                             <div className="grid grid-cols-4 gap-4 px-6 text-[10px]">
                                 <div className="flex flex-col">
                                     <span className="text-gray-600 uppercase">Strategy</span>
                                     <span className="text-gray-300">{log.strategyId}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-600 uppercase">AI Decision</span>
                                     <span className="text-[#0ea5e9] font-bold">{log.aiDecision}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-600 uppercase">User Override</span>
                                     <span className="text-orange-400 font-bold">{log.userOverride || "NONE"}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-600 uppercase">Expected Edge</span>
                                     <span className={`font-bold ${log.simulatedOutcome > 0 ? "text-[#39ff14]" : "text-red-500"}`}>${log.simulatedOutcome.toFixed(2)}</span>
                                 </div>
                             </div>
                         </div>
                     ))
                 )}
             </div>
          </div>
      </div>
    </motion.div>
  );
}
