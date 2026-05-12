import React from "react";
import { motion } from "motion/react";
import {
  Brain,
  Activity,
  Zap,
  TrendingUp,
  ShieldAlert,
  Cpu,
  BarChart2,
  Briefcase,
  List,
  PlayCircle,
} from "lucide-react";
import { AIConfidenceRing } from "../ui/AIConfidenceRing";

export function DashboardTab() {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      {/* Top Banner: AI STATUS + MARKET OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 hover:border-[#333]">
        {/* AI Status Card (spanning 4 cols) */}
        <div className="lg:col-span-4 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/10 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#0ea5e9]" />
              Nexus Core Status
            </h3>
            <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#0ea5e9]/20">
              Autonomous Mode
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase mb-2">
                Confidence
              </span>
              <div className="flex items-center gap-3">
                <AIConfidenceRing confidence={87.4} size={48} theme="cyan" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase">
                Regime
              </span>
              <span className="text-sm text-gray-200 font-sans font-bold">
                Volatile Bull
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase">
                Active Strategy
              </span>
              <span className="text-sm text-[#00f0ff] font-sans font-bold">
                Momentum L2
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase">
                Risk Protocol
              </span>
              <span className="text-sm text-[#facc15] font-sans font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Level 2: Scaled
              </span>
            </div>
          </div>
        </div>

        {/* Market Overview (spanning 8 cols) */}
        <div className="lg:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col justify-between">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-white" />
            Global Market Synthesis
          </h3>

          <div className="grid grid-cols-4 gap-4 flex-1 items-end">
            {[
              {
                pair: "BTC/USDT",
                price: "64,320.50",
                change: "+2.4%",
                up: true,
                rsi: "68",
              },
              {
                pair: "ETH/USDT",
                price: "3,450.20",
                change: "+1.8%",
                up: true,
                rsi: "62",
              },
              {
                pair: "SOL/USDT",
                price: "142.75",
                change: "-0.5%",
                up: false,
                rsi: "45",
              },
              {
                pair: "TOTAL CAP",
                price: "$2.4T",
                change: "+1.2%",
                up: true,
                flex: true,
              },
            ].map((market, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm"
              >
                <span className="text-gray-400 text-[10px] font-bold">
                  {market.pair}
                </span>
                <span className="text-white font-sans font-bold text-lg">
                  {market.price}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-[10px] font-bold ${market.up ? "text-[#39ff14]" : "text-[#ff4500]"}`}
                  >
                    {market.change}
                  </span>
                  {market.rsi && (
                    <span className="text-[9px] text-gray-600">
                      RSI: {market.rsi}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: PORTFOLIO | LIVE CHART | AI PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[350px]">
        {/* Portfolio (1 col) */}
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col justify-between">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#a855f7]" />
            Portfolio State
          </h3>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Balance
            </span>
            <span className="text-3xl text-white font-sans font-bold tracking-tight">
              $1,240,500.00
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#39ff14] text-xs font-bold">
                +12,450.00 (Today)
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Daily PNL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 items-end pb-2">
            <div className="flex flex-col gap-1 border-t border-[#1a1a1a] pt-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Exposure
              </span>
              <span className="text-sm font-bold text-gray-200">
                65% ($806K)
              </span>
            </div>
            <div className="flex flex-col gap-1 border-t border-[#1a1a1a] pt-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Leverage
              </span>
              <span className="text-sm font-bold text-[#0ea5e9]">1.5x</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 border-t border-[#1a1a1a] pt-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Max Drawdown
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#ff4500] w-10">
                  4.2%
                </span>
                <div className="flex-1 h-1 bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff4500] w-[4.2%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chart (2 col) */}
        <div className="lg:col-span-2 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-white" />
              Alpha Signal Tracker
            </h3>
            <div className="flex gap-2">
              {["1m", "5m", "15m"].map((t) => (
                <button
                  key={t}
                  className={`px-2 py-0.5 text-[10px] border border-[#222] rounded-sm ${t === "5m" ? "bg-[#111] text-white" : "text-gray-500 hover:text-white transition-colors"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-[#0a0a0a] border border-[#111] rounded-sm relative flex items-end px-2 pb-2">
            {/* Extremely fake bar chart */}
            <div className="w-full h-full flex items-end justify-between gap-1 opacity-50 relative mt-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm ${Math.random() > 0.4 ? "bg-[#39ff14]" : "bg-[#ff4500]"}`}
                  style={{ height: `${Math.max(10, Math.random() * 100)}%` }}
                ></div>
              ))}
              {/* Overlay curve */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 300 Q 250 200 500 250 T 1000 150"
                  stroke="#00f0ff"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* AI Panel (1 col) */}
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-[#ff00f0]" />
            Active Neural Layers
          </h3>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#ff00f0]/10 flex items-center justify-center border border-[#ff00f0]/20">
                <Zap className="w-4 h-4 text-[#ff00f0]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">
                  Sentiment Core
                </span>
                <span className="text-[9px] text-[#39ff14] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] opacity-80"></span>{" "}
                  Analyzing News
                </span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#a855f7]/10 flex items-center justify-center border border-[#a855f7]/20">
                <TrendingUp className="w-4 h-4 text-[#a855f7]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">
                  Price Action LSTM
                </span>
                <span className="text-[9px] text-[#39ff14] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] opacity-80"></span>{" "}
                  Forward Prop
                </span>
              </div>
            </div>

            <div className="mt-auto px-2 py-1 bg-black border border-[#222] rounded-sm text-[9px] text-gray-500 font-mono text-center">
              Model Checkpoint: 2m ago
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: ACTIVE TRADES | AGENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Active Trades */}
        <div className="lg:col-span-2 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-4 border-b border-[#1a1a1a] pb-3">
            <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <List className="w-4 h-4 text-white" />
              Active Open Positions
            </h3>
            <span className="text-[9px] text-gray-600 bg-[#111] px-2 py-0.5 rounded-sm">
              2 Positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#020202] text-[9px] uppercase tracking-widest text-gray-500">
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a]">
                    Pair
                  </th>
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a]">
                    Side
                  </th>
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a]">
                    Size
                  </th>
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a]">
                    Entry
                  </th>
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a]">
                    Mark Price
                  </th>
                  <th className="px-3 py-2 font-semibold border-b border-[#1a1a1a] text-right">
                    Unrealized PNL
                  </th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-[#111]">
                <tr className="hover:bg-[#0a0a0a] transition-colors group cursor-pointer">
                  <td className="px-3 py-2.5 font-bold font-sans text-gray-200">
                    BTC/USDT
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[#39ff14] font-bold">LONG</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">12.5</td>
                  <td className="px-3 py-2.5 text-gray-400">63,100</td>
                  <td className="px-3 py-2.5 text-gray-300">64,320</td>
                  <td className="px-3 py-2.5 font-bold text-right text-[#39ff14]">
                    +$15,250.00
                  </td>
                </tr>
                <tr className="hover:bg-[#0a0a0a] transition-colors group cursor-pointer">
                  <td className="px-3 py-2.5 font-bold font-sans text-gray-200">
                    SOL/USDT
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[#ff4500] font-bold">SHORT</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">850</td>
                  <td className="px-3 py-2.5 text-gray-400">145.2</td>
                  <td className="px-3 py-2.5 text-gray-300">142.75</td>
                  <td className="px-3 py-2.5 font-bold text-right text-[#39ff14]">
                    +$2,082.50
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Activity Feed */}
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col flex-1 h-[200px] overflow-hidden">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 border-b border-[#1a1a1a] pb-3">
            <PlayCircle className="w-4 h-4 text-gray-500" />
            Agent Decisions Feed
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 no-scrollbar">
            {[
              {
                time: "14:24",
                agent: "Risk Agent",
                msg: "Reduced ETH exposure due to volatility increase.",
                lvl: "warn",
              },
              {
                time: "14:20",
                agent: "Strategy Agent",
                msg: "Switched from momentum to mean reversion.",
                lvl: "info",
              },
              {
                time: "14:15",
                agent: "Memory Agent",
                msg: "Detected historical similarity with March crash pattern.",
                lvl: "warn",
              },
              {
                time: "14:02",
                agent: "Execution",
                msg: "Order filled: SELL 850 SOL @ 145.2",
                lvl: "success",
              },
              {
                time: "13:58",
                agent: "System",
                msg: "Rebalancing internal weights.",
                lvl: "info",
              },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 text-[10px]">
                <span className="text-gray-600 shrink-0">{log.time}</span>
                <div className="flex flex-col">
                  <span
                    className={`font-bold ${log.lvl === "success" ? "text-[#39ff14]" : log.lvl === "warn" ? "text-[#facc15]" : "text-[#0ea5e9]"}`}
                  >
                    [{log.agent}]
                  </span>
                  <span className="text-gray-400 leading-tight mt-0.5">
                    {log.msg}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
