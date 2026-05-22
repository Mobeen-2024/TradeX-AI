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
import { useSystemStore } from "../../store/systemStore";

export function DashboardTab() {
  const {
    activePortfolio: portfolio,
    globalMetrics,
    strategyScores,
  } = useSystemStore();

  const isAutonomous = true; // Can be derived from portfolio or config later

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
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${isAutonomous ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
            >
              {isAutonomous ? "Autonomous Mode" : "Manual Mode"}
            </span>
          </div>

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
                {activeStrategy ? activeStrategy.expectancy.toFixed(2) : "N/A"}
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

          <div className="flex-1 w-full bg-[#0a0a0a] border border-[#111] rounded-sm relative flex items-center justify-center p-4">
            <span className="text-gray-500 text-xs font-mono">
              Live chart data streamed via WebSocket...
            </span>
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
        <div className="lg:col-span-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col flex-1 h-[200px] overflow-hidden">
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
                  <div className="flex flex-col text-right">
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
