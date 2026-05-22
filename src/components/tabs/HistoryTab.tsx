import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSystemStore } from "../../store/systemStore";
import { DecisionInspector } from "../ui/DecisionInspector";
import {
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database,
  BrainCircuit,
  AlertTriangle,
  Activity,
  Zap,
} from "lucide-react";

type RealMemoryEvent = {
  id: string;
  agent_name: string;
  market_regime: string;
  ai_rationale: string;
  created_at: string;
  metadata?: {
    pnl?: string;
    score?: number;
    [key: string]: any;
  };
  correlation_id?: string;
};

function MemoryIcon({ score }: { score?: number }) {
  if (score === undefined)
    return <BrainCircuit className="w-4 h-4 text-[#a855f7]" />;
  if (score > 0) return <ArrowUpRight className="w-4 h-4 text-[#39ff14]" />;
  if (score < 0) return <AlertTriangle className="w-4 h-4 text-[#ff4500]" />;
  return <Zap className="w-4 h-4 text-[#0ea5e9]" />;
}

function MemoryColor({ score }: { score?: number }) {
  if (score === undefined) return "#a855f7";
  if (score > 0) return "#39ff14";
  if (score < 0) return "#ff4500";
  return "#0ea5e9";
}

export function HistoryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"memories" | "telemetry">(
    "memories",
  );
  const [memories, setMemories] = useState<RealMemoryEvent[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { telemetryFeed } = useSystemStore();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await fetch("/api/events/recent");
        if (res.ok) {
          const data = await res.json();
          setMemories(data.memories || []);
          if (data.memories && data.memories.length > 0) {
            setSelectedMemory(data.memories[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching memories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  const handleSelectMemory = (memory: RealMemoryEvent) => {
    setSelectedMemory(memory.id);
  };

  const activeMemory = memories.find((m) => m.id === selectedMemory);

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-6 relative">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#00f0ff]/5 blur-[60px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-4 font-sans drop-shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Database className="w-6 h-6 text-[#00f0ff]" />
            </div>
            Memory Vault & Telemetry
          </h1>
          <p className="text-gray-400 text-xs mt-3 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            Semantic Log of AI Experience & Real-time Telemetry
          </p>
        </div>
        <div className="flex gap-3 relative z-10 items-center">
          <div className="flex bg-[#050505]/80 backdrop-blur-md rounded-lg border border-white/10 p-1 mr-4">
            <button
              onClick={() => setViewMode("memories")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "memories" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Semantic Memories
            </button>
            <button
              onClick={() => setViewMode("telemetry")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "telemetry" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Raw Telemetry
            </button>
          </div>
          <button className="flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-[#020202]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-4 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] group transition-colors hover:border-white/20">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-linear-to-l from-[#00f0ff]/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20 shrink-0 shadow-inner group-hover:border-[#00f0ff]/40 transition-colors">
          <Search className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            viewMode === "memories"
              ? "Semantic search: 'Show similar BTC volatility events...'"
              : "Filter telemetry tags..."
          }
          className="bg-transparent border-none text-white w-full focus:outline-none font-sans placeholder-gray-500 text-lg tracking-wide"
        />
        <div className="px-4 text-xs font-mono text-gray-600">ctrl+k</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 h-full min-h-125">
        {/* Sidebar List */}
        <div className="col-span-1 xl:col-span-4 bg-[#020202] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="p-5 border-b border-white/5 bg-[#0a0a0a]/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
              {viewMode === "memories" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
              {viewMode === "memories"
                ? "Agent Neural Timeline"
                : "Live Telemetry Feed"}
            </span>
            <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_8px_#39ff14]"></div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-1 relative">
            <div className="absolute top-5 bottom-5 left-8.75 w-0.5 bg-linear-to-b from-transparent via-white/10 to-transparent z-0"></div>

            {viewMode === "memories" ? (
              <>
                {memories.length === 0 && !loading && (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    No memories found.
                  </div>
                )}

                {memories.map((memory) => {
                  const isActive = selectedMemory === memory.id;
                  const color = MemoryColor({ score: memory.metadata?.score });
                  return (
                    <button
                      key={memory.id}
                      onClick={() => handleSelectMemory(memory)}
                      className={`w-full text-left relative z-10 flex gap-4 p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${isActive ? "bg-[#0a0a0a] border-white/10 shadow-lg scale-[1.02]" : "bg-transparent border-transparent hover:bg-white/2"}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMemory"
                          className="absolute inset-0 opacity-10 pointer-events-none"
                          style={{
                            background: `radial-gradient(120px circle at left center, ${color}, transparent)`,
                          }}
                        />
                      )}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm relative z-10 transition-all duration-300 ${isActive ? "scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"}`}
                        style={{
                          backgroundColor: `${color}15`,
                          borderColor: isActive ? color : "#333",
                          boxShadow: isActive ? `0 0 15px ${color}40` : "none",
                        }}
                      >
                        <MemoryIcon score={memory.metadata?.score} />
                      </div>
                      <div className="flex-1 overflow-hidden relative z-10">
                        <div className="flex justify-between items-start mb-1 text-xs">
                          <span
                            className={`font-bold font-sans truncate pr-2 transition-colors ${isActive ? "text-white" : "text-gray-300 group-hover:text-gray-100"}`}
                          >
                            {memory.agent_name}
                          </span>
                          <span
                            className={`text-[9px] whitespace-nowrap font-mono transition-colors ${isActive ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {new Date(memory.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className="text-[9px] uppercase tracking-widest mt-1 flex items-center gap-1.5 font-bold"
                          style={{ color: isActive ? color : "#666" }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: color,
                              boxShadow: isActive ? `0 0 5px ${color}` : "none",
                            }}
                          ></span>
                          {memory.market_regime || "analysis"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {telemetryFeed.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    Awaiting telemetry frames...
                  </div>
                )}
                {/* We just show a truncated list since it streams fast */}
                {[...telemetryFeed]
                  .reverse()
                  .slice(0, 50)
                  .map((event, i) => (
                    <div
                      key={i}
                      className="w-full text-left relative z-10 flex gap-4 p-3 rounded-xl border border-transparent hover:bg-white/2 transition-colors"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-[#00f0ff] uppercase tracking-widest truncate">
                            {event.type || "SYS"}
                          </span>
                          {event.timestamp && (
                            <span className="text-[9px] text-gray-600">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-300 font-mono break-words leading-relaxed truncate">
                          {event.message || JSON.stringify(event.metadata)}
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>

        {/* Details view */}
        <div className="col-span-1 xl:col-span-8 bg-[#020202] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {viewMode === "telemetry" ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a]/50">
                <h2 className="text-white font-bold text-lg font-sans">
                  Raw Telemetry Stream Console (Read-only)
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Live WebSocket capture of `telemetryFeed` from
                  useSystemStore()
                </p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar font-mono text-xs">
                {[...telemetryFeed]
                  .reverse()
                  .slice(0, 100)
                  .map((ev, i) => (
                    <div
                      key={i}
                      className="mb-2 pb-2 border-b border-white/5 last:border-0 text-gray-400"
                    >
                      <div className="flex gap-4">
                        <span className="text-gray-600 w-24 shrink-0">
                          {ev.timestamp
                            ? new Date(ev.timestamp).toLocaleTimeString()
                            : "N/A"}
                        </span>
                        <span className="text-[#0ea5e9] w-24 shrink-0 font-bold">
                          {ev.type}
                        </span>
                        <span className="text-gray-300 break-words flex-1 whitespace-pre-wrap">
                          {ev.message || JSON.stringify(ev.metadata, null, 2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : activeMemory?.correlation_id ? (
            <DecisionInspector correlationId={activeMemory.correlation_id} />
          ) : activeMemory ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMemory.id}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col p-8 relative z-10"
              >
                {/* Animated glow background based on memory type */}
                <div
                  className="absolute inset-0 opacity-[0.03] transition-colors duration-1000 z-0 pointer-events-none mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at top right, ${MemoryColor({ score: activeMemory.metadata?.score })}, transparent 50%)`,
                  }}
                />

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div
                      className="absolute inset-0 rounded-xl opacity-20 bg-current"
                      style={{
                        color: MemoryColor({
                          score: activeMemory.metadata?.score,
                        }),
                      }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-xl border border-current opacity-50"
                      style={{
                        color: MemoryColor({
                          score: activeMemory.metadata?.score,
                        }),
                      }}
                    ></div>
                    <MemoryIcon score={activeMemory.metadata?.score} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white font-sans tracking-tight drop-shadow-md">
                      {activeMemory.agent_name}
                    </h2>
                    <div className="items-center gap-3 text-xs uppercase tracking-widest font-bold mt-2 border border-white/5 bg-white/5 py-1 px-3 rounded-full inline-flex backdrop-blur-md">
                      <span
                        style={{
                          color: MemoryColor({
                            score: activeMemory.metadata?.score,
                          }),
                          textShadow: `0 0 10px ${MemoryColor({ score: activeMemory.metadata?.score })}80`,
                        }}
                      >
                        {activeMemory.market_regime || "decision"}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(activeMemory.created_at).toLocaleString()}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500 font-mono text-[10px] bg-black/50 px-2 py-0.5 rounded">
                        {activeMemory.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-xl p-6 mb-6 shadow-inner relative z-10 backdrop-blur-sm">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest mb-3 text-gray-400 flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: MemoryColor({
                          score: activeMemory.metadata?.score,
                        }),
                      }}
                    ></span>
                    Context & Deep Analysis
                  </h3>
                  <p className="text-base text-gray-300 leading-relaxed font-sans">
                    {activeMemory.ai_rationale}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                  <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors backdrop-blur-sm">
                    <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3 flex items-center gap-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-gray-400" />
                      Originating Node
                    </h3>
                    <span className="text-sm text-white font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                      {activeMemory.agent_name}
                    </span>
                  </div>
                  <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors backdrop-blur-sm">
                    <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">
                      Outcome Impact
                    </h3>
                    <span
                      className={`text-sm font-mono font-bold px-3 py-1.5 rounded-md border inline-block ${(activeMemory.metadata?.score ?? 0) > 0 ? "text-[#39ff14] bg-[#39ff14]/5 border-[#39ff14]/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]" : (activeMemory.metadata?.score ?? 0) < 0 ? "text-[#ff4500] bg-[#ff4500]/5 border-[#ff4500]/20 shadow-[0_0_10px_rgba(255,69,0,0.1)]" : "text-gray-400 bg-white/5 border-white/10"}`}
                    >
                      {activeMemory.metadata?.pnl
                        ? activeMemory.metadata.pnl
                        : "None"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-xs">
              {loading ? "Loading Memory Vault..." : "No memories to display."}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
