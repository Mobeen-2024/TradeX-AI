import React from "react";
import { motion } from "motion/react";
import { AgentPipeline } from "../ui/AgentPipeline";
import { Activity } from "lucide-react";

export function SystemTelemetryTab() {
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/30">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></div>
          <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 shadow-xl w-full">
        <AgentPipeline />
      </div>
    </motion.div>
  );
}
