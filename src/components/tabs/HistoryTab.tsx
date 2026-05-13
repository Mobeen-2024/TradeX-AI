import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Archive,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database,
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";

type MemoryEvent = {
  id: string;
  type:
    | "market_event"
    | "decision"
    | "outcome"
    | "mistake"
    | "recovered_pattern";
  time: string;
  title: string;
  description: string;
  agent: string;
  impact?: string;
  impactType?: "positive" | "negative" | "neutral";
  mistakeDetails?: {
    lossBreakdown: { label: string; active: boolean; value?: string }[];
    repeatedMistake: string;
    confidenceAdjustment: string;
  };
};

const mockMemories: MemoryEvent[] = [
  {
    id: "MEM-091",
    type: "recovered_pattern",
    time: "2024-05-12 14:15:00",
    title: "Wyckoff Spring Pattern Identified",
    description:
      "System successfully recognized a textbook Wyckoff Spring on BTC/USDT 15m. Matched 92% similarity to historical event from Nov 2023. Applied accumulated learning for optimal entry.",
    agent: "Quant-v4",
    impact: "+$12,450 Realized",
    impactType: "positive",
  },
  {
    id: "MEM-090",
    type: "outcome",
    time: "2024-05-12 11:30:21",
    title: "ETH Short Execution Completed",
    description:
      "Closed short position at target following divergence signal. Original thesis validated as spot volume dried up exactly 3 ticks above limit.",
    agent: "Alpha-Seeker",
    impact: "+0.81% PNL",
    impactType: "positive",
  },
  {
    id: "MEM-089",
    type: "mistake",
    time: "2024-05-11 09:44:11",
    title: "Stop-Loss Slipped Pending News",
    description:
      'Unexpected CPI leak caused erratic spread widening. Stop-loss on SOL long triggered prematurely before true momentum reversal. Added flag: "Require confirmed trend before stop-loss trigger in high-variance macro windows".',
    agent: "Risk-Guardian",
    impact: "-2.13% PNL",
    impactType: "negative",
    mistakeDetails: {
      lossBreakdown: [
        { label: "Volatility", active: true, value: "Extreme Spread" },
        { label: "Late Entry", active: false },
        {
          label: "Liquidity Trap",
          active: true,
          value: "Low order book depth",
        },
        { label: "Overexposure", active: false },
      ],
      repeatedMistake: "Entering during low liquidity spikes.",
      confidenceAdjustment: "Future confidence reduced by 12%.",
    },
  },
  {
    id: "MEM-088",
    type: "decision",
    time: "2024-05-11 08:30:00",
    title: "Hedge Ratio dynamically adjusted",
    description:
      "Director consensus shifted overall portfolio delta bias from +0.4 to Neutral. Triggered by deteriorating cross-asset correlations, specifically SPX lagging BTC gains.",
    agent: "Master Director",
    impact: "Risk mitigated",
    impactType: "neutral",
  },
  {
    id: "MEM-087",
    type: "market_event",
    time: "2024-05-10 14:20:05",
    title: "Sudden Volatility Contraction",
    description:
      "Bollinger Band width on BTC 4h reached lowest quartile of past 180 days. System entered observation mode, awaiting breakout vector.",
    agent: "Quant-v4",
    impact: "System Idle",
    impactType: "neutral",
  },
];

function MemoryIcon({ type }: { type: MemoryEvent["type"] }) {
  switch (type) {
    case "market_event":
      return <Zap className="w-4 h-4 text-[#0ea5e9]" />;
    case "decision":
      return <BrainCircuit className="w-4 h-4 text-[#a855f7]" />;
    case "outcome":
      return <ArrowUpRight className="w-4 h-4 text-[#39ff14]" />;
    case "mistake":
      return <AlertTriangle className="w-4 h-4 text-[#ff4500]" />;
    case "recovered_pattern":
      return <ShieldCheck className="w-4 h-4 text-[#facc15]" />;
  }
}

function MemoryColor({ type }: { type: MemoryEvent["type"] }) {
  switch (type) {
    case "market_event":
      return "#0ea5e9";
    case "decision":
      return "#a855f7";
    case "outcome":
      return "#39ff14";
    case "mistake":
      return "#ff4500";
    case "recovered_pattern":
      return "#facc15";
  }
}

