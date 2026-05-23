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
  Network,
} from "lucide-react";
import { AIConfidenceRing } from "../ui/AIConfidenceRing";
import { useSystemStore } from "../../store/systemStore";
import { useMarketStore } from "../../store/marketStore";
import { InsightsPanel } from "../ui/InsightsPanel";
import { Skeleton, SkeletonRow } from "../ui/Skeleton";

function TickerData() {
  const { ticker } = useMarketStore();

  const currentPrice =
    ticker.dataStream.length > 0
      ? ticker.dataStream[ticker.dataStream.length - 1]
      : 2560.5;

  const euroPrice = currentPrice * 0.925;
  const gbpPrice = currentPrice * 0.782;
  const gldPrice = currentPrice / 10;

  return (
    <>
      <div className="flex flex-col gap-1 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
          XAU/USD Spot Gold
        </span>
        <span className="text-[#39ff14] font-sans font-bold text-lg">
          ${currentPrice.toFixed(2)}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-[10px] font-bold ${ticker.isPositive ? "text-[#39ff14]" : "text-[#ff4500]"}`}
          >
            {ticker.isPositive ? "+" : ""}
            {(ticker.changePercent || 0.45).toFixed(2)}%
          </span>
          <span className="text-[9px] text-gray-600">Vol: Spot</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
          XAU/EUR Spot
        </span>
        <span className="text-white font-sans font-bold text-lg">
          €{euroPrice.toFixed(2)}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-[10px] font-bold ${ticker.isPositive ? "text-[#39ff14]" : "text-[#ff4500]"}`}
          >
            {ticker.isPositive ? "+" : ""}
            {(ticker.changePercent || 0.45).toFixed(2)}%
          </span>
          <span className="text-[9px] text-gray-600">Gold (EUR)</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
          XAU/GBP Spot
        </span>
        <span className="text-white font-sans font-bold text-lg">
          £{gbpPrice.toFixed(2)}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-[10px] font-bold ${ticker.isPositive ? "text-[#39ff14]" : "text-[#ff4500]"}`}
          >
            {ticker.isPositive ? "+" : ""}
            {(ticker.changePercent || 0.45).toFixed(2)}%
          </span>
          <span className="text-[9px] text-gray-600">Gold (GBP)</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
          GLD ETF Shares
        </span>
        <span className="text-[#00f0ff] font-sans font-bold text-lg">
          ${gldPrice.toFixed(2)}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-[10px] font-bold ${ticker.isPositive ? "text-[#39ff14]" : "text-[#ff4500]"}`}
          >
            {ticker.isPositive ? "+" : ""}
            {(ticker.changePercent || 0.45).toFixed(2)}%
          </span>
          <span className="text-[9px] text-gray-600">1:10 Reserve</span>
        </div>
      </div>
    </>
  );
}

