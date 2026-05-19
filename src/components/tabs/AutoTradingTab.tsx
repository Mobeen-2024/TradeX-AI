import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  AlertTriangle,
  Power,
  Cpu,
  Shield,
  BrainCircuit,
  Play,
} from "lucide-react";

export function AutoTradingTab() {
  const [osMode, setOsMode] = useState<
    "Manual" | "Assisted" | "Semi-Auto" | "Autonomous"
  >("Autonomous");

  const modes = [
    {
      id: "Manual",
      icon: <Shield className="w-4 h-4" />,
      desc: "User Executed",
    },
    {
      id: "Assisted",
      icon: <BrainCircuit className="w-4 h-4" />,
      desc: "AI Recommends",
    },
    {
      id: "Semi-Auto",
      icon: <Play className="w-4 h-4" />,
      desc: "1-Click Approve",
    },
    {
      id: "Autonomous",
      icon: <Cpu className="w-4 h-4" />,
      desc: "Zero Intervention",
    },
  ] as const;

  return (
    <motion.div
      key="auto-trading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-sans"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#facc15]" />
            System Intelligence
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">
            Global Execution Protocol
          </p>
        </div>

        <div className="bg-[#050505] p-2 rounded-sm flex items-center gap-4 border border-[#222]">
          <div className="flex flex-col items-end border-r border-[#1a1a1a] pr-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Global Status
            </span>
            <span className="text-[#39ff14] font-mono font-bold uppercase">
              {osMode} MODE
            </span>
          </div>
          <button className="flex items-center gap-2 bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 border border-[#ff4500]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
            <Power className="w-3.5 h-3.5" />
            Emergency Halt
          </button>
        </div>
      </div>

      {/* Autonomous Mode Selector */}
      <div className="mb-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        {osMode === "Autonomous" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent animate-[shimmer_2s_infinite]"></div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Cpu
              className={`w-5 h-5 ${osMode === "Autonomous" ? "text-[#00f0ff]" : "text-gray-500"}`}
            />
            Operating Protocol
          </h2>
          <span className="bg-[#111] border border-[#222] px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
            Core Thread:{" "}
            {osMode === "Autonomous" ? "LOCKED" : "AWAITING USER OPT"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {modes.map((mode) => {
            const isActive = osMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setOsMode(mode.id)}
                className={`flex flex-col items-center justify-center p-4 rounded border transition-all ${isActive
                    ? mode.id === "Autonomous"
                      ? "bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "bg-white/5 border-white text-white"
                    : "bg-[#0a0a0a] border-[#222] text-gray-500 hover:border-[#444] hover:text-gray-300"
                  }`}
              >
                <div
                  className={`mb-3 ${isActive ? (mode.id === "Autonomous" ? "text-[#00f0ff]" : "text-white") : "text-gray-600"}`}
                >
                  {mode.icon}
                </div>
                <div
                  className={`text-sm font-bold uppercase tracking-widest mb-1 ${isActive ? (mode.id === "Autonomous" ? "text-[#00f0ff]" : "text-white") : "text-gray-500"}`}
                >
                  {mode.id}
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-opacity-70">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Consensus Engine Visualization */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#a855f7]/5 rounded-full blur-[80px] pointer-events-none transition-colors"></div>
        <div className="col-span-1 border-b lg:border-b-0 lg:border-r border-[#1a1a1a] pb-6 lg:pb-0 lg:pr-6 flex flex-col justify-center">
          <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#a855f7]" />
            Consensus Engine
          </h3>
          <h2 className="text-xl font-bold text-white font-sans tracking-tight mb-2">
            Live Analysis
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Multiple agents voting on current BTC/USDT technicals and
            order-flow.
          </p>
        </div>

        <div className="col-span-1 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 w-full">
          {/* Market Agent */}
          <div className="w-full flex-1 bg-[#111] border border-[#222] rounded p-4 flex flex-col items-center justify-center relative group">
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent"></div>
            <Activity className="w-5 h-5 text-[#39ff14] mb-2" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 text-center">
              Market Agent
            </span>
            <span className="bg-[#39ff14]/10 text-[#39ff14] px-3 py-1 rounded border border-[#39ff14]/20 text-xs font-bold uppercase tracking-widest text-center">
              BUY
            </span>
          </div>

          {/* Plus */}
          <div className="text-gray-600 font-bold hidden md:block">+</div>
          <div className="text-gray-600 font-bold md:hidden">+</div>

          {/* Risk Agent */}
          <div className="w-full flex-1 bg-[#111] border border-[#222] rounded p-4 flex flex-col items-center justify-center relative">
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
            <Shield className="w-5 h-5 text-[#facc15] mb-2" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 text-center">
              Risk Agent
            </span>
            <span className="bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded border border-[#facc15]/20 text-xs font-bold uppercase tracking-widest text-center">
              HOLD
            </span>
          </div>

          {/* Plus */}
          <div className="text-gray-600 font-bold hidden md:block">+</div>
          <div className="text-gray-600 font-bold md:hidden">+</div>

          {/* Sentiment Agent */}
          <div className="w-full flex-1 bg-[#111] border border-[#222] rounded p-4 flex flex-col items-center justify-center relative">
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent"></div>
            <Zap className="w-5 h-5 text-[#39ff14] mb-2" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 text-center">
              Sentiment Agent
            </span>
            <span className="bg-[#39ff14]/10 text-[#39ff14] px-3 py-1 rounded border border-[#39ff14]/20 text-xs font-bold uppercase tracking-widest text-center">
              BUY
            </span>
          </div>

          {/* Equals */}
          <div className="text-gray-600 font-bold hidden md:block">=</div>
          <div className="text-gray-600 font-bold md:hidden">=</div>

          {/* Final Consensus */}
          <div className="w-full flex-[1.5] bg-[#111] border border-[#a855f7]/50 rounded p-4 flex flex-col items-center justify-center relative shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent"></div>
            <BrainCircuit className="w-6 h-6 text-[#a855f7] mb-2" />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 text-center">
              Final Consensus
            </span>
            <span className="bg-[#a855f7]/10 text-[#a855f7] px-3 py-1.5 rounded border border-[#a855f7]/30 text-xs font-bold uppercase tracking-widest text-center whitespace-nowrap">
              MODERATE BUY
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Active Strategies List */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
          {/* Strategy Card 1 */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#39ff14]/10 transition-colors"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-sm bg-[#39ff14]/10 flex items-center justify-center border border-[#39ff14]/20 shadow-none">
                  <Activity className="w-5 h-5 text-[#39ff14]" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">
                    High-Frequency Scalper
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] opacity-80"></span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Running • BTC/USDT
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-mono font-bold text-[#39ff14] flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  14.2%
                </span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                  Win Rate 68%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#1a1a1a] pt-4 mt-2">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">
                  Exposure
                </span>
                <span className="font-mono text-gray-200 text-sm">$45,000</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">
                  Last Trade
                </span>
                <span className="font-mono text-gray-400 text-sm">2m ago</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                  Manage <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Strategy Card 2 */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition-colors group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-sm bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/20 shadow-none">
                  <BarChart3 className="w-5 h-5 text-[#0ea5e9]" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">
                    Macro Swing Arb
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] opacity-80"></span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Running • ETH/SOL
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-mono font-bold text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  1.1%
                </span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                  Win Rate 82%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#1a1a1a] pt-4 mt-2">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">
                  Exposure
                </span>
                <span className="font-mono text-gray-200 text-sm">
                  $120,500
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">
                  Last Trade
                </span>
                <span className="font-mono text-gray-400 text-sm">4h ago</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                  Manage <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Risk & Quick Info */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 border-l-[3px] border-l-[#facc15] shadow-none">
            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#facc15]" />
              Risk Perimeter
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Total Margin Used</span>
                  <span className="font-mono text-[#facc15]">42%</span>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#facc15] h-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Max Open Drawdown</span>
                  <span className="font-mono text-gray-400">0.8%</span>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gray-500 h-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>

            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00f0ff]" />
              Recent Autonomous Actions
            </h3>

            <div className="space-y-3 relative z-10 flex flex-col h-[200px] overflow-y-auto no-scrollbar font-mono text-[10px]">
              <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                <span className="text-[#39ff14]">BUY BTC 0.5 @ MKT</span>
                <span className="text-gray-500">10:42:01</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                <span className="text-gray-400">Cancel H-ID: x992</span>
                <span className="text-gray-500">10:39:14</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                <span className="text-[#ff4500]">SELL ETH 14 @ LMT</span>
                <span className="text-gray-500">10:35:42</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                <span className="text-gray-400">Risk Adj: Stop -&gt; $61k</span>
                <span className="text-gray-500">10:35:01</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
