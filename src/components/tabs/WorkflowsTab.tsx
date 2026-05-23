import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSystemStore } from "../../store/systemStore";
import {
  Boxes,
  Cpu,
  Database,
  Link as LinkIcon,
  Play,
  Pause,
  Radio,
  Plus,
  Layers,
  Network,
  ChevronDown,
  CheckCircle2,
  Settings2,
} from "lucide-react";

export function WorkflowsTab() {
  const {
    strategyScores,
    setStrategyScores,
    strategyOverrides,
    setStrategyOverride,
  } = useSystemStore();

  const strategies = Object.values(strategyScores);

  const toggleStrategy = (id: string) => {
    const override = strategyOverrides[id] || {
      weightMultiplier: 1.0,
      enabled: true,
    };
    setStrategyOverride(id, { enabled: !override.enabled });
  };

  const updateStrategyWeight = (id: string, weight: number) => {
    setStrategyOverride(id, { weightMultiplier: weight });
  };

  return (
    <motion.div
      key="workflows"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-sans"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Boxes className="w-8 h-8 text-[#ff00f0]" />
            Strategy Lab & Workflows
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">
            Procedural Logic & Visual Orchestration
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="express"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col pt-4"
        >
          <div className="w-full">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#ff00f0]" />
              Strategy Execution Control
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-2xl">
              Enable or disable specific strategies. Override the AI's
              confidence scores manually to force specific allocations across
              your multi-portfolio orchestration.
            </p>

            {strategies.length === 0 ? (
              <div className="text-center p-12 bg-[#050505] border border-[#1a1a1a] rounded-xl text-gray-500 font-mono text-sm uppercase tracking-widest">
                No strategies currently evaluated.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.map((s) => {
                  const override = strategyOverrides[s.portfolioId] || {
                    weightMultiplier: 1.0,
                    enabled: true,
                  };
                  const isActive = override.enabled;
                  return (
                    <div
                      key={s.portfolioId}
                      className={`bg-[#050505] border ${isActive ? "border-[#ff00f0]/30 hover:border-[#ff00f0]/50" : "border-[#1a1a1a] opacity-60 grayscale"} rounded-sm p-6 cursor-pointer transition-all group relative overflow-hidden flex flex-col`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-[#ff00f0]/5 to-transparent pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3
                            className={`font-bold mb-1 ${isActive ? "text-white" : "text-gray-400"}`}
                          >
                            {s.name || "Unnamed Strategy"}
                          </h3>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                            ID: {s.portfolioId}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStrategy(s.portfolioId);
                          }}
                          className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors z-10 ${isActive ? "bg-[#ff00f0]/20 border border-[#ff00f0]/50" : "bg-[#111] border border-[#333]"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${isActive ? "translate-x-4 bg-[#ff00f0] shadow-[0_0_8px_#ff00f0]" : "translate-x-0 bg-gray-500"}`}
                          ></div>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2 border-t border-[#1a1a1a] pt-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                            Win Rate
                          </div>
                          <div className="text-lg font-mono font-bold text-white">
                            {(s.winRate * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                            Expectancy
                          </div>
                          <div
                            className={`text-lg font-mono font-bold ${s.expectancy > 0 ? "text-[#39ff14]" : "text-[#ff4500]"}`}
                          >
                            {(s.expectancy * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[#1a1a1a] pt-4">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          <span>AI Confidence Score</span>
                          <span className="text-[#00f0ff] font-bold">
                            {(s.baseScore * 100).toFixed(1)}
                          </span>
                        </div>
                        <div className="h-2 bg-[#111] rounded-full overflow-hidden border border-[#222]">
                          <div
                            className="h-full bg-linear-to-r from-[#ff00f0] to-[#00f0ff]"
                            style={{ width: `${s.baseScore * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#1a1a1a] relative z-10">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#ff00f0] mb-2 font-bold pointer-events-auto">
                          <span>Weight Override</span>
                          <span>{override.weightMultiplier.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={override.weightMultiplier}
                          onChange={(e) =>
                            updateStrategyWeight(
                              s.portfolioId,
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full accent-[#ff00f0] pointer-events-auto cursor-pointer"
                          title="Override Live Weight Multiplier"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
