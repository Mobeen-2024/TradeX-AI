import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Settings2,
  Zap,
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
  const [viewMode, setViewMode] = useState<"replay" | "compare">("compare");
  
  const [showConfig, setShowConfig] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const [dateStart, setDateStart] = useState("2024-01-01");
  const [dateEnd, setDateEnd] = useState("2024-01-14");
  const [startingCapital, setStartingCapital] = useState("10000");
  const [leverage, setLeverage] = useState("1x");
  const [executionFee, setExecutionFee] = useState("0.02");
  
  const [realPerformanceData, setRealPerformanceData] = useState(performanceData);
  const [realDecisionLog, setRealDecisionLog] = useState(decisionLog);
  const [realStats, setRealStats] = useState({
      totalReturn: 20.1,
      sharpe: 2.45,
      maxDrawdown: 4.2,
      winRate: 68,
      totalTrades: 35
  });

  const runBacktest = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(10);
    
    try {
        const res = await fetch("/api/intelligence/backtest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                symbol: "BTCUSDT",
                limit: 30,
                startingCapital: parseFloat(startingCapital) || 10000
            })
        });
        
        if (res.ok) {
            const result = await res.json();
            const { history, stats } = result.data;
            if (history && history.length > 0) {
               setRealPerformanceData(history);
               setRealDecisionLog(history.filter((h: any) => h.action !== "NO ACTION"));
               setRealStats(stats);
            }
        }
    } catch (e) {
        console.error("Backtest failed", e);
    } finally {
        setOptimizationProgress(100);
        setTimeout(() => setIsOptimizing(false), 500);
    }
  };

  const strategyA = {
    name: "Mean-Reversion v2.4",
    sharpe: 2.45,
    drawdown: "-4.2%",
    winRate: "68%",
    adaptability: 88,
    color: "#ff00f0",
  };

  const strategyB = {
    name: "Trend Following Deep-Q",
    sharpe: 3.12,
    drawdown: "-6.8%",
    winRate: "54%",
    adaptability: 95,
    color: "#00f0ff",
  };

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
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded border transition-colors ${
              showConfig
                ? "bg-[#ff00f0]/20 border-[#ff00f0]/30 text-[#ff00f0]"
                : "bg-[#050505] border-[#222] text-gray-400 hover:text-white"
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <div className="flex rounded-sm border border-[#222] bg-[#050505] p-1">
            <button
              onClick={() => setViewMode("replay")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                viewMode === "replay"
                  ? "bg-[#111] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Replay
            </button>
            <button
              onClick={() => setViewMode("compare")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                viewMode === "compare"
                  ? "bg-[#111] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#050505] border border-[#1a1a1a] rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" /> Backtest Parameters
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-xs text-white outline-none focus:border-[#ff00f0]/50"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-xs text-white outline-none focus:border-[#ff00f0]/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Starting Capital (USD)</label>
                  <input
                    type="number"
                    value={startingCapital}
                    onChange={(e) => setStartingCapital(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-xs text-white outline-none focus:border-[#ff00f0]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Leverage</label>
                  <select
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-xs text-white outline-none focus:border-[#ff00f0]/50 appearance-none"
                  >
                    <option value="1x">1x (Spot)</option>
                    <option value="2x">2x</option>
                    <option value="5x">5x</option>
                    <option value="10x">10x</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Execution Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={executionFee}
                    onChange={(e) => setExecutionFee(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-xs text-white outline-none focus:border-[#ff00f0]/50"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-[#1a1a1a] flex justify-between items-center">
                <div className="flex-1 max-w-md">
                  {isOptimizing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[#ff00f0] font-bold uppercase tracking-widest">
                        <span>Optimizing parameters...</span>
                        <span>{Math.floor(optimizationProgress)}%</span>
                      </div>
                      <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ff00f0] transition-all duration-200"
                          style={{ width: `${optimizationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={runBacktest}
                      className="flex items-center gap-2 px-4 py-2 bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/30 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#ff00f0]/20 transition-colors"
                    >
                      <Zap className="w-4 h-4" /> Run Backtest Engine
                    </button>
                  )}
                </div>
                <button
                  className="px-6 py-2 bg-white text-black rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Apply & Reload
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "replay" ? (
        <>
          <div className="flex justify-end gap-4 items-center absolute right-8 top-[140px] z-10">
            <div className="flex flex-col items-end mr-4">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4 mb-2">
            {/* Performance Summary */}
            <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
                Total Simulated Return
              </h3>
              <div className={`text-4xl font-bold font-sans tracking-tight mb-2 ${realStats.totalReturn >= 0 ? "text-[#39ff14]" : "text-[#ff4500]"}`}>
                {realStats.totalReturn >= 0 ? "+" : ""}{realStats.totalReturn.toFixed(2)}%
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-white flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#39ff14]" /> Win
                  Rate: {realStats.winRate.toFixed(1)}% ({realStats.totalTrades} Trades)
                </span>
                <span className="text-gray-500">
                  vs BTC <span className="text-white font-sans">{realPerformanceData.length > 0 ? (realPerformanceData[realPerformanceData.length - 1].btc > 0 ? "+" : "") + realPerformanceData[realPerformanceData.length - 1].btc.toFixed(2) + "%" : "+0.0%"}</span>
                </span>
              </div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
                Max Drawdown
              </h3>
              <div className="text-3xl font-bold text-[#ff4500] font-sans tracking-tight mb-2">
                -{realStats.maxDrawdown.toFixed(2)}%
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-400">
                  Recovery Time: <span className="text-white">-- Hours</span>
                </span>
              </div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded p-5 flex flex-col justify-center">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">
                Sharpe Ratio
              </h3>
              <div className="text-3xl font-bold text-white font-sans tracking-tight mb-2">
                {realStats.sharpe.toFixed(2)}
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-400">
                  Sortino: <span className="text-white">{(realStats.sharpe * 1.3).toFixed(2)}</span>
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
                    <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                    Benchmark BTC
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={realPerformanceData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#ff00f0"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ff00f0"
                          stopOpacity={0}
                        />
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
                {realDecisionLog.map((log: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded border text-sm flex gap-3 ${
                      log.decision === "SELL"
                        ? "bg-[#ff4500]/5 border-[#ff4500]/30"
                        : log.decision === "BUY"
                            ? "bg-[#39ff14]/5 border-[#39ff14]/20"
                            : "bg-[#111] border-[#222]"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {log.decision === "SELL" ? (
                        <AlertTriangle className="w-4 h-4 text-[#ff4500]" />
                      ) : log.decision === "BUY" ? (
                        <Activity className="w-4 h-4 text-[#39ff14]" />
                      ) : (
                        <Cpu className="w-4 h-4 text-[#00f0ff]" />
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1 text-xs text-mono">
                        <span
                          className={`font-bold ${
                            log.decision === "SELL"
                              ? "text-[#ff4500]"
                              : log.decision === "BUY"
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
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:px-4 flex-1">
          {/* Strategy A */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded flex flex-col relative overflow-hidden group hover:border-[#ff00f0]/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00f0]"></div>
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-start">
              <div>
                <div className="text-[10px] text-[#ff00f0] font-bold uppercase tracking-widest mb-1">
                  Strategy A
                </div>
                <h2 className="text-xl font-bold text-white font-sans">
                  {strategyA.name}
                </h2>
              </div>
              <div className="w-8 h-8 rounded bg-[#111] border border-[#222] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#ff00f0] shadow-[0_0_8px_#ff00f0]"></div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Sharpe Ratio</span>
                    <span className="text-white">{strategyA.sharpe}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#ff00f0]"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Max Drawdown</span>
                    <span className="text-[#ff4500]">{strategyA.drawdown}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#ff4500]"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Win Rate</span>
                    <span className="text-[#39ff14]">{strategyA.winRate}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#39ff14]"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Adaptability Score</span>
                    <span className="text-[#00f0ff]">
                      {strategyA.adaptability}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden relative">
                    <div
                      className="h-full bg-[#00f0ff]"
                      style={{ width: "88%" }}
                    ></div>
                    {/* Scanner effect line for "tech/AI" feel */}
                    <div className="absolute top-0 bottom-0 w-4 bg-white/50 blur-[2px] -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0a0a0a] border-t border-[#1a1a1a] flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
              <span>Selected For Replay</span>
              <button className="px-4 py-1.5 bg-[#ff00f0]/10 text-[#ff00f0] border border-[#ff00f0]/30 rounded hover:bg-[#ff00f0]/20 transition-colors">
                Set Active
              </button>
            </div>
          </div>

          {/* Strategy B */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded flex flex-col relative overflow-hidden group hover:border-[#00f0ff]/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00f0ff]"></div>
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-start">
              <div>
                <div className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-widest mb-1">
                  Strategy B
                </div>
                <h2 className="text-xl font-bold text-white font-sans">
                  {strategyB.name}
                </h2>
              </div>
              <div className="w-8 h-8 rounded bg-[#111] border border-[#222] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"></div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Sharpe Ratio</span>
                    <span className="text-white">{strategyB.sharpe}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#00f0ff]"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Max Drawdown</span>
                    <span className="text-[#ff4500]">{strategyB.drawdown}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#ff4500]"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Win Rate</span>
                    <span className="text-[#39ff14]">{strategyB.winRate}</span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#39ff14]"
                      style={{ width: "54%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Adaptability Score</span>
                    <span className="text-[#00f0ff]">
                      {strategyB.adaptability}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded overflow-hidden relative">
                    <div
                      className="h-full bg-[#00f0ff]"
                      style={{ width: "95%" }}
                    ></div>
                    {/* Scanner effect line for "tech/AI" feel */}
                    <div className="absolute top-0 bottom-0 w-4 bg-white/50 blur-[2px] -translate-x-full animate-[shimmer_2s_infinite_0.5s]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0a0a0a] border-t border-[#1a1a1a] flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
              <span>Alternate Candidate</span>
              <button className="px-4 py-1.5 bg-[#333] text-gray-300 border border-[#444] rounded hover:bg-[#444] transition-colors">
                Set Active
              </button>
            </div>
          </div>

          <div className="col-span-full border border-[#1a1a1a] rounded bg-[#0a0a0a] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#a855f7]" />
                  AI Comparative Analysis
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed font-sans">
                  Strategy B exhibits higher absolute returns (+12.4% vs
                  Strategy A) but assumes significantly more downside risk
                  during sudden volatility expansion events (Day 7, Day 13).
                  Strategy A is recommended for the current low-VIX regime.
                </p>
              </div>
              <button className="shrink-0 px-6 py-2 bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30 rounded uppercase tracking-widest text-xs font-bold hover:bg-[#a855f7]/20 transition-colors">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
