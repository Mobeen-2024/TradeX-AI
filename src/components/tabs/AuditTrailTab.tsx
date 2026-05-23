import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Shield,
  AlertTriangle,
  Lock,
  Clock,
  History,
  Save,
  Download,
  AlertCircle,
  Database,
  Activity,
  Users,
  PowerOff,
  Play
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function AuditTrailTab() {
  const {
    lockOverrides,
    setLockOverrides,
    saveSessionSnapshot,
    loadSessionSnapshot,
    systemHealth,
    setSystemHealth,
    savedSnapshots,
    setSavedSnapshots,
    activePortfolio
  } = useSystemStore();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [snapshotLabel, setSnapshotLabel] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const fetchHealthAndAudit = useCallback(async () => {
    setLoading(true);
    try {
      const [healthRes, auditRes] = await Promise.all([
        fetch("/api/system/health"),
        fetch(`/api/system/audit?limit=100`)
      ]);
      if (healthRes.ok) {
        const health = await healthRes.json();
        setSystemHealth(health);
      }
      if (auditRes.ok) {
        const rawLogs = await auditRes.json();
        setLogs(rawLogs);
      }
    } catch (err) {
      console.error("Failed to fetch system logs/health", err);
    } finally {
      setLoading(false);
    }
  }, [setSystemHealth]);

  const fetchSnapshots = useCallback(async () => {
    if (!activePortfolio) return;
    try {
      const res = await fetch(`/api/system/snapshots?portfolioId=${activePortfolio.id}`);
      if (res.ok) {
        const data = await res.json();
        setSavedSnapshots(data);
      }
    } catch (err) {
      console.error("Failed to fetch snapshots", err);
    }
  }, [activePortfolio, setSavedSnapshots]);

  useEffect(() => {
    fetchHealthAndAudit();
    fetchSnapshots();
    const interval = setInterval(fetchHealthAndAudit, 30000);
    return () => clearInterval(interval);
  }, [fetchHealthAndAudit, fetchSnapshots]);

  const handleToggleLock = () => {
    setLockOverrides(!lockOverrides);
  };

  const handleKill = async () => {
    await fetch("/api/system/kill", { method: "POST" });
    fetchHealthAndAudit();
  };

  const handleResume = async () => {
    await fetch("/api/system/resume", { method: "POST" });
    fetchHealthAndAudit();
  };

  const handleSaveSnapshot = () => {
    if (!snapshotLabel) return alert("Please provide a label for the snapshot.");
    saveSessionSnapshot(snapshotLabel);
    setSnapshotLabel("");
    setTimeout(fetchSnapshots, 500);
  };

  const handleRestore = async () => {
    if (!selectedSnapshotId) return;
    try {
      const res = await fetch(`/api/system/snapshots/${selectedSnapshotId}`);
      if (res.ok) {
        const snapshotDetail = await res.json();
        loadSessionSnapshot(snapshotDetail.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    setIsExporting(true);
    let csv = "ID,Timestamp,Severity,Event Type,Source,Details\n";
    logs.forEach(log => {
      csv += `"${log.id}","${log.created_at}","${log.severity}","${log.event_type}","${log.source}","${JSON.stringify(log.details).replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'audit_logs.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExporting(false);
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
            <History className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-sans text-white tracking-tight">
              Governance Command Center
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              Safety Controls, Health Metrics & Immutable Audit Log
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        {/* PANEL 1 & 2: System Health and Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#00f0ff]" /> System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
                <span className="text-[10px] uppercase text-gray-500">Database Link</span>
                {systemHealth?.dbConnected ? (
                  <span className="text-xs font-bold text-[#39ff14] flex items-center gap-1"><Database className="w-3 h-3" /> ONLINE</span>
                ) : (
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1"><Database className="w-3 h-3" /> OFFLINE</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
                <span className="text-[10px] uppercase text-gray-500">DB Latency</span>
                <span className="text-xs font-mono font-bold text-gray-300">{systemHealth?.dbLatencyMs || 0} ms</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
                <span className="text-[10px] uppercase text-gray-500">WS Clients</span>
                <span className="text-xs font-mono font-bold text-[#00f0ff] flex items-center gap-1"><Users className="w-3 h-3" /> {systemHealth?.wsClientCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-gray-500">Circuit Breaker</span>
                {systemHealth?.circuitBreakerActive ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/50 font-bold uppercase tracking-wide animate-pulse">TRIPPED</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-gray-400 border border-blue-500/20 font-bold uppercase tracking-wide">ARMED</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#ffcc00]" /> Safety Controls
            </h3>
            <div className="space-y-4">
              <button 
                onClick={handleKill}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 font-bold text-red-500 text-xs uppercase tracking-widest transition"
              >
                <PowerOff className="w-4 h-4" /> Global Kill Switch
              </button>
              <button 
                onClick={handleResume}
                disabled={systemHealth?.isTradingEnabled}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#39ff14]/10 hover:bg-[#39ff14]/20 border border-[#39ff14]/30 font-bold text-[#39ff14] text-xs uppercase tracking-widest transition disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" /> Resume System
              </button>
              <button
                onClick={handleToggleLock}
                className={`w-full flex items-center justify-center gap-2 py-3 border rounded-sm transition-colors text-[10px] font-bold uppercase tracking-widest ${lockOverrides ? "border-[#ff6b00]/50 bg-[#ff6b00]/10 text-[#ff6b00]" : "border-gray-700 text-gray-400 hover:text-white"}`}
              >
                <Lock className="w-3 h-3" /> {lockOverrides ? "UI Overrides Locked" : "Lock UI Overrides"}
              </button>
            </div>
          </div>

          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Save className="w-4 h-4 text-[#a855f7]" /> Session Snapshots
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  value={snapshotLabel} 
                  onChange={(e) => setSnapshotLabel(e.target.value)} 
                  placeholder="Snapshot label..." 
                  className="bg-[#111] border border-[#333] px-3 py-2 text-xs outline-none focus:border-[#a855f7] flex-1 text-white" 
                />
                <button onClick={handleSaveSnapshot} className="px-3 bg-gray-800 hover:bg-gray-700 border border-[#333] text-gray-300 transition">
                  <Save className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 pt-3 border-t border-[#1a1a1a]">
                <select 
                  value={selectedSnapshotId} 
                  onChange={(e) => setSelectedSnapshotId(e.target.value)}
                  className="bg-[#111] border border-[#333] px-3 py-2 text-xs outline-none focus:border-[#a855f7] flex-1 text-white"
                >
                  <option value="">Select an older snapshot...</option>
                  {savedSnapshots?.map((s) => (
                    <option key={s.id} value={s.id}>{s.label} ({new Date(s.created_at).toLocaleDateString()})</option>
                  ))}
                </select>
                <button disabled={!selectedSnapshotId} onClick={handleRestore} className="px-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 transition disabled:opacity-20 disabled:cursor-not-allowed">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Immutable Audit Log */}
        <div className="lg:col-span-3 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 flex flex-col h-187.5 overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 border-b border-[#1a1a1a] pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
                Immutable DB Audit Log
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter Buttons */}
              <div className="flex bg-black/60 rounded border border-white/5 p-0.5">
                {["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"].map((sev) => {
                  const isActive = filterSeverity === sev;
                  return (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider uppercase transition-all duration-150 rounded-sm cursor-pointer ${
                        isActive
                          ? "bg-white/10 text-[#00f0ff] font-extrabold"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                placeholder="Filter by event..."
                className="bg-[#111] border border-[#333] px-3 py-1 text-xs outline-none focus:border-[#0f0] w-36 text-white"
              />
              <button onClick={handleExportCsv} disabled={isExporting} className="flex items-center gap-2 px-3 py-1 border border-gray-700 bg-[#111] hover:bg-[#222] text-xs text-gray-300 transition cursor-pointer">
                <Download className="w-3 h-3" /> EXPORT CSV
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px] space-y-2">
            {loading && logs.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 uppercase tracking-widest animate-pulse">
                Fetching logs...
              </div>
            ) : (() => {
              // 6. Show newest logs first (reverse order)
              const sortedLogs = [...logs].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );

              // Filter logs check
              const filteredLogs = sortedLogs.filter((log) => {
                if (filterSeverity !== "ALL" && log.severity !== filterSeverity) {
                  return false;
                }
                if (filterType && !log.event_type.toLowerCase().includes(filterType.toLowerCase())) {
                  return false;
                }
                return true;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="text-center text-gray-600 mt-10 uppercase tracking-widest text-[10px]">
                    No DB audit logs found matching criteria.
                  </div>
                );
              }

              return filteredLogs.map((log) => {
                // 4. Severity badge colors: INFO=gray, WARNING=yellow, ERROR=red, CRITICAL=red pulsing
                let badgeStyle = "bg-gray-500/10 text-gray-400 border border-gray-500/30";
                if (log.severity === "WARNING") {
                  badgeStyle = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30";
                } else if (log.severity === "ERROR") {
                  badgeStyle = "bg-red-500/10 text-red-500 border border-red-500/30";
                } else if (log.severity === "CRITICAL") {
                  badgeStyle = "bg-red-950/40 text-red-500 border border-red-500/40 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)]";
                }

                const detailsSummary = typeof log.details === "object"
                  ? JSON.stringify(log.details)
                  : String(log.details);

                return (
                  <div
                    key={log.id}
                    className="p-3 border border-[#1b1b1b]/50 bg-black/20 hover:bg-black/40 rounded-sm flex flex-col gap-2 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>

                        {/* Severity Badge */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${badgeStyle}`}>
                          {log.severity}
                        </span>

                        {/* Event Type */}
                        <span className="font-extrabold px-2 py-0.5 rounded bg-[#111]/80 border border-white/5 text-gray-200">
                          {log.event_type}
                        </span>
                      </div>

                      <span className="text-[9px] font-extrabold tracking-widest uppercase bg-black/40 px-2 py-0.5 border border-white/5 text-gray-500">
                        SRC: {log.source || "SYSTEM"}
                      </span>
                    </div>

                    {/* Details Summary */}
                    <div className="bg-[#050505]/60 p-2.5 rounded border border-[#111]">
                      <span className="text-gray-400 leading-relaxed block overflow-hidden text-ellipsis line-clamp-2 select-all font-mono text-[9px]">
                        {detailsSummary}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
