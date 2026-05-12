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
      <div className="flex justify-between items-end mb-4 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <Database className="w-8 h-8 text-[#00f0ff]" />
            Memory Vault
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            Semantic Log of AI Experience & Pattern Recovery
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-[#050505] border border-[#222] text-gray-400 hover:text-white hover:border-[#333] px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter Events
          </button>
        </div>
      </div>

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-r from-transparent to-[#00f0ff]/5 pointer-events-none"></div>
        <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20 shrink-0">
          <Search className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search: 'Show similar BTC volatility events...'"
          className="bg-transparent border-none text-white text-sm w-full focus:outline-none font-sans placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 h-full min-h-[500px]">
        {/* Timeline List */}
        <div className="col-span-1 xl:col-span-4 bg-[#050505] border border-[#1a1a1a] rounded-sm flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/50 flex justify-between items-center sticky top-0 z-10">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 relative">
            <div className="absolute top-4 bottom-4 left-[31px] w-[1px] bg-[#1a1a1a] z-0"></div>

            {mockMemories.map((memory) => (
              <button
                key={memory.id}
                onClick={() => setSelectedMemory(memory.id)}
                className={`w-full text-left relative z-10 flex gap-4 p-3 rounded-sm border transition-all ${selectedMemory === memory.id ? "bg-[#111] border-[#333] shadow-md" : "bg-[#0a0a0a] border-transparent hover:border-[#222]"}`}
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${MemoryColor({ type: memory.type })}15`,
                  }}
                >
                  <MemoryIcon type={memory.type} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-1 text-xs">
                    <span className="font-bold text-gray-300 font-sans truncate pr-2">
                      {memory.title}
                    </span>
                    <span className="text-[9px] text-gray-600 whitespace-nowrap">
                      {memory.time.split(" ")[1]}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: MemoryColor({ type: memory.type }),
                      }}
                    ></span>
                    {memory.type.replace("_", " ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Memory Details view */}
        <div className="col-span-1 xl:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded-sm flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMemory.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-lg border flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  style={{
                    backgroundColor: `${MemoryColor({ type: activeMemory.type })}10`,
                    borderColor: `${MemoryColor({ type: activeMemory.type })}40`,
                  }}
                >
                  <MemoryIcon type={activeMemory.type} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-sans tracking-tight">
                    {activeMemory.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500 mt-1">
                    <span
                      style={{
                        color: MemoryColor({ type: activeMemory.type }),
                      }}
                    >
                      {activeMemory.type.replace("_", " ")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activeMemory.time}
                    </span>
                    <span>•</span>
                    <span>{activeMemory.id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-6 mb-6">
                <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-3">
                  Context & Analysis
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  {activeMemory.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4">
                  <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-2 border-b border-[#222] pb-2">
                    Originating Node
                  </h3>
                  <span className="text-sm text-white font-mono flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-gray-500" />
                    {activeMemory.agent}
                  </span>
                </div>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4">
                  <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-2 border-b border-[#222] pb-2">
                    Outcome Impact
                  </h3>
                  <span
                    className={`text-sm font-mono font-bold ${activeMemory.impactType === "positive" ? "text-[#39ff14]" : activeMemory.impactType === "negative" ? "text-[#ff4500]" : "text-gray-400"}`}
                  >
                    {activeMemory.impact || "None"}
                  </span>
                </div>
              </div>

              {activeMemory.type === "mistake" &&
                activeMemory.mistakeDetails && (
                  <div className="mb-6 space-y-6 mt-auto">
                    {/* Loss Breakdown */}
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4">
                      <h3 className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-4 border-b border-[#222] pb-2">
                        Loss Breakdown
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {activeMemory.mistakeDetails.lossBreakdown.map(
                          (factor, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded border flex flex-col gap-1 ${factor.active ? "bg-[#ff4500]/5 border-[#ff4500]/30" : "bg-[#111] border-[#222] opacity-50"}`}
                            >
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest ${factor.active ? "text-[#ff4500]" : "text-gray-500"}`}
                              >
                                {factor.label}
                              </span>
                              {factor.active && factor.value && (
                                <span className="text-xs text-gray-300 font-mono">
                                  {factor.value}
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* AI Self-Correction Panel */}
                    <div className="bg-[#ff4500]/5 border border-[#ff4500]/20 rounded p-4">
                      <h3 className="text-[#ff4500] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 mb-3 border-b border-[#ff4500]/20 pb-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        AI Self-Correction Panel
                      </h3>
                      <div className="space-y-3">
                        <div className="text-gray-300 text-sm font-mono flex items-start gap-2">
                          <span className="text-[#ff4500] mt-0.5">↳</span>
                          <div>
                            Detected repeated mistake:
                            <br />
                            <span className="text-white bg-[#000] border border-[#ff4500]/30 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                              "{activeMemory.mistakeDetails.repeatedMistake}"
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm font-mono flex items-start gap-2">
                          <span className="text-[#ff4500] mt-0.5">↳</span>
                          <span className="bg-[#ff4500]/10 text-[#ff4500] px-1.5 py-0.5 rounded-sm font-bold border border-[#ff4500]/20">
                            {activeMemory.mistakeDetails.confidenceAdjustment}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-[#ff4500]/10 border-dashed">
                          Neural weights updated via backpropagation. New
                          invariant embedded in Risk-Guardian firewall.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {activeMemory.type === "recovered_pattern" && (
                <div className="mt-auto bg-[#facc15]/5 border border-[#facc15]/20 rounded p-4">
                  <h3 className="text-[#facc15] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Semantic Retrieval Match
                  </h3>
                  <p className="text-gray-400 text-xs font-mono">
                    Vector distance: 0.082. Successfully leveraged identical
                    historical conditions from Memory Vault to enhance execution
                    precision by 14%.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
