import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, BrainCircuit, Activity, ShieldAlert, GitMerge, ChevronRight, Lock, Eye, AlertCircle, Terminal, Command } from 'lucide-react';

export function AIAgentsTab() {
  const [selectedAgent, setSelectedAgent] = useState<'Quant-v4' | 'Risk-Guardian' | 'Alpha-Seeker'>('Quant-v4');

  return (
    <motion.div 
      key="ai-agents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <BrainCircuit className="w-8 h-8 text-[#00f0ff]" />
            AI Agent Fleet
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Autonomous Trading Orchestration & Logic</p>
        </div>
        <div className="flex gap-2">
          {['Quant-v4', 'Risk-Guardian', 'Alpha-Seeker'].map((agent) => (
            <button 
              key={agent}
              onClick={() => setSelectedAgent(agent as any)}
              className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all ${selectedAgent === agent ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/50' : 'bg-[#0a0a0a] text-gray-500 border border-[#222] hover:border-[#333]'}`}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent State & Transparency */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Reasoning Box */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#00f0ff]/10 transition-colors duration-1000 hidden"></div>
            
            <h3 className="text-[#00f0ff] font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Active System Reasoning
            </h3>
            
            <div className="space-y-4">
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-sm p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                     <Command className="w-3.5 h-3.5 text-[#00f0ff]" />
                     Intent Evaluator
                  </span>
                  <span className="text-[#39ff14] text-xs font-bold bg-[#39ff14]/10 px-2 py-0.5 rounded border border-[#39ff14]/20">88% CONFIDENCE</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  Analyzing multi-timeframe divergence on BTC/USDT. Institutional limit orders stacking at $64,150. Volume nodes support local bottom.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-lg p-3">
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Risk Check</span>
                   <div className="flex items-center gap-2 text-sm">
                     <ShieldAlert className="w-4 h-4 text-[#ff4500]" />
                     <span className="text-gray-300">Expected Drawdown: <span className="text-[#ff4500]">1.2%</span></span>
                   </div>
                </div>
                <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-lg p-3">
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Decision</span>
                   <div className="flex items-center gap-2 text-sm">
                     <GitMerge className="w-4 h-4 text-[#39ff14]" />
                     <span className="text-gray-300">Action: <span className="text-[#39ff14] font-bold">DEPLOY LONG</span></span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Neural Adaptation / Learning Matrix */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden flex-1">
             <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-[#1a1a1a] pb-3">
              <Cpu className="w-4 h-4 text-[#a855f7]" />
              Strategy Adaptation Matrix
            </h3>

            <div className="flex items-center gap-8 px-4 h-32 relative">
               {/* Animated Connection Lines */}
               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#1a1a1a] -translate-y-1/2 flex">
                 <div className="h-full bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent w-1/2 opacity-60"></div>
               </div>

               {/* Nodes */}
               <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border-2 border-[#1a1a1a] flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,1)]">
                    <Activity className="w-5 h-5 text-gray-500" />
                 </div>
                 <span className="text-[9px] uppercase tracking-widest text-gray-500 block text-center min-w-[80px]">Ingest Data</span>
               </div>
               
               <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 border-2 border-[#0ea5e9]/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                    <BrainCircuit className="w-5 h-5 text-[#0ea5e9]" />

                 </div>
                 <span className="text-[9px] uppercase tracking-widest text-[#0ea5e9] block text-center min-w-[80px]">Model Evaluation</span>
               </div>

               <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-[#84cc16]/10 border-2 border-[#84cc16]/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                    <GitMerge className="w-5 h-5 text-[#84cc16]" />
                 </div>
                 <span className="text-[9px] uppercase tracking-widest text-[#84cc16] block text-center min-w-[80px]">Adjust Weights</span>
               </div>
            </div>

            <div className="mt-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 text-[11px] text-gray-400">
              <span className="text-[#a855f7] font-bold mr-2">LOG:</span>
              Detected volatility compression in 5m timeframe. Adapting local scalping parameters: tightening stop-loss by 0.15% to defend capital against sudden breakout.
            </div>
          </div>
        </div>

        {/* Right Column: Constraints & History */}
        <div className="col-span-1 flex flex-col gap-6">
           <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 border-t-[3px] border-t-[#ff4500]">
             <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff4500]" />
              Rejected Trades Tracker
            </h3>
            
            <div className="space-y-3">
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-300 font-bold">SHORT ETH/USDT</span>
                  <span className="text-[#ff4500]">Blocked</span>
                </div>
                <p className="text-[10px] text-gray-500 border-l border-[#ff4500]/50 pl-2 ml-1 transition-all group-hover:text-gray-400 group-hover:border-[#ff4500]">
                  Reason: Macro correlation divergence. BTC is trending upwards while ETH shows weakness. Risk engine blocked short due to systemic upward drag probability (82%).
                </p>
              </div>
              <div className="w-full h-[1px] bg-[#1a1a1a]"></div>
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-300 font-bold">LONG SOL/USDT</span>
                  <span className="text-[#ff4500]">Blocked</span>
                </div>
                <p className="text-[10px] text-gray-500 border-l border-[#ff4500]/50 pl-2 ml-1 transition-all group-hover:text-gray-400 group-hover:border-[#ff4500]">
                  Reason: Portfolio margin utilization exceeds 85% threshold. Trade rejected by strict risk constraint layer.
                </p>
              </div>
            </div>
           </div>

           <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col">
              <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                Immutable Rules
              </h3>

              <ul className="space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                  <div>
                    <span className="text-xs text-gray-200 block mb-0.5">Maximum Drawdown Limit</span>
                    <span className="text-[10px] text-gray-500">Hard stop at 1.5% per session.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                  <div>
                    <span className="text-xs text-gray-200 block mb-0.5">Latency Threshold</span>
                    <span className="text-[10px] text-gray-500">Abort execution if API &gt; 50ms.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5"></div>
                  <div>
                    <span className="text-xs text-gray-200 block mb-0.5">No Naked Options</span>
                    <span className="text-[10px] text-gray-500">Agent must hedge delta exposure.</span>
                  </div>
                </li>
              </ul>
              
              <button className="w-full py-2 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] hover:text-white transition-colors text-xs text-gray-400 rounded flex items-center justify-center gap-2 mt-4 font-bold uppercase tracking-widest cursor-pointer">
                Modify Constraints
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
