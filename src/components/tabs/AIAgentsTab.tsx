import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  BrainCircuit,
  Activity,
  ShieldAlert,
  GitMerge,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Command,
  Clock,
  Network,
  Waves,
} from "lucide-react";
import { AIConfidenceRing } from "../ui/AIConfidenceRing";
import { useSystemStore } from "../../store/systemStore";
import { OverrideAnalyticsPanel } from "../ui/OverrideAnalyticsPanel";
import { Skeleton } from "../ui/Skeleton";

const AGENT_DEFINITIONS = [
  {
    id: "Coordinator",
    name: "Master Director",
    role: "Orchestration",
    color: "#00f0ff",
  },
  {
    id: "QuantAgent",
    name: "Quant Engine v4",
    role: "Data & Signals",
    color: "#a855f7",
  },
  {
    id: "RiskGuardian",
    name: "Risk Guardian",
    role: "Constraints",
    color: "#facc15",
  },
  {
    id: "ExecutionAgent",
    name: "Execution Agent",
    role: "Execution",
    color: "#39ff14",
  },
] as const;

export function AIAgentsTab() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("Coordinator");
  const { agentStates, telemetryFeed, setActiveCorrelationId } =
    useSystemStore();

  const isAgentStatesAllIdle = Object.values(agentStates).length === 0 || Object.values(agentStates).every((state) => state.status === "idle" || !state.status);
  const isInitializing = isAgentStatesAllIdle && telemetryFeed.length === 0;

  const selectedAgentDef =
    AGENT_DEFINITIONS.find((a) => a.id === selectedAgentId) ||
    AGENT_DEFINITIONS[0];
  const selectedAgentState = agentStates[selectedAgentId] || {
    status: "idle",
    lastMessage: "Awaiting data",
  };

  // Filter feed for agent logs
  const agentLogs = telemetryFeed.filter((t) => t.type === "AGENT_DECISION");

  return (
    <motion.div
      key="ai-agents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6"
    >
      {/* HEADER / AI GLOBAL STATUS */}
      <div className="bg-[#050505] border border-[#1a1a1a] p-5 rounded-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_0_40px_rgba(0,240,255,0.02)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00f0ff] shadow-[0_0_20px_#00f0ff]"></div>

        <div className="pl-4">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans mb-1">
            <BrainCircuit className="w-8 h-8 text-[#00f0ff]" />
            AI Command Center
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
            System Online &middot; Autonomous Mode Engaged
          </p>
        </div>

        <div className="flex gap-6 pr-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Network className="w-3 h-3 text-[#a855f7]" /> Active Tasks
            </span>
            <span className="text-white font-mono text-xl">
              {telemetryFeed.length}
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: AGENTS & THINKING PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* AGENTS LIST (Left Col) */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#0ea5e9] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Agent Subsystems
            </h3>
            <span className="text-[9px] bg-[#111] text-gray-500 px-2 py-0.5 rounded border border-[#222]">
              4 ONLINE
            </span>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            {isInitializing ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col p-4 rounded-sm border border-[#1a1a1a] bg-[#050505] w-full gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5 w-2/3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="bg-[#0a0a0a] p-2 rounded border border-[#111] flex justify-between items-center">
                    <div className="flex flex-col gap-1.5 w-3/4">
                      <Skeleton className="h-2 w-12" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="w-7 h-7 rounded-sm" />
                  </div>
                </div>
              ))
            ) : (
              AGENT_DEFINITIONS.map((agentDef) => {
                const state = agentStates[agentDef.id] || {
                  status: "idle",
                  lastMessage: "Idle",
                };
                const confidence = state.status === "running" ? 85 : 95; // derived for visual

                return (
                  <motion.button
                    key={agentDef.id}
                    onClick={() => setSelectedAgentId(agentDef.id)}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    animate={{
                      borderLeftWidth:
                        selectedAgentId === agentDef.id ? "4px" : "1px",
                      borderLeftColor:
                        selectedAgentId === agentDef.id
                          ? agentDef.color
                          : "rgba(26,26,26,1)",
                      borderColor:
                        selectedAgentId === agentDef.id
                          ? `${agentDef.color}40`
                          : "rgba(26,26,26,1)",
                      backgroundColor:
                        selectedAgentId === agentDef.id
                          ? `${agentDef.color}10`
                          : "rgba(5,5,5,1)",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="group flex flex-col p-4 rounded-sm border text-left w-full hover:border-[#333]"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div>
                        <h4 className="text-gray-200 text-sm font-bold font-sans group-hover:text-white transition-colors">
                          {agentDef.name}
                        </h4>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          {agentDef.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                          {state.status === "running" && (
                            <span
                              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                              style={{ backgroundColor: agentDef.color }}
                            ></span>
                          )}
                          <span
                            className="relative inline-flex rounded-full h-2 w-2"
                            style={{ backgroundColor: agentDef.color }}
                          ></span>
                        </div>
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{ color: agentDef.color }}
                        >
                          {state.status}
                        </span>
                      </div>
                    </div>

                    <div className="w-full mt-1">
                      <div className="flex justify-between items-center bg-[#0a0a0a] p-2 rounded-sm border border-[#1a1a1a] mb-2">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">
                            Neural Sync
                          </span>
                          <span className="text-[10px] font-mono text-gray-300 truncate">
                            {state.lastMessage || "Awaiting task..."}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center justify-center pl-2">
                          <AIConfidenceRing
                            confidence={confidence}
                            size={28}
                            theme={
                              agentDef.color === "#39ff14"
                                ? "green"
                                : agentDef.color === "#00f0ff"
                                  ? "cyan"
                                  : agentDef.color === "#a855f7"
                                    ? "purple"
                                    : "amber"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </motion.div>
        </div>

        {/* AI THINKING PANEL (Right Col) */}
        <div className="col-span-1 xl:col-span-8 flex flex-col">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden flex-1 shadow-2xl flex flex-col h-100">
            {/* Dynamic background based on selected agent */}
            <div
              className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none opacity-10 transition-colors duration-1000"
              style={{ backgroundColor: selectedAgentDef.color }}
            ></div>

            <div className="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4 sticky z-10">
              <h3 className="text-gray-300 font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                <Eye
                  className="w-5 h-5 text-current"
                  style={{ color: selectedAgentDef.color }}
                />
                Internal Reasoning — {selectedAgentDef.name}
              </h3>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">
                    Confidence
                  </span>
                  <AIConfidenceRing
                    confidence={
                      selectedAgentState.status === "running" ? 85 : 95
                    }
                    size={44}
                    theme={
                      selectedAgentDef.color === "#00f0ff"
                        ? "cyan"
                        : selectedAgentDef.color === "#a855f7"
                          ? "purple"
                          : selectedAgentDef.color === "#facc15"
                            ? "amber"
                            : "green"
                    }
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">
                    Uncertainty
                  </span>
                  <div className="w-10 h-10 rounded-full border border-[#ff4500]/30 bg-[#ff4500]/5 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-[#ff4500]/10 animate-pulse"></div>
                    <span className="text-xs font-bold text-[#ff4500]">
                      {(
                        100 -
                        (selectedAgentState.status === "running" ? 85 : 95)
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning Stream Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-xs space-y-4 pr-4 mb-4 flex flex-col justify-center">
              {isInitializing ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Cpu className="w-8 h-8 mb-3 text-[#0ea5e9] animate-spin" />
                  <p className="font-mono text-sm font-bold">Agents initializing...</p>
                  <p className="font-mono text-xs text-gray-500 mt-1">Establishing neural connections with coordinator</p>
                </div>
              ) : (
                <AnimatePresence mode="sync">
                  {agentLogs
                    .filter((log) => log.message.startsWith(selectedAgentId))
                    .map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`border-l-2 pl-4 py-2 mt-4 bg-[#111]/50 border border-[#222]`}
                        style={{
                          borderLeftColor: selectedAgentDef.color,
                        }}
                      >
                        <div className="text-[10px] text-gray-500 mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Command
                              className="w-3 h-3"
                              style={{ color: selectedAgentDef.color }}
                            />
                            <span style={{ color: selectedAgentDef.color }}>
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour12: false,
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                fractionalSecondDigits: 3,
                              })}
                            </span>
                          </div>
                          {log.metadata?.correlation_id && (
                            <button
                              onClick={() =>
                                setActiveCorrelationId(
                                  log.metadata.correlation_id,
                                )
                              }
                              className="bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#a855f7] px-2 py-0.5 rounded text-[8px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                              <Network className="w-2.5 h-2.5" /> Trace
                            </button>
                          )}
                        </div>
                        <div className="text-gray-300">
                          {log.message.replace(`${selectedAgentId}: `, "")}
                        </div>
                      </motion.div>
                    ))}
                  {agentLogs.filter((log) =>
                    log.message.startsWith(selectedAgentId),
                  ).length === 0 && (
                    <div className="text-gray-600 italic mt-4 text-center">
                      Waiting for telemetry from {selectedAgentDef.name}...
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
            <div className="pt-4 border-t border-[#1a1a1a] flex justify-between items-center relative z-10 shrink-0">
              <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${selectedAgentState.status === "running" ? "bg-[#39ff14] animate-pulse" : "bg-gray-500"}`}
                ></span>
                Agent {selectedAgentState.status}
              </div>
              <button className="flex items-center gap-2 bg-[#ff4500]/10 hover:bg-[#ff4500]/20 text-[#ff4500] border border-[#ff4500]/30 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(255,69,0,0.1)]">
                <ShieldAlert className="w-3 h-3" />
                Manual Override
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERRIDE FEEDBACK LAYER */}
      <div className="mb-8">
        <OverrideAnalyticsPanel />
      </div>

      {/* BOTTOM SECTION: DECISION FLOW TIMELINE */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative">
        <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-[#1a1a1a] pb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          System Pipeline Timeline (Live Telemetry)
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.75 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-[#333] before:to-transparent pt-4">
          <AnimatePresence>
            {telemetryFeed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 w-full">
                <Clock className="w-8 h-8 mb-3 opacity-30" />
                <p className="font-mono text-sm">No data available</p>
                <p className="font-mono text-xs mt-1">System is initializing or no records exist</p>
              </div>
            )}
            {telemetryFeed.slice(0, 15).map((log, i) => {
              const parsedName = log.message.split(":")[0] || "";
              const agentDef =
                AGENT_DEFINITIONS.find((a) => parsedName === a.id) ||
                AGENT_DEFINITIONS[0];
              const Icon = Activity;
              const color = agentDef.color;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#0a0a0a] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"
                    style={{
                      color,
                      boxShadow: `0 0 10px ${color}40`,
                      borderColor: "#1a1a1a",
                    }}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#1a1a1a] shadow hover:border-[#333] transition-colors">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div
                        className="font-bold text-gray-200 text-sm md:group-odd:text-right md:group-even:text-left"
                        style={{ color }}
                      >
                        {agentDef.name}
                      </div>
                      <time className="text-[10px] text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour12: false,
                        })}
                      </time>
                    </div>
                    <div className="text-gray-500 text-xs md:group-odd:text-right md:group-even:text-left pt-1 font-mono uppercase">
                      [{log.type}]
                    </div>
                    <div className="text-gray-300 text-xs md:group-odd:text-right md:group-even:text-left mt-2">
                      {log.message.replace(`${parsedName}: `, "")}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
