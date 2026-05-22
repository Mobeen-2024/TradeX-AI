import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Shield,
  Server,
  Database,
  Save,
  Power,
  Activity,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function SystemConfigurationTab() {
  const [config, setConfig] = useState<any>({
    is_trading_enabled: true,
    circuit_breaker_active: false,
  });
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setConfig(data.controls || {});
          setLogs(data.auditLogs || []);
        }
      } catch (err) {
        console.error("Error fetching system status", err);
      }
    };
    fetchConfig();
  }, []);

  const handleToggleKillSwitch = async () => {
    setSaving(true);
    try {
      if (!config.circuit_breaker_active) {
        await fetch("/api/system/kill", { method: "POST" });
        setConfig({
          ...config,
          circuit_breaker_active: true,
          is_trading_enabled: false,
        });
      } else {
        await fetch("/api/system/resume", { method: "POST" });
        setConfig({
          ...config,
          circuit_breaker_active: false,
          is_trading_enabled: true,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col min-h-full py-8 text-white w-full font-mono"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Settings className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-sans text-white tracking-tight">
              System Configuration
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              Kernel settings and module integrations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a] pb-2">
            <Shield className="w-4 h-4 text-[#facc15]" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
              Global Security Overrides
            </h3>
          </div>

          <div className="px-4 py-3 bg-[#111] rounded border border-[#222] flex justify-between items-center group">
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-bold font-sans">
                Global Kill Switch
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-500">
                Disconnect ALL API access & flag circuit breaker
              </span>
            </div>
            <button
              onClick={handleToggleKillSwitch}
              disabled={saving}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${config.circuit_breaker_active ? "bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.3)]" : "bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14]"}`}
            >
              <Power className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase font-bold">
                {config.circuit_breaker_active ? "ENGAGED" : "ARMED"}
              </span>
            </button>
          </div>

          <div className="px-4 py-3 bg-[#111] rounded border border-[#222] flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#00f0ff] font-bold font-mono">
                Trading Subsystem
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-500">
                {config.is_trading_enabled ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <div
              className={`h-1.5 w-full rounded-full ${config.is_trading_enabled ? "bg-[#39ff14]" : "bg-red-500"} shadow-[0_0_10px_rgba(57,255,20,0.5)]`}
            ></div>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a] pb-2 shrink-0">
            <Activity className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
              System Audit Logs
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar font-mono text-[10px]">
            {logs.length === 0 ? (
              <div className="text-center text-gray-600 mt-10">
                No recent audit logs.
              </div>
            ) : (
              [...logs].reverse().map((log: any, i) => (
                <div
                  key={i}
                  className="mb-2 pb-2 border-b border-[#111] flex justify-between group"
                >
                  <div className="flex">
                    <span className="text-gray-500 w-16 opacity-70 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-2 ${(log.action || "").includes("KILL") ? "text-red-500" : "text-[#00f0ff]"}`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <span className="text-gray-500 truncate text-right">
                    {log.details}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
