import React, { useEffect, useState, useRef } from "react";
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

interface TelemetryMessage {
  correlationId: string;
  agent_name: string;
  status: "started" | "completed" | "failed";
  timestamp: string;
  eventType: string;
  summary: string;
}

type StageStatus = "pending" | "processing" | "completed" | "failed";

interface StageState {
  status: StageStatus;
  timestamp?: string;
  summary?: string;
}

interface PipelineRun {
  correlationId: string;
  startTime: number;
  stages: Record<string, StageState>;
  finalDecision?: "BUY" | "SELL" | "HOLD" | string;
}

const STAGES = ["QuantAgent", "RiskGuardian", "NewsOracle", "Coordinator"];

export function AgentPipeline({ correlationIdFilter }: { correlationIdFilter?: string }) {
  const [runs, setRuns] = useState<Record<string, PipelineRun>>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine the WS URL (handling dev/prod domain appropriately)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let wsUrl = `${protocol}//${window.location.host}/ws/agent-telemetry`;
    if (correlationIdFilter) {
      wsUrl += `?correlationId=${encodeURIComponent(correlationIdFilter)}`;
    }

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg: TelemetryMessage = JSON.parse(event.data);
        if (!msg.correlationId || msg.correlationId === "unknown") return;

        setRuns((prev) => {
          const runId = msg.correlationId;
          const currentRun = prev[runId] || {
            correlationId: runId,
            startTime: new Date(msg.timestamp).getTime(),
            stages: {
              QuantAgent: { status: "pending" },
              RiskGuardian: { status: "pending" },
              NewsOracle: { status: "pending" },
              Coordinator: { status: "pending" },
            },
          };

          const statusMap: Record<string, StageStatus> = {
            started: "processing",
            completed: "completed",
            failed: "failed",
          };

          const newStageStatus = statusMap[msg.status] || "pending";
          const newStages = { ...currentRun.stages };

          newStages[msg.agent_name] = {
            status: newStageStatus,
            timestamp: msg.timestamp,
            summary: msg.summary,
          };

          let finalDecision = currentRun.finalDecision;
          if (msg.agent_name === "Coordinator" && msg.status === "completed") {
            if (msg.summary.includes("BUY")) finalDecision = "BUY";
            else if (msg.summary.includes("SELL")) finalDecision = "SELL";
            else if (msg.summary.includes("HOLD")) finalDecision = "HOLD";
          }

          return {
            ...prev,
            [runId]: {
              ...currentRun,
              stages: newStages,
              finalDecision,
            },
          };
        });
      } catch (e) {
        console.error("AgentPipeline JSON parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [correlationIdFilter]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [runs]);

  const sortedRuns = (Object.values(runs) as PipelineRun[]).sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="flex flex-col gap-6">
      {sortedRuns.length === 0 ? (
        <div className="flex items-center justify-center p-12 border border-dashed border-[#1a1a1a] rounded-sm bg-[#050505]">
          <div className="flex flex-col items-center gap-3">
            <Activity className="w-6 h-6 text-gray-600 animate-pulse" />
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Waiting for Telemetry Events...</p>
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

function PipelineCard({ run }: { run: PipelineRun }) {
  const formatTime = (iso?: string) => {
    if (!iso) return "--:--:--";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
  };

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col font-mono shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Execution ID</span>
          <span className="text-gray-300 text-sm tracking-tight">{run.correlationId}</span>
        </div>

        {run.finalDecision && (
          <div className={cn(
            "px-4 py-2 rounded flex items-center gap-2 border font-bold text-xs tracking-widest",
            run.finalDecision === "BUY" ? "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30" :
              run.finalDecision === "SELL" ? "bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/30" :
                "bg-gray-500/10 text-gray-400 border-gray-500/30"
          )}>
            {run.finalDecision === "BUY" && <TrendingUp className="w-4 h-4" />}
            {run.finalDecision === "SELL" && <TrendingDown className="w-4 h-4" />}
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
              <div key={stageName} className="flex flex-col flex-1 relative group">
                <div className="flex items-center gap-4 md:flex-col md:text-center md:items-center">
                  {/* Node Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors shadow-lg bg-[#050505]",
                    isCompleted ? "border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]" :
                      isActive ? "border-[#facc15] text-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.2)]" :
                        isFailed ? "border-[#ff4500] text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.2)]" :
                          "border-[#1a1a1a] text-[#333]"
                  )}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                      isActive ? <Loader2 className="w-5 h-5 animate-spin" /> :
                        isFailed ? <XCircle className="w-5 h-5" /> :
                          <Circle className="w-5 h-5" />}
                  </div>

                  {/* Stage Info */}
                  <div className="flex flex-col md:items-center mt-0 md:mt-3">
                    <span className={cn(
                      "font-bold text-xs uppercase tracking-widest mb-1",
                      isCompleted ? "text-[#00f0ff]" :
                        isActive ? "text-[#facc15]" :
                          isFailed ? "text-[#ff4500]" :
                            "text-gray-600"
                    )}>
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
                      isCompleted ? "bg-[#00f0ff]/5 border-[#00f0ff]/20 text-gray-300" :
                        isActive ? "bg-[#facc15]/5 border-[#facc15]/20 text-gray-300" :
                          isFailed ? "bg-[#ff4500]/5 border-[#ff4500]/20 text-[#ff4500]" :
                            "bg-[#111] border-[#222] text-gray-500"
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
}