export function DashboardTab() {
  const {
    activePortfolio: portfolio,
    globalMetrics,
    strategyScores,
    setActiveCorrelationId,
  } = useSystemStore();

  const isAutonomous = (portfolio as any)?.execution_mode === "AUTO";

  const strategies = Object.values(strategyScores);
  const activeStrategy = strategies.length > 0 ? strategies[0] : null;

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
            {portfolio ? (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${isAutonomous ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
              >
                {isAutonomous ? "Autonomous Mode" : "Manual Mode"}
              </span>
            ) : (
              <Skeleton className="w-20 h-4" />
            )}
          </div>

          {portfolio === null ? (
            <div className="flex flex-col gap-2 w-full mt-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase mb-2">
                  Confidence
                </span>
                <div className="flex items-center gap-3">
                  <AIConfidenceRing
                    confidence={
                      activeStrategy ? activeStrategy.baseScore * 100 : 87.4
                    }
                    size={48}
                    theme="cyan"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  Expectancy
                </span>
                <span className="text-sm text-gray-200 font-sans font-bold">
                  {activeStrategy
                    ? activeStrategy.expectancy.toFixed(2)
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  Last Strategy
                </span>
                <span className="text-sm text-[#00f0ff] font-sans font-bold">
                  {activeStrategy?.name || "Initializing..."}
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
          )}
        </div>

        {/* Market Overview (spanning 8 cols) */}
        <div className="lg:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col justify-between">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-white" />
            Global Market Synthesis
          </h3>

          <div className="grid grid-cols-4 gap-4 flex-1 items-end">
            {portfolio === null ? (
              <>
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </>
            ) : (
              <TickerData />
            )}
          </div>
        </div>
      </div>

      {/* DELTA-TIE 7-LAYER SYSTEM DECISION ENGINE MATRIX */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 hover:border-[#222] transition-colors relative">
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
          <Cpu className="w-16 h-16 text-[#39ff14]" />
        </div>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1a1a1a]">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#39ff14]" />
            DELTA Tactical Intelligence Cores — 7-Layer Institutional Flow
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] rounded-sm font-bold uppercase tracking-widest">
            Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Layer 1 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#00f0ff]">
                  L1 STRUCTURE
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Market Structure Engine
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Trend Bias:</span>{" "}
                <span className="text-[#39ff14] font-bold">BULLISH</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">BOS Level:</span>{" "}
                <span className="text-gray-300 font-mono">$2590.50</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">CHOCH Level:</span>{" "}
                <span className="text-gray-300 font-mono">$2545.20</span>
              </div>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#00f0ff]">
                  L2 REGIME
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Regime Detection Unit
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Detected:</span>{" "}
                <span className="text-[#00f0ff] font-bold">EXPANSION</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Volatility:</span>{" "}
                <span className="text-[#facc15] font-bold">HIGH</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Stop Mult:</span>{" "}
                <span className="text-gray-300">0.8x StdDev</span>
              </div>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#00f0ff]">
                  L3 CONFLUENCE
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Tactical Signal Synthesis
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Signal Score:</span>{" "}
                <span className="text-[#39ff14] font-bold">88 / 100</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Cdl Vol:</span>{" "}
                <span className="text-gray-300 font-mono">+230%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Spread:</span>{" "}
                <span className="text-gray-300 font-mono">0.08 bps</span>
              </div>
            </div>
          </div>

          {/* Layer 4 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#facc15]">
                  L4 RISK
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Dynamic Intelligence Risk
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Max Expos:</span>{" "}
                <span className="text-gray-300 font-mono">$1.30M</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Drawdown Cap:</span>{" "}
                <span className="text-[#ff4500] font-mono">-3.5%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Safe-Stop:</span>{" "}
                <span className="text-gray-300 font-mono">$2420.50</span>
              </div>
            </div>
          </div>

          {/* Layer 5 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#a855f7]">
                  L5 HEDGING
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Tactical Hedging Matrix
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Hedge Ratio:</span>{" "}
                <span className="text-[#a855f7] font-bold">18.4%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Balance:</span>{" "}
                <span className="text-gray-300 font-mono">82% L / 18% S</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Auto-Hedge:</span>{" "}
                <span className="text-[#39ff14]">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Layer 6 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#ff00f0]">
                  L6 AI COGNITIVE
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Realtime LLM Ingests
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Sentiment:</span>{" "}
                <span className="text-[#39ff14] font-bold">+15% Boost</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Macro Ingest:</span>{" "}
                <span className="text-[#00f0ff] font-bold">Safe-Haven</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Anomalies:</span>{" "}
                <span className="text-[#39ff14] font-mono">0 Clean</span>
              </div>
            </div>
          </div>

          {/* Layer 7 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-sm flex flex-col justify-between min-h-35">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#e11d48]">
                  L7 EXECUTION
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2 font-sans">
                Execution Unit
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Venue Latency:</span>{" "}
                <span className="text-gray-300 font-mono">45ms</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Slippage Bps:</span>{" "}
                <span className="text-gray-300 font-mono">0.12 bps</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-600">Breaker:</span>{" "}
                <span className="text-gray-300">ARMED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: PORTFOLIO | LIVE CHART | AI PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-87.5">
        {/* Portfolio (1 col) */}
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col justify-between">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#a855f7]" />
            Portfolio State
          </h3>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Total Balance
            </span>
            <span className="text-3xl text-white font-sans font-bold tracking-tight">
              $
              {(portfolio?.totalValue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold ${(portfolio?.realizedPnl || 0) >= 0 ? "text-[#39ff14]" : "text-[#ff4500]"}`}
              >
                {(portfolio?.realizedPnl || 0) >= 0 ? "+" : ""}
                {Number(portfolio?.realizedPnl || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Realized PNL
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold ${(portfolio?.unrealizedPnl || 0) >= 0 ? "text-[#39ff14]" : "text-[#ff4500]"}`}
              >
                {(portfolio?.unrealizedPnl || 0) >= 0 ? "+" : ""}
                {Number(portfolio?.unrealizedPnl || 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 },
                )}
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Unrealized PNL
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#a855f7] text-xs font-bold">
                {Math.round(globalMetrics.winRate * 100)}%
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Win Rate
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-200 text-xs font-bold">
                {globalMetrics.sharpeRatio.toFixed(2)}
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Sharpe Ratio
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#ff4500] text-xs font-bold">
                -{(globalMetrics.globalDrawdown * 100).toFixed(2)}%
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                Max Drawdown
              </span>
            </div>
          </div>
        </div>

        {/* Live Chart (2 col) */}
        <div className="lg:col-span-2 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-size-[20px_20px] opacity-10"></div>
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

          <div className="flex-1 w-full bg-[#0a0a0a] border border-[#111] rounded-sm relative flex items-center justify-center p-4">
            <span className="text-gray-500 text-xs font-mono">
              Live chart data streamed via WebSocket...
            </span>
          </div>
        </div>

        {/* Insights Panel (1 col) */}
        <div className="lg:col-span-1 flex flex-col h-full max-h-87.5 overflow-y-auto no-scrollbar">
          <InsightsPanel />
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
              {(portfolio as any)?.positions?.length || 0} Positions
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
                {(portfolio as any)?.positions
                  ?.filter((p: any) => Number(p.size) !== 0)
                  .map((pos: any, i: number) => {
                    const sizeDec = Number(pos.size);
                    const isLong = sizeDec > 0;
                    const upnl = Number(pos.unrealizedPnl || 0);
                    return (
                      <tr
                        key={i}
                        className="hover:bg-[#0a0a0a] transition-colors group cursor-pointer"
                      >
                        <td className="px-3 py-2.5 font-bold font-sans text-gray-200">
                          {pos.asset_id}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`font-bold ${isLong ? "text-[#39ff14]" : "text-[#ff4500]"}`}
                          >
                            {isLong ? "LONG" : "SHORT"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400">
                          {Math.abs(sizeDec)}
                        </td>
                        <td className="px-3 py-2.5 text-gray-400">
                          {Number(pos.avg_entry_price).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-gray-300">
                          {Number(pos.currentPrice).toFixed(2)}
                        </td>
                        <td
                          className={`px-3 py-2.5 font-bold text-right ${upnl >= 0 ? "text-[#39ff14]" : "text-[#ff4500]"}`}
                        >
                          {upnl >= 0 ? "+" : ""}
                          {upnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                {!(portfolio as any)?.positions?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 text-gray-500 font-mono text-xs"
                    >
                      No active positions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Activity Feed -> Recent Trades Performance */}
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col flex-1 h-50 overflow-hidden">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 border-b border-[#1a1a1a] pb-3">
            <PlayCircle className="w-4 h-4 text-[#ff00f0]" />
            Recent Trade Performance
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 no-scrollbar">
            {(portfolio as any)?.recentTrades?.map((trade: any, i: number) => {
              const time = new Date(trade.opened_at).toLocaleTimeString([], {
                hour12: false,
              });
              const isWin = Number(trade.pnl) > 0;
              const isClosed = trade.status === "CLOSED";
              return (
                <div
                  key={i}
                  className="flex justify-between items-center text-[10px]"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200">
                      {trade.asset_id}{" "}
                      <span
                        className={
                          Number(trade.size) > 0
                            ? "text-[#39ff14]"
                            : "text-[#ff4500]"
                        }
                      >
                        {Number(trade.size) > 0 ? "LONG" : "SHORT"}
                      </span>
                    </span>
                    <span className="text-gray-500 uppercase">{time}</span>
                  </div>
                  <div className="flex flex-col text-right items-end gap-1">
                    {isClosed ? (
                      <span
                        className={`font-bold ${isWin ? "text-[#39ff14]" : "text-[#ff4500]"}`}
                      >
                        {isWin ? "+" : ""}
                        {Number(trade.pnl).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[#0ea5e9] font-bold">OPEN</span>
                    )}
                    {trade.correlation_id && (
                      <button
                        onClick={() =>
                          setActiveCorrelationId(trade.correlation_id)
                        }
                        className="flex items-center gap-1 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#a855f7] px-1.5 py-0.5 rounded text-[8px] uppercase font-bold transition-all"
                      >
                        <Network className="w-2.5 h-2.5" />
                        Trace
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!(portfolio as any)?.recentTrades?.length && (
              <div className="text-gray-500 text-xs italic text-center mt-4">
                No recent trades to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
