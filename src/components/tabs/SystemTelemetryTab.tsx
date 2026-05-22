import React, { useState } from "react";
import { motion } from "motion/react";
import { AgentPipeline } from "../ui/AgentPipeline";
import {
  Activity,
  Play,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Ban,
  Terminal,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function SystemTelemetryTab() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { telemetryFeed, activePortfolio } = useSystemStore();

  const handleTriggerPipeline = async () => {
    setIsTriggering(true);
    setError(null);
    try {
      if (!activePortfolio) throw new Error("No active portfolio to analyze.");

      const triggerRes = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: activePortfolio.id,
          useWorker: true,
          async: true,
        }),
      });

      if (!triggerRes.ok) {
        const data = await triggerRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to trigger pipeline");
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger pipeline");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <motion.div
      key="system-telemetry"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#00f0ff]" />
            System Telemetry
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time multi-agent execution pipeline monitoring via WebSocket.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTriggerPipeline}
            disabled={isTriggering || !activePortfolio}
            className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] rounded border border-[#00f0ff]/30 transition-colors text-sm font-bold disabled:opacity-50"
          >
            {isTriggering ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            TRIGGER SYNC
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/30">
            <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></div>
            <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-widest">
              Live Sync
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 shadow-xl w-full">
        <AgentPipeline />
      </div>

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm shadow-xl w-full">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="text-sm uppercase font-bold tracking-widest text-[#00f0ff] flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Raw Telemetry Stream
          </h2>
        </div>
        <div className="p-4 max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
          {telemetryFeed.length === 0 ? (
            <div className="text-gray-500 text-xs font-mono uppercase text-center py-4">
              Awaiting telemetry stream...
            </div>
          ) : (
            telemetryFeed.map((log) => (
              <div
                key={log.id}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-2 bg-[#111] rounded border border-[#222]"
              >
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest shrink-0 w-24 ${log.type === "ERROR" ? "text-[#ff4500]" : log.type === "WARNING" ? "text-[#facc15]" : "text-gray-500"}`}
                >
                  [{log.type}]
                </span>
                <span className="text-xs text-gray-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    fractionalSecondDigits: 3,
                  })}
                </span>
                <span className="text-xs text-white font-mono truncate">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
