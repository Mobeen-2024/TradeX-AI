import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TestTube,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BarChart2,
  Activity,
  Database,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  GitBranch,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

const performanceData = [
  { day: "Day 1", pnl: 0, btc: 0 },
  { day: "Day 2", pnl: 2.4, btc: -1.2 },
  { day: "Day 3", pnl: 1.8, btc: -2.5 },
  { day: "Day 4", pnl: 4.5, btc: 0.5 },
  { day: "Day 5", pnl: 3.2, btc: -1.0 },
  { day: "Day 6", pnl: 6.8, btc: 2.4 },
  { day: "Day 7", pnl: 5.1, btc: 1.8, failure: true },
  { day: "Day 8", pnl: 8.4, btc: 4.2 },
  { day: "Day 9", pnl: 11.2, btc: 6.5 },
  { day: "Day 10", pnl: 10.5, btc: 5.8 },
  { day: "Day 11", pnl: 14.8, btc: 7.2 },
  { day: "Day 12", pnl: 18.5, btc: 9.5 },
  { day: "Day 13", pnl: 15.2, btc: 8.1, failure: true },
  { day: "Day 14", pnl: 20.1, btc: 11.2 },
];

const decisionLog = [
  {
    time: "Day 5, 14:30",
    agent: "Quant-v4",
    action: "Signal Generated",
    detail: "Pattern recognized: Inverse H&S on BTC 4h.",
    type: "info",
  },
  {
    time: "Day 5, 14:31",
    agent: "Risk-Guardian",
    action: "Approved",
    detail: "Risk limit OK. Adjusting size to 1.5x.",
    type: "success",
  },
  {
    time: "Day 6, 09:15",
    agent: "Alpha-Seeker",
    action: "Take Profit Hit",
    detail: "Closed 50% position at target 1.",
    type: "success",
  },
  {
    time: "Day 7, 11:20",
    agent: "Master Director",
    action: "Strategy Override",
    detail: "Macro event detected. Halting execution.",
    type: "warning",
  },
  {
    time: "Day 7, 11:22",
    agent: "System",
    action: "FAILURE POINT",
    detail: "Slippage exceeded limit during rapid dump.",
    type: "error",
  },
];

export function SimulationEngineTab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      <div className="flex justify-between items-end mb-4 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <TestTube className="w-8 h-8 text-[#ff00f0]" />
            Simulation Engine
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            Historical Backtesting & Strategy Replay
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Active Model
            </span>
            <span className="text-white text-xs font-bold uppercase">
              Mean-Reversion v2.4
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#050505] border border-[#222] p-1 rounded-sm">
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#111] transition-colors rounded">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded transition-colors ${isPlaying ? "bg-[#ff00f0]/20 text-[#ff00f0]" : "text-gray-400 hover:text-white hover:bg-[#111]"}`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#111] transition-colors rounded">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-2">
        {/* Performance Summary */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
            Total Simulated Return
          </h3>
          <div className="text-4xl font-bold text-[#39ff14] font-sans tracking-tight mb-2">
            +20.1%
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-white flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#39ff14]" /> Win Rate:
              68%
            </span>
            <span className="text-gray-500">
              vs BTC <span className="text-white font-sans">+8.9%</span>
            </span>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
            Max Drawdown
          </h3>
          <div className="text-3xl font-bold text-[#ff4500] font-sans tracking-tight mb-2">
            -4.2%
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-gray-400">
              Recovery Time: <span className="text-white">12 Hours</span>
            </span>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
            Sharpe Ratio
          </h3>
          <div className="text-3xl font-bold text-white font-sans tracking-tight mb-2">
            2.45
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-gray-400">
              Sortino: <span className="text-white">3.12</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-[400px]">
        {/* Chart Area */}
        <div className="col-span-1 xl:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-4 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-white" />
              Profit Curve vs Benchmark
            </h3>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
              <span className="flex items-center gap-1.5 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#ff00f0]"></div>
                Strategy PNL
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>Benchmark
                BTC
              </span>
            </div>
          </div>

          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff00f0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff00f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#111"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#444"
                  tick={{ fill: "#666", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#444"
                  tick={{ fill: "#888", fontSize: 10 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#1a1a1a",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  name="Strategy"
                  stroke="#ff00f0"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                />
                <Area
                  type="monotone"
                  dataKey="btc"
                  name="BTC"
                  stroke="#333"
                  strokeWidth={2}
                  fill="none"
                />
                {performanceData.map(
                  (entry, index) =>
                    entry.failure && (
                      <ReferenceDot
                        key={index}
                        x={entry.day}
                        y={entry.pnl}
                        r={6}
                        fill="#ff4500"
                        stroke="#000"
                        strokeWidth={2}
                      />
                    ),
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline Replay Bar */}
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
            <div
              className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold hover:text-white transition-colors cursor-pointer"
              onClick={() => setProgress((prev) => (prev + 10) % 100)}
            >
              <span>Start: Jan 01</span>
              <span>End: Jan 14</span>
            </div>
            <div className="h-2 bg-[#111] rounded-full overflow-hidden border border-[#222] relative group">
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#333] transition-all duration-300 pointer-events-none"
                style={{ width: "100%" }}
              ></div>
              <div
                className="h-full bg-[#ff00f0] transition-all duration-300 relative z-10"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#ff00f0] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 cursor-pointer pointer-events-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Decision Playback */}
        <div className="col-span-1 xl:col-span-4 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]/50">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              Agent Decision Log
            </h3>
            <span className="px-2 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] rounded text-[9px] uppercase tracking-widest border border-[#00f0ff]/20">
              Live Replay
            </span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
            {decisionLog.map((log, i) => (
              <div
                key={i}
                className={`p-3 rounded border text-sm flex gap-3 ${
                  log.type === "error"
                    ? "bg-[#ff4500]/5 border-[#ff4500]/30"
                    : log.type === "warning"
                      ? "bg-[#facc15]/5 border-[#facc15]/30"
                      : log.type === "success"
                        ? "bg-[#39ff14]/5 border-[#39ff14]/20"
                        : "bg-[#111] border-[#222]"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {log.type === "error" ? (
                    <AlertTriangle className="w-4 h-4 text-[#ff4500]" />
                  ) : log.type === "warning" ? (
                    <ShieldAlert className="w-4 h-4 text-[#facc15]" />
                  ) : log.type === "success" ? (
                    <Activity className="w-4 h-4 text-[#39ff14]" />
                  ) : (
                    <Cpu className="w-4 h-4 text-[#00f0ff]" />
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1 text-xs text-mono">
                    <span
                      className={`font-bold ${
                        log.type === "error"
                          ? "text-[#ff4500]"
                          : log.type === "warning"
                            ? "text-[#facc15]"
                            : log.type === "success"
                              ? "text-[#39ff14]"
                              : "text-gray-300"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    {log.detail}
                  </p>
                  <div className="mt-2 text-[10px] uppercase tracking-widest text-gray-600 font-bold bg-black/20 px-1.5 py-0.5 rounded border border-white/5 inline-block">
                    Source: {log.agent}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Fade out bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </motion.div>
  );
}
