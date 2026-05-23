import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSystemStore } from "../../store/systemStore";

type StageStatus = "pending" | "processing" | "completed" | "failed";

interface StageState {
  status: StageStatus;
  timestamp?: number;
  summary?: string;
}

interface PipelineRun {
  correlationId: string;
  startTime: number;
  stages: Record<string, StageState>;
  finalDecision?: "BUY" | "SELL" | "HOLD" | string;
}

const STAGES = [
  "QuantAgent",
  "RiskGuardian",
  "NewsOracle",
  "Coordinator",
  "ExecutionAgent",
];

export function AgentPipeline({
  correlationIdFilter,
}: {
  correlationIdFilter?: string;
}) {
  const { telemetryFeed } = useSystemStore();
  const endRef = useRef<HTMLDivElement>(null);

  // Derive runs from the centralized telemetryFeed
  const runs = useMemo(() => {
    const runMap: Record<string, PipelineRun> = {};

    // Process from oldest to newest to build state correctly
    const reversedFeed = [...telemetryFeed].reverse();

    reversedFeed.forEach((msg) => {
      const cid = msg.correlationId;
      if (!cid || cid === "unknown") return;
      if (correlationIdFilter && cid !== correlationIdFilter) return;

      if (!runMap[cid]) {
        runMap[cid] = {
          correlationId: cid,
          startTime: msg.timestamp,
          stages: {
            QuantAgent: { status: "pending" },
            RiskGuardian: { status: "pending" },
            NewsOracle: { status: "pending" },
            Coordinator: { status: "pending" },
            ExecutionAgent: { status: "pending" },
          },
        };
      }

      const run = runMap[cid];

      const agentMap: Record<string, string> = {
        QuantAgent: "QuantAgent",
        RiskGuardian: "RiskGuardian",
        NewsOracle: "NewsOracle",
        Coordinator: "Coordinator",
        ExecutionAgent: "ExecutionAgent",
      };

      const agentName = agentMap[msg.agent || ""] || msg.agent;
      if (agentName && run.stages[agentName]) {
        // Infer status from metadata or message if backend doesn't send explicit status in metadata
        let status: StageStatus = "processing";
        if (
          msg.metadata?.status === "completed" ||
          msg.type === "EXECUTION" ||
          msg.type === "RISK_ALERT"
        ) {
          status = "completed";
        } else if (msg.metadata?.status === "failed") {
          status = "failed";
        } else if (msg.metadata?.status === "started") {
          status = "processing";
        } else if (msg.type === "AGENT_DECISION") {
          if (msg.metadata && msg.metadata.status) {
            const sMap: any = {
              started: "processing",
              completed: "completed",
              failed: "failed",
            };
            status = sMap[msg.metadata.status] || "completed";
          } else {
            status = "completed";
          }
        }

        run.stages[agentName] = {
          status,
          timestamp: msg.timestamp,
          summary: msg.message,
        };

        if (agentName === "Coordinator" && status === "completed") {
          if (msg.message.includes("BUY")) run.finalDecision = "BUY";
          else if (msg.message.includes("SELL")) run.finalDecision = "SELL";
          else if (msg.message.includes("HOLD")) run.finalDecision = "HOLD";
        }
      }
    });

    return runMap;
  }, [telemetryFeed, correlationIdFilter]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [runs]);

  const sortedRuns = (Object.values(runs) as PipelineRun[]).sort(
    (a, b) => a.startTime - b.startTime,
  );

  return (
    <div className="flex flex-col gap-6">
      {sortedRuns.length === 0 ? (
        <div className="flex items-center justify-center p-12 border border-dashed border-[#1a1a1a] rounded-sm bg-[#050505]">
          <div className="flex flex-col items-center gap-3">
            <Activity className="w-6 h-6 text-gray-600 animate-pulse" />
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Waiting for Telemetry Events...
            </p>
          </div>
        </div>
      ) : (
        sortedRuns.map((run) => (
          <PipelineCard key={run.correlationId} run={run} />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}

const PipelineCard: React.FC<{ run: PipelineRun }> = ({ run }) => {
  const formatTime = (ts?: number) => {
    if (!ts) return "--:--:--";
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col font-mono shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            Execution ID
          </span>
          <span className="text-gray-300 text-sm tracking-tight">
            {run.correlationId}
          </span>
        </div>

        {run.finalDecision && (
          <div
            className={cn(
              "px-4 py-2 rounded flex items-center gap-2 border font-bold text-xs tracking-widest",
              run.finalDecision === "BUY"
                ? "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30"
                : run.finalDecision === "SELL"
                  ? "bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/30"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/30",
            )}
          >
            {run.finalDecision === "BUY" && <TrendingUp className="w-4 h-4" />}
            {run.finalDecision === "SELL" && (
              <TrendingDown className="w-4 h-4" />
            )}
            {run.finalDecision === "HOLD" && <Minus className="w-4 h-4" />}
            {run.finalDecision}
          </div>
        )}
      </div>

      {/* Stages Pipeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-6 right-6 h-[2px] bg-[#1a1a1a] -z-10 hidden md:block"></div>
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative z-10">
          {STAGES.map((stageName, index) => {
            const stage = run.stages[stageName] || { status: "pending" };
            const isActive = stage.status === "processing";
            const isCompleted = stage.status === "completed";
            const isFailed = stage.status === "failed";

            return (
              <div
                key={stageName}
                className="flex flex-col flex-1 relative group"
              >
                <div className="flex items-center gap-4 md:flex-col md:text-center md:items-center">
                  {/* Node Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors shadow-lg bg-[#050505]",
                      isCompleted
                        ? "border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : isActive
                          ? "border-[#facc15] text-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                          : isFailed
                            ? "border-[#ff4500] text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.2)]"
                            : "border-[#1a1a1a] text-[#333]",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isFailed ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex flex-col md:items-center mt-0 md:mt-3">
                    <span
                      className={cn(
                        "font-bold text-xs uppercase tracking-widest mb-1",
                        isCompleted
                          ? "text-[#00f0ff]"
                          : isActive
                            ? "text-[#facc15]"
                            : isFailed
                              ? "text-[#ff4500]"
                              : "text-gray-600",
                      )}
                    >
                      {stageName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {formatTime(stage.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Summary Box */}
                {stage.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-3 md:mt-4 p-3 rounded text-[10px] sm:text-xs leading-relaxed border ml-14 md:ml-0 shadow-sm",
                      isCompleted
                        ? "bg-[#00f0ff]/5 border-[#00f0ff]/20 text-gray-300"
                        : isActive
                          ? "bg-[#facc15]/5 border-[#facc15]/20 text-gray-300"
                          : isFailed
                            ? "bg-[#ff4500]/5 border-[#ff4500]/20 text-[#ff4500]"
                            : "bg-[#111] border-[#222] text-gray-500",
                    )}
                  >
                    {stage.summary}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
