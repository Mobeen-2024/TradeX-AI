import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AgentPipeline } from "../ui/AgentPipeline";
import { Activity, Play, ShieldAlert, AlertTriangle, CheckCircle, Ban } from "lucide-react";

export function SystemTelemetryTab() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch("/api/system/status");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data.controls);
        setAuditLogs(data.auditLogs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleKillSwitch = async () => {
    if (!systemStatus) return;
    try {
      if (systemStatus.is_trading_enabled) {
         await fetch("/api/system/kill", { method: "POST" });
      } else {
         await fetch("/api/system/resume", { method: "POST" });
      }
      await fetchSystemStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerPipeline = async () => {
    setIsTriggering(true);
    setError(null);
    try {
      // Fetch user's first portfolio or default to something
      let resPortfolio = await fetch("/api/portfolio/me");
      if (!resPortfolio.ok) throw new Error("Failed to fetch portfolios");
      const contentType = resPortfolio.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Received non-JSON response from server");
      }
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
        const createType = createRes.headers.get("content-type");
        if (!createType || !createType.includes("application/json")) {
           throw new Error("Invalid response creating portfolio");
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
            onClick={handleToggleKillSwitch}
            className={`flex items-center gap-2 px-4 py-2 ${!systemStatus?.is_trading_enabled ? "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30" : "bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/30"} rounded border transition-colors text-sm font-bold`}
          >
            {!systemStatus?.is_trading_enabled ? (
              <><CheckCircle className="w-4 h-4" /> RESUME TRADING</>
            ) : (
              <><Ban className="w-4 h-4" /> GLOBAL KILL SWITCH</>
            )}
          </button>
          <button
            onClick={handleTriggerPipeline}
            disabled={isTriggering || !systemStatus?.is_trading_enabled}
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
        {systemStatus?.circuit_breaker_active && (
            <div className="mb-4 bg-[#ff4500]/10 border border-[#ff4500]/30 text-[#ff4500] p-4 rounded-sm flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0 inline-block animate-pulse" />
                <div>
                    <h3 className="font-bold">CIRCUIT BREAKER ENGAGED</h3>
                    <p className="text-sm">Multiple subsequent failures detected in the Intelligence Routing Core. Global execution has been automatically paused. Operations intervention required to resume.</p>
                </div>
            </div>
        )}
        <AgentPipeline />
      </div>

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm shadow-xl w-full">
         <div className="p-4 border-b border-[#1a1a1a]">
           <h2 className="text-sm uppercase font-bold tracking-widest text-[#00f0ff] flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Audit Trail (Compliance)
           </h2>
         </div>
         <div className="p-4 max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
            {auditLogs.length === 0 ? (
                <div className="text-gray-500 text-xs font-mono uppercase text-center py-4">No audit logs established.</div>
            ) : auditLogs.map((log: any) => (
                <div key={log.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-2 bg-[#111] rounded border border-[#222]">
                   <span className={`text-[10px] uppercase font-bold tracking-widest shrink-0 w-24 ${log.severity === 'CRITICAL' || log.severity === 'ERROR' ? 'text-[#ff4500]' : log.severity === 'WARNING' ? 'text-[#facc15]' : 'text-gray-500'}`}>
                       [{log.severity}]
                   </span>
                   <span className="text-xs text-gray-400 shrink-0 font-mono">
                      {new Date(log.created_at).toLocaleTimeString()}
                   </span>
                   <span className="text-xs font-bold text-[#00f0ff] uppercase shrink-0 w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                      {log.event_type}
                   </span>
                   <span className="text-xs text-gray-500 font-mono truncate">
                      {JSON.stringify(log.details)}
                   </span>
                </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
