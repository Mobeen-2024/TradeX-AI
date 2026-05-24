import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Activity,
  Shield,
  Cpu,
  Play,
  Save,
  Network,
  Power,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";
import { useToastStore } from "../../store/toastStore";
import { authFetch } from "../../lib/authFetch";

// ─────────────────────────────────────────────────────────────────────────────
// Simple debounce hook — returns a ref-stable debounced wrapper so async
// mutations cannot be fired faster than `delay` ms.
// ─────────────────────────────────────────────────────────────────────────────
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;
}

interface DecisionOverride {
  id: string;
  portfolio_id: string;
  correlation_id: string;
  asset_id: string;
  original_action: string;
  original_size: number;
  original_rationale: string;
  override_action?: string | null;
  override_size?: number | null;
  status: "PENDING" | "EXECUTED" | "DISCARDED";
  created_at: string;
}

export function AutoTradingTab() {
  const {
    activePortfolio: portfolio,
    telemetryFeed,
    setActiveCorrelationId,
  } = useSystemStore();

  const { addToast } = useToastStore();

  const [executionMode, setExecutionMode] = useState<"AUTO" | "SEMI_AUTO" | "SIMULATION">("AUTO");
  const [limits, setLimits] = useState({
    maxPositionSize: 0,
    maxLoss: 0,
    isTradingEnabled: false,
  });

  // Per-action loading guards — prevents double-submit for every async op
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingMode, setChangingMode] = useState(false);
  const [haltingSystem, setHaltingSystem] = useState(false);
  const [executingOverride, setExecutingOverride] = useState<string | null>(null);

  const [pendingOverrides, setPendingOverrides] = useState<DecisionOverride[]>([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [selectedOverrideId, setSelectedOverrideId] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState<"BUY" | "SELL">("BUY");
  const [customSize, setCustomSize] = useState<number>(0);

  // ── Sync local form from portfolio store ─────────────────────────────────
  useEffect(() => {
    if (portfolio) {
      setLimits({
        maxPositionSize: (portfolio as any).max_position_size || 0,
        maxLoss: (portfolio as any).max_loss || 0,
        isTradingEnabled: (portfolio as any).is_trading_enabled || false,
      });
      const dbMode = (portfolio as any).execution_mode || "AUTO";
      setExecutionMode(dbMode as any);
    }
  }, [portfolio]);

  // ── Fetch pending overrides ───────────────────────────────────────────────
  const fetchPendingOverrides = useCallback(async () => {
    if (!portfolio) return;
    setLoadingOverrides(true);
    try {
      const res = await authFetch(`/api/overrides/pending?portfolioId=${portfolio.id}`);
      const data = await res.json();
      setPendingOverrides(data);
    } catch (e: any) {
      // Silently suppress — polling failures should not spam the user
      console.error("Failed to fetch pending overrides:", e);
    } finally {
      setLoadingOverrides(false);
    }
  }, [portfolio]);

  useEffect(() => {
    fetchPendingOverrides();
    const timer = setInterval(fetchPendingOverrides, 5000);
    return () => clearInterval(timer);
  }, [fetchPendingOverrides]);

  // ── Save constraints ──────────────────────────────────────────────────────
  // FIX #1 / #6 / #7: Uses authFetch, has a loading guard, and resolves the
  // stale-closure race by accepting the exact values to persist as a parameter
  // rather than reading from state that may not have flushed yet.
  const saveSettings = async (overrideLimits?: typeof limits) => {
    if (!portfolio || savingSettings) return;
    const toSave = overrideLimits ?? limits;
    setSavingSettings(true);
    try {
      await authFetch(`/api/portfolio/${portfolio.id}/settings`, {
        method: "POST",
        body: JSON.stringify({
          is_trading_enabled: toSave.isTradingEnabled,
          max_position_size: toSave.maxPositionSize,
          max_loss: toSave.maxLoss,
        }),
      });
      addToast("success", "Constraints saved successfully.");
    } catch (e: any) {
      addToast("error", `Failed to save settings: ${e.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Emergency halt ────────────────────────────────────────────────────────
  // FIX #3: Replaces browser-blocking `alert()` with a toast + Zustand state.
  // FIX #1: Passes the exact next-state object to saveSettings so there is no
  // async closure capturing stale `limits` value.
  const handleEmergencyHalt = async () => {
    if (!portfolio || haltingSystem) return;
    setHaltingSystem(true);
    try {
      const haltedLimits = { ...limits, isTradingEnabled: false };
      setLimits(haltedLimits);
      // Both calls sequentially — mode first, then persist settings
      await handleModeChange("SIMULATION", true /* skipSettingsSave */);
      await saveSettings(haltedLimits);
      addToast(
        "warning",
        "EMERGENCY HALT: System switched to SIMULATION mode. All live executions revoked.",
        8000,
      );
    } catch (e: any) {
      addToast("error", `Emergency halt partially failed: ${e.message}`);
    } finally {
      setHaltingSystem(false);
    }
  };

  // ── Mode change ───────────────────────────────────────────────────────────
  // FIX #2: Debounced at 400 ms so rapid clicks cannot fire parallel PUTs.
  // FIX #7: `changingMode` guard disables the mode buttons while in-flight.
  // FIX #10: `isTradingEnabled` is set correctly for all three modes.
  const _handleModeChange = async (
    mode: "AUTO" | "SEMI_AUTO" | "SIMULATION",
    skipSettingsSave = false,
  ) => {
    if (!portfolio || changingMode) return;
    setChangingMode(true);
    try {
      await authFetch(`/api/overrides/portfolio/${portfolio.id}/mode`, {
        method: "PUT",
        body: JSON.stringify({ mode }),
      });
      setExecutionMode(mode);

      // Determine the correct trading-enabled state for each mode
      const enabled = mode === "AUTO";
      const nextLimits = { ...limits, isTradingEnabled: enabled };
      setLimits(nextLimits);

      if (!skipSettingsSave) {
        await saveSettings(nextLimits);
      }

      addToast(
        "info",
        `Execution mode switched to ${mode}.`,
      );
    } catch (e: any) {
      addToast("error", `Failed to update mode: ${e.message}`);
    } finally {
      setChangingMode(false);
    }
  };

  // FIX #2: Debounce wrapper — 400 ms cooldown between mode changes
  const handleModeChange = useDebounce(_handleModeChange, 400);

  // ── Submit override action ─────────────────────────────────────────────────
  // FIX #7: Per-override loading state prevents double-submission.
  const submitOverrideAction = async (
    id: string,
    action: "BUY" | "SELL" | "DISCARD",
    size: number,
  ) => {
    if (executingOverride) return;
    setExecutingOverride(id);
    try {
      await authFetch(`/api/overrides/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ action, size }),
      });
      addToast("success", `Override ${action === "DISCARD" ? "discarded" : "executed"}.`);
      fetchPendingOverrides();
      setSelectedOverrideId(null);
    } catch (e: any) {
      addToast("error", `Override failed: ${e.message}`);
    } finally {
      setExecutingOverride(null);
    }
  };

  const startCustomOverride = (ov: DecisionOverride) => {
    setSelectedOverrideId(ov.id);
    setCustomAction(ov.original_action as any);
    setCustomSize(ov.original_size);
  };

  const modes = [
    {
      id: "AUTO",
      label: "Autonomous Mode",
      icon: <Cpu className="w-5 h-5" />,
      desc: "Zero Human Intervention",
      glowColor: "border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]",
      activeColor: "text-[#00f0ff]",
    },
    {
      id: "SEMI_AUTO",
      label: "Semi-Auto (HITL)",
      icon: <Play className="w-5 h-5" />,
      desc: "Human-in-the-Loop Review",
      glowColor: "border-[#ffaa00] bg-[#ffaa00]/10 text-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.15)]",
      activeColor: "text-[#ffaa00]",
    },
    {
      id: "SIMULATION",
      label: "Simulation Mode",
      icon: <Shield className="w-5 h-5" />,
      desc: "Paper Trading sandbox",
      glowColor: "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]",
      activeColor: "text-[#a855f7]",
    },
  ] as const;

  if (!portfolio) {
    return (
      <div className="text-gray-500 font-mono text-center p-8">
        Waiting for portfolio connection...
      </div>
    );
  }

  return (
    <motion.div
      key="auto-trading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-sans"
    >
      {/* Top OS Header */}
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#00f0ff] animate-pulse" />
            Execution Control Desk
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">
            TradeX AI • Autonomous Layer kernel
          </p>
        </div>

        <div className="bg-[#050505] p-2 rounded-sm flex items-center gap-4 border border-[#222]">
          <div className="flex flex-col items-end border-r border-[#1a1a1a] pr-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Execution Strategy
            </span>
            <span className={`font-mono font-bold uppercase ${
              executionMode === "AUTO" ? "text-[#00f0ff]" :
              executionMode === "SEMI_AUTO" ? "text-[#ffaa00]" : "text-[#a855f7]"
            }`}>
              {executionMode}
            </span>
          </div>
          {/* FIX #3: replaced alert() with toast; FIX #7: disabled during halt */}
          <button
            onClick={handleEmergencyHalt}
            disabled={haltingSystem}
            className="flex items-center gap-2 bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 border border-[#ff4500]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {haltingSystem ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Power className="w-3.5 h-3.5" />
            )}
            {haltingSystem ? "Halting..." : "Emergency Halt"}
          </button>
        </div>
      </div>

      {/* OS Protocol Selectors */}
      <div className="mb-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00f0ff]" />
            Operating System Mode
          </h2>
          <span className="bg-[#111] border border-[#222] px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
            System Lock: {executionMode === "AUTO" ? "AUTONOMOUS ENFORCEMENT" : "HUMAN ASSISTED"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const isActive = executionMode === mode.id;
            // FIX #2 + #7: disabled while any mode change is in flight
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                disabled={changingMode}
                className={`flex flex-col items-center justify-center p-6 rounded border transition-all disabled:opacity-60 disabled:cursor-wait ${
                  isActive
                    ? mode.glowColor
                    : "bg-[#0a0a0a] border-[#222] text-gray-500 hover:border-[#444] hover:text-gray-300"
                }`}
              >
                <div className={`mb-3 ${isActive ? mode.activeColor : "text-gray-600"}`}>
                  {changingMode && isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    mode.icon
                  )}
                </div>
                <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}>
                  {mode.label}
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-opacity-70">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision Override reviewer blotter for SEMI_AUTO mode */}
      <div className="mb-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-[#1b1b1b] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffaa00] animate-pulse"></div>
            <h3 className="text-gray-300 font-bold text-xs uppercase tracking-widest">
              Human-in-the-Loop Override blotter
            </h3>
          </div>
          <button
            onClick={fetchPendingOverrides}
            disabled={loadingOverrides}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOverrides ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {pendingOverrides.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#1f1f1f] rounded">
            <HelpCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-mono">No paused decisions currently awaiting human approval.</p>
            <p className="text-[10px] text-gray-600 mt-1">Set mode to SEMI-AUTO to pause &amp; review decisions before execution.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingOverrides.map((ov) => {
              const isExecuting = executingOverride === ov.id;
              return (
                <div
                  key={ov.id}
                  className="bg-[#090909] border border-[#222] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        ov.original_action === "BUY" ? "bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30" : "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/30"
                      }`}>
                        {ov.original_action} {ov.asset_id}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">Size: {ov.original_size}</span>
                      <span className="text-[9px] text-gray-600 font-mono">Pausing event: {new Date(ov.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">"Rationale: {ov.original_rationale}"</p>

                    {selectedOverrideId === ov.id && (
                      <div className="mt-4 p-3 bg-[#111] border border-[#222] rounded flex flex-col gap-3 max-w-sm">
                        <h4 className="text-[10px] uppercase font-bold text-gray-400">Modify Intended Trade</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCustomAction("BUY")}
                            className={`flex-1 text-center py-1 text-xs uppercase font-bold rounded ${
                              customAction === "BUY" ? "bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]" : "bg-transparent text-gray-400 border border-[#222]"
                            }`}
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => setCustomAction("SELL")}
                            className={`flex-1 text-center py-1 text-xs uppercase font-bold rounded ${
                              customAction === "SELL" ? "bg-[#ff4500]/20 text-[#ff4500] border border-[#ff4500]" : "bg-transparent text-gray-400 border border-[#222]"
                            }`}
                          >
                            SELL
                          </button>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-gray-500 block mb-1">Override Size</label>
                          <input
                            type="number"
                            value={customSize}
                            min={0}
                            onChange={(e) => setCustomSize(Number(e.target.value))}
                            className="w-full bg-[#050505] border border-[#222] text-xs font-mono p-1 text-white rounded"
                          />
                        </div>
                        <div className="flex gap-2 mt-1">
                          {/* FIX #7: disabled + spinner while executing */}
                          <button
                            onClick={() => submitOverrideAction(ov.id, customAction, customSize)}
                            disabled={isExecuting}
                            className="flex-1 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 text-xs py-1 rounded font-bold hover:bg-[#00f0ff]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {isExecuting && <Loader2 className="w-3 h-3 animate-spin" />}
                            Apply Override
                          </button>
                          <button
                            onClick={() => setSelectedOverrideId(null)}
                            className="px-2 bg-transparent text-gray-500 hover:text-white text-xs border border-transparent hover:border-[#333] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => submitOverrideAction(ov.id, ov.original_action as any, ov.original_size)}
                      disabled={!!executingOverride}
                      className="flex items-center gap-1.5 bg-[#39ff14]/10 text-[#39ff14] hover:bg-[#39ff14]/20 border border-[#39ff14]/30 px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>

                    {selectedOverrideId !== ov.id && (
                      <button
                        onClick={() => startCustomOverride(ov)}
                        disabled={!!executingOverride}
                        className="flex items-center gap-1.5 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Override
                      </button>
                    )}

                    <button
                      onClick={() => submitOverrideAction(ov.id, "DISCARD", 0)}
                      disabled={!!executingOverride}
                      className="flex items-center gap-1.5 bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 border border-[#ff4500]/30 px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Discard
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Constraints Dashboard Panel */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <div>
          <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00f0ff]" />
            Asset Allocation Caps
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Max Exposure Limit ($)
              </label>
              <input
                type="number"
                className="bg-[#111] border border-[#222] text-white p-2 rounded w-full text-sm font-mono focus:border-[#00f0ff] outline-none"
                value={limits.maxPositionSize}
                onChange={(e) => setLimits({ ...limits, maxPositionSize: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Drawdown Stop Limit ($)
              </label>
              <input
                type="number"
                className="bg-[#111] border border-[#222] text-white p-2 rounded w-full text-sm font-mono focus:border-[#00f0ff] outline-none"
                value={limits.maxLoss}
                onChange={(e) => setLimits({ ...limits, maxLoss: Number(e.target.value) })}
              />
            </div>
          </div>
          {/* FIX #7: disabled + spinner while saving */}
          <button
            onClick={() => saveSettings()}
            disabled={savingSettings}
            className="mt-4 flex items-center gap-2 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 px-4 py-2 rounded-sm text-xs font-bold transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingSettings ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {savingSettings ? "Saving..." : "Apply Constraints"}
          </button>
        </div>

        <div>
          <div className="bg-[#111] p-5 rounded border border-[#222] h-full flex flex-col justify-center">
            <h4 className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-1.5">
              Risk Rule Enforcements
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-mono">
              [SYSTEM DICTIONARY]
              <br />• Max Exposure: Restricts single-ticket size multiplier.
              <br />• Drawdown Stop: Triggers circuit breaker flat-line rules.
              <br />• Modes: Semi-Auto halts execution, allowing 1-click execution or direct trade alteration.
            </p>
          </div>
        </div>
      </div>

      {/* Execution Telemetry Log */}
      <div className="mb-4 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#39ff14]" />
          Autonomous Telemetry Feed
        </h3>
        <div className="flex flex-col gap-2 max-h-75 overflow-y-auto no-scrollbar font-mono">
          {telemetryFeed.filter((t) => t.type === "EXECUTION").length === 0 && (
            <div className="text-gray-600 text-xs text-center font-mono py-4">
              Awaiting telemetry synchronization stream...
            </div>
          )}
          {telemetryFeed
            .filter((t) => t.type === "EXECUTION")
            .map((ev) => (
              <div
                key={ev.id}
                className="flex justify-between items-center bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a] hover:border-[#222] transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500">
                    [{new Date(ev.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="text-xs text-gray-300">
                    {ev.message}
                  </span>
                </div>
                {ev.correlationId && (
                  <button
                    onClick={() => setActiveCorrelationId(ev.correlationId!)}
                    className="flex items-center gap-1 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#a855f7] px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest transition-all"
                  >
                    <Network className="w-3.5 h-3.5" />
                    Trace
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
