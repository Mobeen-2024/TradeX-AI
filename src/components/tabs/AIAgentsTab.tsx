import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  BrainCircuit,
  Activity,
  ShieldAlert,
  GitMerge,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Command,
  Clock,
  Network,
} from "lucide-react";
import { AIConfidenceRing } from "../ui/AIConfidenceRing";

const agentsData = [
  {
    id: "Director",
    name: "Master Director",
    role: "Orchestration",
    status: "Active",
    color: "#00f0ff",
    confidence: 94,
    focus: "Global Strategy Orchestration",
  },
  {
    id: "Quant-v4",
    name: "Quant Engine v4",
    role: "Data & Signals",
    status: "Processing",
    color: "#a855f7",
    confidence: 89,
    focus: "BTC Volatility Analysis",
  },
  {
    id: "Risk-Guardian",
    name: "Risk Guardian",
    role: "Constraints",
    status: "Monitoring",
    color: "#facc15",
    confidence: 99,
    focus: "Drawdown Prevention",
  },
  {
    id: "Alpha-Seeker",
    name: "Alpha Seeker",
    role: "Execution",
    status: "Idle",
    color: "#39ff14",
    confidence: 82,
    focus: "Execution Timing",
  },
] as const;

export function AIAgentsTab() {
  const [selectedAgentId, setSelectedAgentId] =
    useState<(typeof agentsData)[number]["id"]>("Director");
  const selectedAgent = agentsData.find((a) => a.id === selectedAgentId)!;

  return (
    <motion.div
      key="ai-agents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      {/* HEADER / AI GLOBAL STATUS */}
      <div className="bg-[#050505] border border-[#1a1a1a] p-5 rounded-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_0_40px_rgba(0,240,255,0.02)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00f0ff] shadow-[0_0_20px_#00f0ff]"></div>

        <div className="pl-4">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans mb-1">
            <BrainCircuit className="w-8 h-8 text-[#00f0ff]" />
            AI Command Center
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
            System Online &middot; Autonomous Mode Engaged
          </p>
        </div>

        <div className="flex gap-6 pr-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#0ea5e9]" /> System Load
            </span>
            <span className="text-white font-mono text-xl">
              24<span className="text-gray-500 text-sm">%</span>
            </span>
          </div>
          <div className="w-px h-10 bg-[#1a1a1a]"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#facc15]" /> Latency
            </span>
            <span className="text-white font-mono text-xl">
              12<span className="text-gray-500 text-sm">ms</span>
            </span>
          </div>
          <div className="w-px h-10 bg-[#1a1a1a]"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Network className="w-3 h-3 text-[#a855f7]" /> Active Tasks
            </span>
            <span className="text-white font-mono text-xl">1,432</span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: AGENTS & THINKING PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* AGENTS LIST (Left Col) */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#0ea5e9] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Agent Subsystems
            </h3>
            <span className="text-[9px] bg-[#111] text-gray-500 px-2 py-0.5 rounded border border-[#222]">
              4 ONLINE
            </span>
          </div>

          {agentsData.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`group flex flex-col p-4 rounded-sm border transition-all text-left w-full ${selectedAgentId === agent.id ? "bg-white/5 border-white/20" : "bg-[#050505] border-[#1a1a1a] hover:border-[#333]"}`}
              style={{
                borderLeftColor:
                  selectedAgentId === agent.id ? agent.color : undefined,
                borderLeftWidth: selectedAgentId === agent.id ? "4px" : "1px",
                backgroundColor:
                  selectedAgentId === agent.id ? `${agent.color}0a` : undefined,
                borderColor:
                  selectedAgentId === agent.id ? `${agent.color}40` : undefined,
              }}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div>
                  <h4 className="text-gray-200 text-sm font-bold font-sans group-hover:text-white transition-colors">
                    {agent.name}
                  </h4>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {agent.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    {agent.status === "Processing" && (
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: agent.color }}
                      ></span>
                    )}
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: agent.color }}
                    ></span>
                  </div>
                  <span
                    className="text-[9px] uppercase tracking-widest"
                    style={{ color: agent.color }}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>

              <div className="w-full mt-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1.5">
                  <span>Confidence</span>
                  <span className="text-white font-bold">
                    {agent.confidence}%
                  </span>
                </div>
                <div className="w-full h-1 bg-[#111] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full shadow-[0_0_8px_currentColor]"
                    style={{
                      width: `${agent.confidence}%`,
                      backgroundColor: agent.color,
                      color: agent.color,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-start text-[10px] font-mono text-gray-400 bg-[#0a0a0a] p-2 rounded-sm border border-[#1a1a1a]">
                  <span className="uppercase font-bold tracking-widest">
                    Focus:
                  </span>
                  <span className="text-right text-gray-300 w-2/3 leading-tight truncate">
                    {agent.focus}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* AI THINKING PANEL (Right Col) */}
        <div className="col-span-1 xl:col-span-8 flex flex-col">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden flex-1 shadow-2xl flex flex-col h-[400px]">
            {/* Dynamic background based on selected agent */}
            <div
              className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none opacity-10 transition-colors duration-1000"
              style={{ backgroundColor: selectedAgent.color }}
            ></div>

            <div className="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4 sticky z-10">
              <h3 className="text-gray-300 font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                <Eye
                  className="w-5 h-5 text-current"
                  style={{ color: selectedAgent.color }}
                />
                Internal Reasoning — {selectedAgent.name}
              </h3>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Confidence</span>
                  <AIConfidenceRing
                    confidence={selectedAgent.confidence}
                    size={44}
                    theme={
                      selectedAgent.color === "#00f0ff"
                        ? "cyan"
                        : selectedAgent.color === "#a855f7"
                          ? "purple"
                          : selectedAgent.color === "#facc15"
                            ? "amber"
                            : "green"
                    }
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Uncertainty</span>
                  <div className="w-10 h-10 rounded-full border border-[#ff4500]/30 bg-[#ff4500]/5 flex items-center justify-center relative">
                     <div className="absolute inset-0 rounded-full bg-[#ff4500]/10 animate-pulse"></div>
                     <span className="text-xs font-bold text-[#ff4500]">{(100 - selectedAgent.confidence + Math.random() * 5).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning Stream Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-xs space-y-4 pr-4 mb-4">
              {/* Simulated Reasoning Blocks based on agent */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`${selectedAgent.id}-block1`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border-l-2 pl-4 py-1"
                  style={{ borderLeftColor: "#333" }}
                >
                  <div className="text-[10px] text-gray-500 mb-1">
                    00:00.012
                  </div>
                  <div className="text-gray-300">
                    {selectedAgent.id === "Director" &&
                      "Synthesizing inputs from Quant-v4 and Risk-Guardian... Market regime identified as Mean-Reverting. Volatility contraction detected."}
                    {selectedAgent.id === "Quant-v4" &&
                      "Scanning order books across Binance, Bybit, Coinbase. High frequency iceberg orders detected at $64,150."}
                    {selectedAgent.id === "Risk-Guardian" &&
                      "Calculating global drawdown exposure. Current portfolio VAR (Value at Risk) is 0.8%. Within acceptable limits."}
                    {selectedAgent.id === "Alpha-Seeker" &&
                      "Awaiting prime entry condition. Limit targets staging..."}
                  </div>
                </motion.div>

                <motion.div
                  key={`${selectedAgent.id}-block2`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-l-2 pl-4 py-1 mt-4"
                  style={{ borderLeftColor: "#333" }}
                >
                  <div className="text-[10px] text-gray-500 mb-1">
                    00:00.045
                  </div>
                  <div className="text-gray-300">
                    {selectedAgent.id === "Director" &&
                      "Divergence identified between Spot volume and Perps open interest. Probability of fakeout: High. Directing Alpha-Seeker to hold execution."}
                    {selectedAgent.id === "Quant-v4" &&
                      "Generating probability matrix for next 15-minute candle. 68% chance of downward sweep. Feeding to Master Director."}
                    {selectedAgent.id === "Risk-Guardian" &&
                      "Simulating stress test for $2,000 flash crash. Liquidation distance is safe. Margin requirement optimal."}
                    {selectedAgent.id === "Alpha-Seeker" &&
                      "Adjusting entry bids to match Quant-v4 sweep prediction. New bids placed down to $63,800."}
                  </div>
                </motion.div>

                <motion.div
                  key={`${selectedAgent.id}-block3`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-l-2 pl-4 py-2 mt-4 bg-[#111]/50 border border-[#222]"
                  style={{ borderLeftColor: selectedAgent.color }}
                >
                  <div className="text-[10px] flex items-center gap-2 mb-1">
                    <Command
                      className="w-3 h-3"
                      style={{ color: selectedAgent.color }}
                    />
                    <span style={{ color: selectedAgent.color }}>
                      OUTPUT CONCLUSION
                    </span>
                  </div>
                  <div className="text-white font-bold tracking-wide">
                    {selectedAgent.id === "Director" &&
                      "RESOLUTION: DELAY LONG. Await downward liquidation sweep and reassess."}
                    {selectedAgent.id === "Quant-v4" &&
                      `SIGNAL VERIFIED: Bearish trap forming. Confidence: ${selectedAgent.confidence}%.`}
                    {selectedAgent.id === "Risk-Guardian" &&
                      "CLEARANCE GRANTED: All risk parameters green for execution when prompted."}
                    {selectedAgent.id === "Alpha-Seeker" &&
                      "ORDERS RESTING: Sniper bounds configured."}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="pt-4 border-t border-[#1a1a1a] flex justify-between items-center relative z-10 shrink-0">
               <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
                 Agent Active
               </div>
               <button className="flex items-center gap-2 bg-[#ff4500]/10 hover:bg-[#ff4500]/20 text-[#ff4500] border border-[#ff4500]/30 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(255,69,0,0.1)]">
                  <ShieldAlert className="w-3 h-3" />
                  Manual Override
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: DECISION FLOW TIMELINE */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative">
        <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-[#1a1a1a] pb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          Agent Decision Pipeline (Last 60s)
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent pt-4">
          {/* Timeline Item 1 - Newest */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#ff4500]/20 text-[#ff4500] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(255,69,0,0.5)]">
              <ShieldAlert className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-gray-200 text-sm">
                  Trade Rejected
                </div>
                <time className="text-[10px] text-[#ff4500]">Just now</time>
              </div>
              <div className="text-gray-500 text-xs">
                Director blocked execution as market conditions no longer
                support the original thesis.
              </div>
            </div>
          </div>

          {/* Timeline Item 2 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#00f0ff]/20 text-[#00f0ff] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <GitMerge className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-gray-200 text-sm flex flex-row-reverse md:flex-row">
                  Strategy Switched
                </div>
                <time className="text-[10px] text-gray-600">3s ago</time>
              </div>
              <div className="text-gray-500 text-xs text-right md:text-left">
                Quant-v4 shifted to defensive mode, adapting local parameters to
                defend capital against sudden breakout.
              </div>
            </div>
          </div>

          {/* Timeline Item 3 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#facc15]/20 text-[#facc15] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              <AlertTriangle className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-gray-200 text-sm">
                  Risk Agent Warning Triggered
                </div>
                <time className="text-[10px] text-gray-600">12s ago</time>
              </div>
              <div className="text-gray-500 text-xs">
                Risk Guardian flagged immediate drawdown risk due to market
                instability. Margin requirements dynamically increased.
              </div>
            </div>
          </div>

          {/* Timeline Item 4 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#a855f7]/20 text-[#a855f7] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              <Activity className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-gray-200 text-sm flex flex-row-reverse md:flex-row">
                  Volatility Increased
                </div>
                <time className="text-[10px] text-gray-600">22s ago</time>
              </div>
              <div className="text-gray-500 text-xs text-right md:text-left">
                Quant Engine detected sudden volatility expansion across major
                pairs. Order book spread widening.
              </div>
            </div>
          </div>

          {/* Timeline Item 5 - Oldest */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-blue-500/20 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <Network className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-gray-200 text-sm">
                  News Spike Detected
                </div>
                <time className="text-[10px] text-gray-600">45s ago</time>
              </div>
              <div className="text-gray-500 text-xs">
                NLP algorithms registered high-impact macroeconomic alert from
                tier-1 financial sources.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