export function HistoryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<string>(
    mockMemories[0].id,
  );

  const activeMemory =
    mockMemories.find((m) => m.id === selectedMemory) || mockMemories[0];

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-6 relative">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#00f0ff]/5 blur-[60px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-4 font-sans drop-shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Database className="w-6 h-6 text-[#00f0ff]" />
            </div>
            Memory Vault
          </h1>
          <p className="text-gray-400 text-xs mt-3 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            Semantic Log of AI Experience & Pattern Recovery
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button className="flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg">
            <Filter className="w-4 h-4" />
            Filter Events
          </button>
        </div>
      </div>

      <div className="bg-[#020202]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-4 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] group transition-colors hover:border-white/20">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-[#00f0ff]/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20 shrink-0 shadow-inner group-hover:border-[#00f0ff]/40 transition-colors">
          <Search className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search: 'Show similar BTC volatility events...'"
          className="bg-transparent border-none text-white w-full focus:outline-none font-sans placeholder-gray-500 text-lg tracking-wide"
        />
        <div className="px-4 text-xs font-mono text-gray-600">
          ctrl+k
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 h-full min-h-[500px]">
        {/* Timeline List */}
        <div className="col-span-1 xl:col-span-4 bg-[#020202] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="p-5 border-b border-white/5 bg-[#0a0a0a]/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Agent Neural Timeline
            </span>
            <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_8px_#39ff14]"></div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-1 relative">
            <div className="absolute top-5 bottom-5 left-[35px] w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent z-0"></div>

            {mockMemories.map((memory) => {
              const isActive = selectedMemory === memory.id;
              const color = MemoryColor({ type: memory.type });
              return (
                <button
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory.id)}
                  className={`w-full text-left relative z-10 flex gap-4 p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${isActive ? "bg-[#0a0a0a] border-white/10 shadow-lg scale-[1.02]" : "bg-transparent border-transparent hover:bg-white/[0.02]"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMemory"
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        background: `radial-gradient(120px circle at left center, ${color}, transparent)`
                      }}
                    />
                  )}
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm relative z-10 transition-all duration-300 ${isActive ? "scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"}`}
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: isActive ? color : '#333',
                      boxShadow: isActive ? `0 0 15px ${color}40` : 'none'
                    }}
                  >
                    <MemoryIcon type={memory.type} />
                  </div>
                  <div className="flex-1 overflow-hidden relative z-10">
                    <div className="flex justify-between items-start mb-1 text-xs">
                      <span className={`font-bold font-sans truncate pr-2 transition-colors ${isActive ? "text-white" : "text-gray-300 group-hover:text-gray-100"}`}>
                        {memory.title}
                      </span>
                      <span className={`text-[9px] whitespace-nowrap font-mono transition-colors ${isActive ? "text-gray-400" : "text-gray-600"}`}>
                        {memory.time.split(" ")[1]}
                      </span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest mt-1 flex items-center gap-1.5 font-bold" style={{ color: isActive ? color : '#666' }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 5px ${color}` : 'none'
                        }}
                      ></span>
                      {memory.type.replace("_", " ")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Details view */}
        <div className="col-span-1 xl:col-span-8 bg-[#020202] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMemory.id}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-8 relative z-10"
            >
              {/* Animated glow background based on memory type */}
              <div 
                className="absolute inset-0 opacity-[0.03] transition-colors duration-1000 z-0 pointer-events-none mix-blend-screen"
                style={{
                  background: `radial-gradient(circle at top right, ${MemoryColor({ type: activeMemory.type })}, transparent 50%)`
                }}
              />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="absolute inset-0 rounded-xl opacity-20 bg-current" style={{ color: MemoryColor({ type: activeMemory.type }) }}></div>
                  <div className="absolute inset-0 rounded-xl border border-current opacity-50" style={{ color: MemoryColor({ type: activeMemory.type }) }}></div>
                  <MemoryIcon type={activeMemory.type} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white font-sans tracking-tight drop-shadow-md">
                    {activeMemory.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold mt-2 border border-white/5 bg-white/5 py-1 px-3 rounded-full inline-flex backdrop-blur-md">
                    <span
                      style={{
                        color: MemoryColor({ type: activeMemory.type }),
                        textShadow: `0 0 10px ${MemoryColor({ type: activeMemory.type })}80`
                      }}
                    >
                      {activeMemory.type.replace("_", " ")}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" /> {activeMemory.time}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 font-mono text-[10px] bg-black/50 px-2 py-0.5 rounded">{activeMemory.id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-xl p-6 mb-6 shadow-inner relative z-10 backdrop-blur-sm">
                <h3 className="text-[10px] uppercase font-bold tracking-widest mb-3 text-gray-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MemoryColor({ type: activeMemory.type }) }}></span>
                  Context & Deep Analysis
                </h3>
                <p className="text-base text-gray-300 leading-relaxed font-sans">
                  {activeMemory.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors backdrop-blur-sm">
                  <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3 flex items-center gap-2">
                    <BrainCircuit className="w-3.5 h-3.5 text-gray-400" />
                    Originating Node
                  </h3>
                  <span className="text-sm text-white font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                    {activeMemory.agent}
                  </span>
                </div>
                <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors backdrop-blur-sm">
                  <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">
                    Outcome Impact
                  </h3>
                  <span
                    className={`text-sm font-mono font-bold px-3 py-1.5 rounded-md border inline-block ${activeMemory.impactType === "positive" ? "text-[#39ff14] bg-[#39ff14]/5 border-[#39ff14]/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]" : activeMemory.impactType === "negative" ? "text-[#ff4500] bg-[#ff4500]/5 border-[#ff4500]/20 shadow-[0_0_10px_rgba(255,69,0,0.1)]" : "text-gray-400 bg-white/5 border-white/10"}`}
                  >
                    {activeMemory.impact || "None"}
                  </span>
                </div>
              </div>

              {activeMemory.type === "mistake" &&
                activeMemory.mistakeDetails && (
                  <div className="mb-6 space-y-6 mt-auto relative z-10">
                    {/* Loss Breakdown */}
                    <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-xl p-5">
                      <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">
                        Loss Attribution Vector
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {activeMemory.mistakeDetails.lossBreakdown.map(
                          (factor, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border flex flex-col gap-1 transition-all ${factor.active ? "bg-[#ff4500]/5 border-[#ff4500]/30 shadow-[inset_0_0_15px_rgba(255,69,0,0.05)]" : "bg-[#111]/50 border-white/5 opacity-50"}`}
                            >
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest ${factor.active ? "text-[#ff4500] drop-shadow-[0_0_2px_#ff4500]" : "text-gray-500"}`}
                              >
                                {factor.label}
                              </span>
                              {factor.active && factor.value && (
                                <span className="text-xs text-gray-300 font-mono mt-1">
                                  {factor.value}
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* AI Self-Correction Panel */}
                    <div className="bg-gradient-to-r from-[#ff4500]/10 to-transparent border border-[#ff4500]/30 rounded-xl p-5 shadow-[0_0_20px_rgba(255,69,0,0.05)] backdrop-blur-md">
                      <h3 className="text-[#ff4500] text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-4 drop-shadow-[0_0_5px_#ff4500]">
                        <AlertTriangle className="w-4 h-4" />
                        Neural Weights Self-Correction
                      </h3>
                      <div className="space-y-4">
                        <div className="text-gray-300 text-sm font-mono flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                          <span className="text-[#ff4500] mt-0.5">↳</span>
                          <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Identified Error Signature</span>
                            <span className="text-white border-l-2 border-[#ff4500] pl-2 py-0.5 inline-block text-xs">
                              "{activeMemory.mistakeDetails.repeatedMistake}"
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm font-mono flex items-center gap-3">
                          <span className="text-[#ff4500]">↳</span>
                          <span className="bg-[#ff4500]/10 text-[#ff4500] px-3 py-1 rounded text-xs font-bold border border-[#ff4500]/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]">
                            {activeMemory.mistakeDetails.confidenceAdjustment}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest mt-4 pt-4 border-t border-white/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></div>
                          Neural weights updated via backpropagation. Invariant embedded in Risk-Guardian.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {activeMemory.type === "recovered_pattern" && (
                <div className="mt-auto bg-gradient-to-r from-[#facc15]/10 to-transparent border border-[#facc15]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(250,204,21,0.05)] relative z-10 backdrop-blur-md">
                  <h3 className="text-[#facc15] text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-3 drop-shadow-[0_0_5px_#facc15]">
                    <ShieldCheck className="w-4 h-4" />
                    Semantic Retrieval Match Activated
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-3 mt-2">
                    <p className="text-gray-300 text-xs font-mono leading-relaxed">
                      Vector distance: <span className="text-[#00f0ff] font-bold">0.082</span>
                      <br/>
                      Successfully leveraged identical historical conditions from Memory Vault to enhance execution precision by <span className="text-[#39ff14] font-bold">14%</span>.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
