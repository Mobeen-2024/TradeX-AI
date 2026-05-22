import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Search,
  Filter,
  Globe,
  Database,
  Network,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function MarketResearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { systemInsights, strategyScores } = useSystemStore();

  const strategies = Object.values(strategyScores);
  const macroStrategy =
    strategies.find((s) => s.name?.toLowerCase().includes("macro")) ||
    strategies[0];

  const filteredInsights = systemInsights.filter(
    (insight) =>
      insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.suggestedAction.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <motion.div
      key="market-research"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <BookOpen className="w-8 h-8 text-[#0ea5e9]" />
            Deep Market Intelligence
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            Global Macro & On-Chain Synthesis
          </p>
        </div>
        <div className="flex gap-2">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="QUERY ASSET OR MACRO THEME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#050505] border border-[#222] text-white text-xs px-9 py-2 rounded-sm w-64 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
          </form>
          <button className="bg-[#050505] border border-[#222] px-3 py-2 flex items-center justify-center rounded-sm hover:border-[#333] transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Intelligence Banner */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden flex items-start gap-5">
            <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded border border-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-[#0ea5e9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-gray-200 font-bold font-sans text-lg">
                  AI Macro Synthesis Report
                </h2>
                <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-[#0ea5e9]/20">
                  Generated Live
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-sans mb-3">
                {macroStrategy
                  ? `System indicates a ${(macroStrategy.winRate * 100).toFixed(1)}% probability of directional move based on regimen factors. Recommend tracking leading digital assets (score: ${(macroStrategy.baseScore * 100).toFixed(1)}).`
                  : "Awaiting agent synthesis data..."}
              </p>
            </div>
          </div>

          {/* Research Feed */}
          <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm flex flex-col">
            <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]/50">
              <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4 text-gray-500" />
                Aggregated Signal Feed
              </h3>
            </div>

            <div className="flex-1 flex flex-col divide-y divide-[#1a1a1a] overflow-y-auto min-h-[300px]">
              <AnimatePresence>
                {filteredInsights.length === 0 && (
                  <div className="p-8 text-center text-gray-500 font-mono text-xs">
                    No active signals found.
                  </div>
                )}
                {filteredInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-[#0a0a0a] transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold ${insight.priority === "HIGH" ? "text-[#ff4500]" : insight.priority === "MEDIUM" ? "text-[#facc15]" : "text-[#0ea5e9]"}`}
                        >
                          #{insight.affectedComponent}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${insight.priority === "HIGH" ? "bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/20" : insight.priority === "MEDIUM" ? "bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20" : "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20"}`}
                      >
                        {insight.priority} Impact
                      </span>
                    </div>
                    <h4 className="text-gray-200 font-sans font-medium text-sm mb-2 group-hover:text-white transition-colors">
                      {insight.suggestedAction}
                    </h4>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2">
                      {insight.description} (Confidence:{" "}
                      {(insight.confidence * 100).toFixed(1)}%)
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Data Sources & Topics */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 border-l-[3px] border-l-[#0ea5e9]">
            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0ea5e9]" />
              Active Knowledge Sources
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-xs">
                <span className="text-gray-300">Binance Orderbook</span>
                <span className="text-[#39ff14] text-[10px]">Streaming</span>
              </li>
              <li className="flex justify-between items-center text-xs">
                <span className="text-gray-300">Agent Telemetry</span>
                <span className="text-[#39ff14] text-[10px]">Live</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
