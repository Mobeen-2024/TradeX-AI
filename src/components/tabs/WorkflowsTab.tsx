import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Boxes, Cpu, Database, Link as LinkIcon, Play, Radio, Plus, Layers, Network, ChevronDown, CheckCircle2 } from 'lucide-react';

export function WorkflowsTab() {
  const [expertMode, setExpertMode] = useState(false);

  return (
    <motion.div 
      key="workflows"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-sans"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Boxes className="w-8 h-8 text-[#ff00f0]" />
            Strategy Lab & Workflows
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">Procedural Logic & Visual Orchestration</p>
        </div>
        
        {/* Layered Complexity Toggle */}
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#222] p-1 rounded-sm">
          <button 
            onClick={() => setExpertMode(false)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              !expertMode ? 'bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/50 shadow-[0_0_10px_rgba(255,0,240,0.2)]' : 'text-gray-500 border border-transparent hover:text-gray-300'
            }`}
          >
            Express Setup
          </button>
          <button 
            onClick={() => setExpertMode(true)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
              expertMode ? 'bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/50 shadow-[0_0_10px_rgba(255,0,240,0.2)]' : 'text-gray-500 border border-transparent hover:text-gray-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Expert Mode
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!expertMode ? (
          <motion.div 
            key="express"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center pt-10"
          >
             <div className="max-w-2xl w-full text-center">
                <div className="w-16 h-16 bg-[#ff00f0]/10 rounded-sm mx-auto flex items-center justify-center border border-[#ff00f0]/30 shadow-none mb-6">
                  <Play className="w-8 h-8 text-[#ff00f0] ml-1" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Start Trading in 60 Seconds</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
                  Select a pre-built algorithmic strategy templates. These are curated by our quant team and automatically adapt to market conditions.
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#ff00f0]/50 rounded-sm p-5 cursor-pointer transition-all group">
                     <h3 className="text-white font-bold mb-1 group-hover:text-[#ff00f0] transition-colors">Momentum Scalper</h3>
                     <p className="text-gray-500 text-xs mb-4">Capitalizes on short-term high-volume breakouts.</p>
                     <div className="flex justify-between items-center text-[10px] font-mono border-t border-[#1a1a1a] pt-3">
                       <span className="text-gray-600 uppercase">Risk Level</span>
                       <span className="text-[#00f0ff]">Medium</span>
                     </div>
                  </div>
                  <div className="bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#ff00f0]/50 rounded-sm p-5 cursor-pointer transition-all group">
                     <div className="flex justify-between items-start mb-1">
                       <h3 className="text-white font-bold group-hover:text-[#ff00f0] transition-colors">Grid Arbitration</h3>
                       <span className="bg-[#39ff14]/10 text-[#39ff14] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Popular</span>
                     </div>
                     <p className="text-gray-500 text-xs mb-4">Market-neutral strategy capturing sideways chop.</p>
                     <div className="flex justify-between items-center text-[10px] font-mono border-t border-[#1a1a1a] pt-3">
                       <span className="text-gray-600 uppercase">Risk Level</span>
                       <span className="text-[#39ff14]">Low</span>
                     </div>
                  </div>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="expert"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex gap-6"
          >
            {/* Visual Node Editor (Fake Canvas) */}
            <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm relative overflow-hidden flex flex-col shadow-none">
               <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <button className="bg-[#0a0a0a] border border-[#222] p-2 rounded hover:border-[#ff00f0] transition-colors text-white">
                   <Plus className="w-4 h-4" />
                 </button>
                 <button className="bg-[#0a0a0a] border border-[#222] px-3 py-1.5 rounded hover:border-[#333] transition-colors text-xs text-gray-300 font-mono flex items-center gap-2">
                   Add Logic Node <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                 </button>
               </div>

               {/* Nodes */}
               <div className="relative flex-1 p-20 flex flex-col items-center justify-center gap-16">
                 {/* Connection SVG */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                   {/* Top to Middle */}
                   <path d="M 50% 30% C 50% 50%, 50% 50%, 50% 50%" stroke="#1a1a1a" strokeWidth="2" fill="none" className="translate-y-[40px]" />
                   <path d="M 50% 30% C 50% 50%, 50% 50%, 50% 50%" stroke="#00f0ff" strokeWidth="2" fill="none" strokeDasharray="4 4" className="translate-y-[40px] opacity-60" />
                   
                   {/* Middle to Bottom */}
                   <path d="M 50% 60% C 50% 80%, 50% 80%, 50% 80%" stroke="#1a1a1a" strokeWidth="2" fill="none" className="translate-y-[20px]" />
                   <path d="M 50% 60% C 50% 80%, 50% 80%, 50% 80%" stroke="#ff00f0" strokeWidth="2" fill="none" strokeDasharray="4 4" className="translate-y-[20px] opacity-60" />
                 </svg>

                 <div className="relative z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#00f0ff] p-4 rounded-sm w-64 shadow-xl">
                   <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                     <Radio className="w-4 h-4 text-[#00f0ff]" />
                     <span className="text-xs font-bold text-gray-200">Binance WebSocket</span>
                   </div>
                   <p className="text-[10px] text-gray-500 font-mono">Channel: BTCUSDT@depth</p>
                 </div>

                 <div className="relative z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#a855f7] p-4 rounded-sm w-64 shadow-xl">
                   <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                     <Cpu className="w-4 h-4 text-[#a855f7]" />
                     <span className="text-xs font-bold text-gray-200">Sentiment NLP Agent</span>
                   </div>
                   <p className="text-[10px] text-gray-500 font-mono">Weight: 0.35 threshold</p>
                   {/* Output ports */}
                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0a0a] border border-[#222] rounded-full flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></div>
                   </div>
                 </div>

                 <div className="relative z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#ff00f0] p-4 rounded-sm w-64 shadow-xl">
                   <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                     <Boxes className="w-4 h-4 text-[#ff00f0]" />
                     <span className="text-xs font-bold text-gray-200">Execution Hub</span>
                   </div>
                   <p className="text-[10px] text-gray-500 font-mono">Action: Submit Limit FOK</p>
                 </div>
               </div>
            </div>

            {/* Advanced Properties Panel */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4">
                 <h3 className="text-white font-bold text-sm tracking-wide mb-4">Node Properties</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Agent Model</label>
                     <select className="w-full bg-[#0a0a0a] border border-[#222] text-gray-300 text-xs rounded p-2 outline-none hover:border-[#333]">
                       <option>Quant-v4 (Fast)</option>
                       <option>Alpha-Seeker (Deep)</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Slippage Tolerance</label>
                     <div className="flex items-center gap-2">
                       <input type="range" className="w-full accent-[#ff00f0]" min="0" max="100" defaultValue="15" />
                       <span className="text-xs text-gray-400 font-mono w-8 text-right">0.15%</span>
                     </div>
                   </div>

                   <label className="flex items-center gap-2 cursor-pointer mt-2 group">
                      <div className="w-4 h-4 rounded border border-[#222] flex items-center justify-center bg-[#0a0a0a] group-hover:border-[#ff00f0]">
                        <CheckCircle2 className="w-3 h-3 text-[#ff00f0] opacity-100" />
                      </div>
                      <span className="text-xs text-gray-400">Strict Memory Persistence</span>
                   </label>
                 </div>
              </div>

              <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col">
                 <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Database className="w-3.5 h-3.5" />
                   Memory Subsystem
                 </h3>
                 <p className="text-xs text-gray-400 leading-relaxed min-h-[50px]">
                   The node retains context of previous 50 ticks to infer micro-trend velocity.
                 </p>
                 
                 <div className="mt-auto">
                    <button className="w-full py-2 bg-[#ff00f0] hover:bg-[#d000c4] text-white rounded font-bold text-sm shadow-[0_0_15px_rgba(255,0,240,0.3)] transition-colors">
                      Deploy Workflow
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
