import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Boxes,
  Cpu,
  Database,
  Link as LinkIcon,
  Play,
  Radio,
  Plus,
  Layers,
  Network,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export function WorkflowsTab() {
  const [expertMode, setExpertMode] = useState(true);

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
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">
            Procedural Logic & Visual Orchestration
          </p>
        </div>

        {/* Layered Complexity Toggle */}
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#222] p-1 rounded-sm">
          <button
            onClick={() => setExpertMode(false)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              !expertMode
                ? "bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/50 shadow-[0_0_10px_rgba(255,0,240,0.2)]"
                : "text-gray-500 border border-transparent hover:text-gray-300"
            }`}
          >
            Express Setup
          </button>
          <button
            onClick={() => setExpertMode(true)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
              expertMode
                ? "bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/50 shadow-[0_0_10px_rgba(255,0,240,0.2)]"
                : "text-gray-500 border border-transparent hover:text-gray-300"
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
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Trading in 60 Seconds
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
                Select a pre-built algorithmic strategy templates. These are
                curated by our quant team and automatically adapt to market
                conditions.
              </p>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#ff00f0]/50 rounded-sm p-5 cursor-pointer transition-all group">
                  <h3 className="text-white font-bold mb-1 group-hover:text-[#ff00f0] transition-colors">
                    Momentum Scalper
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">
                    Capitalizes on short-term high-volume breakouts.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-[#1a1a1a] pt-3">
                    <span className="text-gray-600 uppercase">Risk Level</span>
                    <span className="text-[#00f0ff]">Medium</span>
                  </div>
                </div>
                <div className="bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#ff00f0]/50 rounded-sm p-5 cursor-pointer transition-all group">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold group-hover:text-[#ff00f0] transition-colors">
                      Grid Arbitration
                    </h3>
                    <span className="bg-[#39ff14]/10 text-[#39ff14] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-4">
                    Market-neutral strategy capturing sideways chop.
                  </p>
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
            className="flex-1 flex gap-6 min-h-[600px]"
          >
            {/* Component Library Panel */}
            <div className="w-64 flex-shrink-0 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              <h3 className="text-white font-bold text-sm tracking-wide mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ff00f0]" />
                Logic Blocks
              </h3>

              {/* Indicators */}
              <div>
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5" /> Indicators
                </h4>
                <div className="space-y-2">
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all text-xs text-gray-300 font-mono">
                    Relative Strength (RSI)
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all text-xs text-gray-300 font-mono">
                    Volume Profile
                  </div>
                </div>
              </div>

              {/* AI Conditions */}
              <div className="mt-2">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" /> AI Conditions
                </h4>
                <div className="space-y-2">
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#a855f7] hover:bg-[#a855f7]/5 transition-all text-xs text-gray-300 font-mono">
                    Sentiment Analysis NLP
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#a855f7] hover:bg-[#a855f7]/5 transition-all text-xs text-gray-300 font-mono">
                    Regime Classification
                  </div>
                </div>
              </div>

              {/* Volatility Rules */}
              <div className="mt-2">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                  <Network className="w-3.5 h-3.5" /> Volatility Rules
                </h4>
                <div className="space-y-2">
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#facc15] hover:bg-[#facc15]/5 transition-all text-xs text-gray-300 font-mono">
                    ATR Expand / Contract
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#facc15] hover:bg-[#facc15]/5 transition-all text-xs text-gray-300 font-mono">
                    Bollinger Squeeze
                  </div>
                </div>
              </div>

              {/* Risk Parameters */}
              <div className="mt-2">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" /> Risk Parameters
                </h4>
                <div className="space-y-2">
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#ff4500] hover:bg-[#ff4500]/5 transition-all text-xs text-gray-300 font-mono">
                    Max Drawdown Guard
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#222] p-2.5 rounded cursor-move hover:border-[#ff4500] hover:bg-[#ff4500]/5 transition-all text-xs text-gray-300 font-mono">
                    Trailing Stop %
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Node Editor (Canvas) */}
            <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm relative overflow-hidden flex flex-col shadow-none">
              <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>

              {/* Nodes inside Canvas */}
              <div className="relative flex-1 p-8">
                {/* Connection SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <path
                    d="M 280 150 C 350 150, 350 250, 420 250"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    fill="none"
                    className="opacity-60"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M 280 350 C 350 350, 350 250, 420 250"
                    stroke="#a855f7"
                    strokeWidth="2"
                    fill="none"
                    className="opacity-60"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M 670 250 C 720 250, 720 250, 770 250"
                    stroke="#ff00f0"
                    strokeWidth="2"
                    fill="none"
                    className="opacity-60"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Indicator Node */}
                <div className="absolute top-[100px] left-[50px] z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#00f0ff] p-4 rounded-sm w-56 shadow-xl cursor-move hover:border-[#333]">
                  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                    <Radio className="w-4 h-4 text-[#00f0ff]" />
                    <span className="text-xs font-bold text-gray-200">
                      Volume Profile
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mb-2">
                    Source: Binance Futures
                  </div>
                  <div className="bg-[#111] border border-[#222] rounded p-1.5 text-[10px] font-mono text-gray-400">
                    Condition &gt; 150% MA
                  </div>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] border border-[#00f0ff] rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_5px_#00f0ff]"></div>
                  </div>
                </div>

                {/* AI Condition Node */}
                <div className="absolute top-[300px] left-[50px] z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#a855f7] p-4 rounded-sm w-56 shadow-xl cursor-move hover:border-[#333]">
                  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                    <Cpu className="w-4 h-4 text-[#a855f7]" />
                    <span className="text-xs font-bold text-gray-200">
                      Sentiment NLP Agent
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mb-2">
                    Model: Gemini 1.5 Pro
                  </div>
                  <div className="bg-[#111] border border-[#222] rounded p-1.5 text-[10px] font-mono text-gray-400">
                    Bias: Strongly Bullish
                  </div>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] border border-[#a855f7] rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full shadow-[0_0_5px_#a855f7]"></div>
                  </div>
                </div>

                {/* Logic AND/OR Node */}
                <div className="absolute top-[230px] left-[420px] z-10 bg-[#111] border border-[#333] p-3 rounded-md shadow-xl cursor-move flex items-center gap-2">
                  <div className="absolute top-1/4 -left-2 -translate-y-1/2 w-3 h-3 bg-[#0a0a0a] border border-[#333] rounded-full"></div>
                  <div className="absolute top-3/4 -left-2 -translate-y-1/2 w-3 h-3 bg-[#0a0a0a] border border-[#333] rounded-full"></div>
                  <span className="text-xs font-bold text-white font-mono uppercase px-2">
                    AND
                  </span>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 bg-[#0a0a0a] border border-[#ff00f0] rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#ff00f0] rounded-full"></div>
                  </div>
                </div>

                {/* Risk / Execution Node */}
                <div className="absolute top-[180px] left-[770px] z-10 bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#ff00f0] p-4 rounded-sm w-64 shadow-xl cursor-move hover:border-[#333]">
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] border border-[#ff00f0] rounded-full"></div>
                  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-[#1a1a1a]">
                    <Boxes className="w-4 h-4 text-[#ff00f0]" />
                    <span className="text-xs font-bold text-gray-200">
                      Execution Hub
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mb-2">
                    Target Action
                  </div>
                  <div className="bg-[#ff00f0]/10 border border-[#ff00f0]/30 rounded p-2 text-xs font-bold text-[#ff00f0] flex items-center justify-between">
                    <span>MARKET BUY (BTC)</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <Database className="w-3 h-3 text-[#ff4500]" />
                    Max Loss Guard: 2.5%
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Properties Panel */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4">
                <h3 className="text-white font-bold text-sm tracking-wide mb-4">
                  Node Properties
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">
                      Agent Model
                    </label>
                    <select className="w-full bg-[#0a0a0a] border border-[#222] text-gray-300 text-xs rounded p-2 outline-none hover:border-[#333]">
                      <option>Quant-v4 (Fast)</option>
                      <option>Alpha-Seeker (Deep)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">
                      Slippage Tolerance
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        className="w-full accent-[#ff00f0]"
                        min="0"
                        max="100"
                        defaultValue="15"
                      />
                      <span className="text-xs text-gray-400 font-mono w-8 text-right">
                        0.15%
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-2 group">
                    <div className="w-4 h-4 rounded border border-[#222] flex items-center justify-center bg-[#0a0a0a] group-hover:border-[#ff00f0]">
                      <CheckCircle2 className="w-3 h-3 text-[#ff00f0] opacity-100" />
                    </div>
                    <span className="text-xs text-gray-400">
                      Strict Memory Persistence
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col">
                <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" />
                  Memory Subsystem
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed min-h-[50px]">
                  The node retains context of previous 50 ticks to infer
                  micro-trend velocity.
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
