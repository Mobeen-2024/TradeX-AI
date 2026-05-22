import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSystemStore } from "../../store/systemStore";
import {
  Brain,
  Activity,
  Newspaper,
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  X,
  Network,
  Briefcase,
  Zap,
} from "lucide-react";
import Markdown from "react-markdown";

export const DecisionTracePanel: React.FC = () => {
  const {
    activeCorrelationId,
    setActiveCorrelationId,
    isSimulationMode,
    overrideState,
    setOverrideState,
  } = useSystemStore();
  const [viewMode, setViewMode] = useState<"AI" | "USER" | "OUTCOME">("AI");
  const [currentTrace, setCurrentTrace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeCorrelationId) {
      setCurrentTrace(null);
      return;
    }
    const fetchTrace = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/system/trace/${activeCorrelationId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentTrace(data);
        }
      } catch (err) {
        console.error("Failed to fetch decision trace:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrace();
  }, [activeCorrelationId]);

  return (
    <AnimatePresence>
      {activeCorrelationId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCorrelationId(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#050505] border-l border-white/10 z-[101] flex flex-col shadow-2xl font-mono"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center border border-[#a855f7]/30">
                  <Network className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">
                    Decision Intelligence
                  </h2>
                  <div className="text-[10px] text-gray-500 font-mono">
                    TRACE ID: {activeCorrelationId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveCorrelationId(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ADAPTIVE FEEDBACK VIEW TOGGLE */}
            <div className="flex bg-[#050505] p-2 border-b border-[#1a1a1a]">
              <button
                onClick={() => setViewMode("AI")}
                className={`flex-1 text-center py-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors rounded-sm ${viewMode === "AI" ? "bg-[#a855f7]/10 text-[#a855f7]" : "text-gray-500 hover:text-gray-300"}`}
              >
                AI Decision
              </button>
              <button
                onClick={() => setViewMode("USER")}
                className={`flex-1 text-center py-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors rounded-sm ${viewMode === "USER" ? "bg-[#ff6b00]/10 text-[#ff6b00]" : "text-gray-500 hover:text-gray-300"}`}
              >
                User Override
              </button>
              <button
                onClick={() => setViewMode("OUTCOME")}
                className={`flex-1 text-center py-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors rounded-sm ${viewMode === "OUTCOME" ? "bg-[#39ff14]/10 text-[#39ff14]" : "text-gray-500 hover:text-gray-300"}`}
              >
                Outcome
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <div className="w-6 h-6 border-b-2 border-[#a855f7] rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Reconstructing Trace...
                  </span>
                </div>
              ) : currentTrace ? (
                <>
                  {viewMode === "AI" && (
                    <>
                      {/* OVERVIEW PANEL */}
                      <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#a855f7]/20 via-transparent to-transparent pointer-events-none opacity-50"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                              Final Decision
                            </h3>
                            <div
                              className={`text-xl font-bold font-sans ${currentTrace.coordinator?.metadata?.decision === "BUY" ? "text-[#39ff14]" : currentTrace.coordinator?.metadata?.decision === "SELL" ? "text-[#ff0055]" : "text-gray-300"}`}
                            >
                              {currentTrace.coordinator?.metadata?.decision ||
                                "HOLD SCAN"}
                            </div>
                          </div>
                          <div className="text-right">
                            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                              Confidence
                            </h3>
                            <div className="text-lg font-bold text-[#00f0ff] font-mono">
                              {(
                                (currentTrace.coordinator?.metadata
                                  ?.confidence ||
                                  currentTrace.quant?.metadata?.confidence ||
                                  0) * 100
                              ).toFixed(1)}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                          <div className="bg-black/40 border border-white/5 rounded p-2 flex flex-col justify-between">
                            <span className="text-[9px] text-gray-500 uppercase mb-1">
                              Strategy Score
                            </span>
                            <span className="text-xs text-white">
                              {(
                                currentTrace.coordinator?.metadata
                                  ?.strategyScore || 0.85
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded p-2 flex flex-col justify-between">
                            <span className="text-[9px] text-gray-500 uppercase mb-1">
                              Risk Multiplier
                            </span>
                            <span className="text-xs text-[#ffcc00]">
                              {(
                                currentTrace.coordinator?.metadata
                                  ?.riskMultiplier || 1.0
                              ).toFixed(2)}
                              x
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TIMELINE (STACKED REASONING) */}
                      <div className="space-y-4 relative">
                        <div className="absolute left-[15px] top-6 bottom-4 w-px bg-white/10 z-0"></div>

                        {/* Step 1: Quant Signal */}
                        {currentTrace.quant && (
                          <TraceStep
                            title="Quant Signal Generation"
                            icon={<Cpu className="w-3 h-3 text-[#ff0055]" />}
                            color="border-[#ff0055]"
                            glowColor="#ff0055"
                            memory={currentTrace.quant}
                            tags={[
                              {
                                label: "regime",
                                value: currentTrace.quant.market_regime,
                              },
                            ]}
                          />
                        )}

                        {/* Step 2: Risk Adjustment */}
                        {currentTrace.risk && (
                          <TraceStep
                            title="Risk Adjustment Filter"
                            icon={
                              <Activity className="w-3 h-3 text-[#ffcc00]" />
                            }
                            color="border-[#ffcc00]"
                            glowColor="#ffcc00"
                            memory={currentTrace.risk}
                            tags={[
                              {
                                label: "level",
                                value:
                                  currentTrace.risk.metadata?.level || "NORMAL",
                              },
                            ]}
                          />
                        )}

                        {/* Step 3: Strategy Weight */}
                        {currentTrace.coordinator && (
                          <TraceStep
                            title="Strategy & Weighting"
                            icon={<Brain className="w-3 h-3 text-[#a855f7]" />}
                            color="border-[#a855f7]"
                            glowColor="#a855f7"
                            memory={currentTrace.coordinator}
                            tags={[{ label: "allocation", value: "Optimal" }]}
                          />
                        )}

                        {/* Step 4: Execution / Global Filter */}
                        {currentTrace.execution && (
                          <TraceStep
                            title="Execution Routing"
                            icon={<Zap className="w-3 h-3 text-[#39ff14]" />}
                            color="border-[#39ff14]"
                            glowColor="#39ff14"
                            memory={currentTrace.execution}
                            tags={[
                              {
                                label: "status",
                                value:
                                  currentTrace.execution.metadata?.status ||
                                  "COMPLETED",
                              },
                            ]}
                          />
                        )}

                        {/* Step 5: Evaluation */}
                        {currentTrace.evaluation && (
                          <TraceStep
                            title="Post-Trade Evaluation"
                            icon={
                              <CheckCircle2 className="w-3 h-3 text-[#00f0ff]" />
                            }
                            color="border-[#00f0ff]"
                            glowColor="#00f0ff"
                            memory={currentTrace.evaluation}
                            tags={[
                              {
                                label: "PnL",
                                value:
                                  currentTrace.evaluation.metadata?.pnl > 0
                                    ? "Positive"
                                    : "Negative",
                              },
                            ]}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* OVERRIDE CONSOLE */}
                  {(viewMode === "USER" || isSimulationMode) && (
                    <div className="bg-[#110a05] rounded-xl border border-[#ff6b00]/30 p-4 relative overflow-hidden shadow-[0_0_15px_rgba(255,107,0,0.1)] mb-4">
                      <h3 className="text-xs text-[#ff6b00] uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Simulation Overrides
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-gray-500 uppercase">
                            Override Action
                          </span>
                          <select
                            value={overrideState.action || ""}
                            onChange={(e) =>
                              setOverrideState({
                                action: e.target.value
                                  ? (e.target.value as any)
                                  : null,
                              })
                            }
                            className="bg-[#050505] border border-white/10 text-white text-xs p-1.5 rounded outline-none w-full"
                          >
                            <option value="">(Inherit AI)</option>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                            <option value="HOLD">HOLD</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-gray-500 uppercase">
                            Size Multiplier
                          </span>
                          <select
                            value={overrideState.sizeMultiplier}
                            onChange={(e) =>
                              setOverrideState({
                                sizeMultiplier: parseFloat(e.target.value),
                              })
                            }
                            className="bg-[#050505] border border-white/10 text-[#00f0ff] font-mono text-xs p-1.5 rounded outline-none w-full"
                          >
                            <option value="0.5">0.5x</option>
                            <option value="1">1.0x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2.0x</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-gray-500 uppercase">
                            Risk Mode
                          </span>
                          <select
                            value={overrideState.riskMode}
                            onChange={(e) =>
                              setOverrideState({
                                riskMode: e.target.value as any,
                              })
                            }
                            className="bg-[#050505] border border-white/10 text-[#ffcc00] font-mono text-xs p-1.5 rounded outline-none w-full"
                          >
                            <option value="CONSERVATIVE">CONSERVATIVE</option>
                            <option value="NORMAL">NORMAL</option>
                            <option value="AGGRESSIVE">AGGRESSIVE</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === "OUTCOME" && (
                    <div className="space-y-4">
                      <div className="bg-[#0a0a0a] rounded-xl border border-[#39ff14]/20 p-4">
                        <h3 className="text-xs text-[#39ff14] uppercase tracking-widest mb-3 font-bold">
                          Outcome Comparison
                        </h3>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                            <span className="text-[10px] text-gray-400 font-mono uppercase">
                              AI Expected
                            </span>
                            <span className="text-sm text-gray-300 font-bold">
                              $1,250.00
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-[#ff6b00]/10 p-2 rounded border border-[#ff6b00]/20">
                            <span className="text-[10px] text-[#ff6b00] font-mono uppercase">
                              User Override Exp.
                            </span>
                            <span className="text-sm text-[#ff6b00] font-bold">
                              $2,800.00
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-[#39ff14]/10 p-2 rounded border border-[#39ff14]/20">
                            <span className="text-[10px] text-[#39ff14] font-mono uppercase">
                              Actual Realized
                            </span>
                            <span className="text-sm text-[#39ff14] font-bold">
                              $3,105.00
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-white/5 pt-3">
                          <div className="text-[10px] text-[#39ff14] uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Override
                            Improved Result
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            User override successfully capitalized on High
                            Volatility setup vs AI Conservative hold.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-10 uppercase tracking-widest text-xs">
                  Trace Corrupt or Not Found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TraceStep = ({
  title,
  icon,
  color,
  glowColor,
  memory,
  tags,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  memory: any;
  tags: any[];
}) => {
  return (
    <div className="relative z-10 flex gap-3">
      <div
        className={`w-8 h-8 rounded-full bg-[#050505] border-2 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10`}
        style={{ borderColor: glowColor, boxShadow: `0 0 15px ${glowColor}20` }}
      >
        {icon}
      </div>
      <div
        className={`flex-1 bg-[#0a0a0a] rounded-xl border border-white/5 border-l-2 p-4 pt-3 ${color} shadow-sm group hover:bg-white/5 transition-colors`}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            {tags.map((t, i) => (
              <span
                key={i}
                className="text-[8px] uppercase tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400"
              >
                {t.label}:{" "}
                <span className="text-white font-bold">{t.value}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400 font-sans leading-relaxed">
          <div className="markdown-body">
            <Markdown>{memory.ai_rationale || memory.message}</Markdown>
          </div>
        </div>
        {memory.metadata && (
          <div className="mt-3 bg-black/60 p-2 rounded border border-white/5 overflow-x-auto">
            <pre className="text-[9px] font-mono text-gray-500 m-0 leading-tight">
              {JSON.stringify(memory.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
