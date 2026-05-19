import React, { useState } from "react";
import { motion } from "motion/react";
import { AgentPipeline } from "../ui/AgentPipeline";
import { Activity, Play } from "lucide-react";

export function SystemTelemetryTab() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerPipeline = async () => {
    setIsTriggering(true);
    setError(null);
    try {
      // Fetch user's first portfolio or default to something
      let resPortfolio = await fetch("/api/portfolio/me");
      if (!resPortfolio.ok) throw new Error("Failed to fetch portfolios");
      let portfolios = await resPortfolio.json();
      let portfolioId = portfolios.portfolios?.[0]?.id;

      if (!portfolioId) {
        // Create one just to have it
        const createRes = await fetch("/api/portfolio/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Portfolio",
            description: "Auto generated"
          })
        });
        if (!createRes.ok) {
          throw new Error("Failed to auto-create portfolio");
        }
        const createData = await createRes.json();
        portfolioId = createData.portfolio.id;
      }

      const triggerRes = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          portfolioId,
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
            disabled={isTriggering}
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
            <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-widest">Live Sync</span>
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
    </motion.div>
  );
}
