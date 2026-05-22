import React from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Sparkles,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function AlphaGenerationTab() {
  const { strategyScores, systemInsights } = useSystemStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Alpha Generation
          </h2>
          <p className="text-sm text-gray-400 font-mono">
            Real-time strategy intelligence & scoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(strategyScores).length === 0 && (
          <div className="col-span-full border border-dashed border-[#222] p-8 text-center text-gray-500 font-mono rounded">
            Awating Strategy Intelligence
          </div>
        )}

        {Object.entries(strategyScores).map(([key, score]) => {
          const matchingInsight = systemInsights.find(
            (i) => i.affectedComponent === "STRATEGY" && i.targetId === key,
          );

          return (
            <div
              key={key}
              className={`bg-[#050505] border ${matchingInsight ? "border-red-500/50" : "border-[#1a1a1a]"} rounded-xl p-5 hover:border-[#333] transition-colors relative overflow-hidden`}
            >
              {matchingInsight && (
                <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 px-3 py-1 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">
                    {matchingInsight.suggestedAction}
                  </span>
                </div>
              )}

              <div
                className={`flex items-center justify-between mb-4 ${matchingInsight ? "mt-6" : ""}`}
              >
                <h3 className="text-sm font-semibold text-gray-200">
                  {score.name || "Unnamed Strategy"}
                </h3>
                {score.allocationWeight > 0.5 ? (
                  <TrendingUp className="w-4 h-4 text-[#39ff14]" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-[#0ea5e9]" />
                )}
              </div>

              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">
                    Confidence
                  </span>
                  <span className="text-xl font-bold text-white">
                    {(score.baseScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">
                    Target Weight
                  </span>
                  <span className="text-sm text-gray-300 font-mono">
                    {(score.allocationWeight * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-[#1a1a1a]">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-500">Regime Fit</span>
                  <span className="text-[#39ff14]">
                    {(score.regimeScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-500">Expectancy</span>
                  <span className="text-[#00f0ff]">
                    {score.expectancy.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-500">Win Rate</span>
                  <span className="text-[#a855f7]">
                    {(score.winRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 h-1.5 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#0ea5e9] to-[#00f0ff]"
                  style={{ width: `${score.baseScore * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
