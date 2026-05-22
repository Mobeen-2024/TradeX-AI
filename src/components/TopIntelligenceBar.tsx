import React, { useMemo } from "react";
import {
  Shield,
  Zap,
  Search,
  Bell,
  Activity,
  Beaker,
  Play,
  Lock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useMarketRegime, MarketRegime } from "../contexts/MarketRegimeContext";
import { useSystemStore } from "../store/systemStore";

export function TopIntelligenceBar() {
  const { regime, setRegime } = useMarketRegime();
  const {
    isSimulationMode,
    setIsSimulationMode,
    overrideState,
    overrideHistory,
    lockOverrides,
  } = useSystemStore();

  const getRegimeColor = (r: string) => {
    switch (r) {
      case "bull":
        return "text-[#00f0ff]";
      case "bear":
        return "text-[#ff4500]";
      case "volatile":
        return "text-[#facc15]";
      case "neutral":
      default:
        return "text-gray-400";
    }
  };

  const handleApplyOverrides = () => {
    if (lockOverrides) {
      alert("System is LOCKED. User overrides are disabled.");
      return;
    }

    if (!overrideState.action) {
      alert("Please select an override action first.");
      return;
    }

    const { addOverrideRecord, activeCorrelationId } =
      useSystemStore.getState();

    addOverrideRecord({
      id: Math.random().toString(36).substring(7),
      correlationId: activeCorrelationId || "SIM-" + Date.now(),
      timestamp: Date.now(),
      aiDecision: "HOLD", // Would be derived from correlation context in real app
      userOverride: overrideState.action,
      strategyId: "Global",
      regime,
      simulatedOutcome: (Math.random() > 0.4 ? 1 : -1) * (Math.random() * 5000), // Simulated Pnl for demonstration
      actualOutcome: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3000),
    });

    console.log("Applied overrides payload: ", overrideState);
    alert(
      "Simulation Overrides Processed. Telemetry captured in Adaptation Layer.",
    );
  };

  const trustMetrics = useMemo(() => {
    if (overrideHistory.length === 0)
      return {
        divergenceFreq: 0,
        aiWinRate: 100,
        userWinRate: 0,
        status: "stable",
      };
    const overrides = overrideHistory.filter((h) => h.userOverride);
    const divergenceFreq = (overrides.length / overrideHistory.length) * 100;
    const aiWins = overrideHistory.filter(
      (h) => h.actualOutcome && h.simulatedOutcome > 0 && !h.userOverride,
    ).length;
    const userWins = overrides.filter((h) => h.simulatedOutcome > 0).length;

    let status = "stable";
    if (divergenceFreq > 50) status = "high_activity";
    if (divergenceFreq > 20 && userWins < overrides.length / 2)
      status = "human_bias";

    return {
      divergenceFreq,
      aiWinRate:
        overrideHistory.length > 0
          ? (aiWins / overrideHistory.length) * 100
          : 100,
      userWinRate:
        overrides.length > 0 ? (userWins / overrides.length) * 100 : 0,
      status,
    };
  }, [overrideHistory]);

  return (
    <header className="h-12 bg-[#020202] border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-2 border-r border-[#1a1a1a]">
          {isSimulationMode ? (
            <div className="w-2 h-2 rounded-sm bg-[#ff6b00] animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 rounded-sm bg-[#39ff14] opacity-80"></div>
          )}
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
            System{" "}
            <span
              className={isSimulationMode ? "text-[#ff6b00]" : "text-white"}
            >
              {isSimulationMode ? "Simulation" : "Live"}
            </span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-2 border-r border-[#1a1a1a] text-[10px] font-mono whitespace-nowrap">
          {trustMetrics.status === "stable" ? (
            <div className="flex items-center gap-1.5 text-[#39ff14]">
              <CheckCircle className="w-3.5 h-3.5" /> Stable System
            </div>
          ) : trustMetrics.status === "high_activity" ? (
            <div className="flex items-center gap-1.5 text-[#facc15]">
              <AlertTriangle className="w-3.5 h-3.5" /> High Override Activity
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Risk of
              Human Bias
            </div>
          )}
          <span className="text-gray-500 ml-2">
            Divergence: {trustMetrics.divergenceFreq.toFixed(1)}%
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <Shield className="w-3.5 h-3.5 text-[#0ea5e9]" />
          Risk Guard: <span className="text-[#0ea5e9]">Level 2</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2 border-l border-[#1a1a1a] text-[10px] font-mono text-gray-500">
          <Activity className={`w-3.5 h-3.5 ${getRegimeColor(regime)}`} />
          Regime:
          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value as MarketRegime)}
            className={`bg-transparent outline-none cursor-pointer uppercase font-bold tracking-widest ${getRegimeColor(regime)}`}
          >
            <option value="neutral" className="bg-[#111] text-gray-400">
              Neutral
            </option>
            <option value="bull" className="bg-[#111] text-[#00f0ff]">
              Bull
            </option>
            <option value="bear" className="bg-[#111] text-[#ff4500]">
              Bear
            </option>
            <option value="volatile" className="bg-[#111] text-[#facc15]">
              Volatile
            </option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lockOverrides && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-[9px] uppercase tracking-widest font-bold">
            <Lock className="w-3 h-3" /> Locked
          </div>
        )}

        <button
          onClick={() => setIsSimulationMode(!isSimulationMode)}
          className={`px-3 py-1.5 flex items-center gap-2 rounded border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${isSimulationMode ? "bg-[#ff6b00]/10 border-[#ff6b00]/30 text-[#ff6b00]" : "bg-transparent border-[#333] text-gray-500 hover:border-gray-400"}`}
        >
          <Beaker className="w-3.5 h-3.5" />
          Sim Mode
        </button>

        {isSimulationMode && (
          <button
            onClick={handleApplyOverrides}
            disabled={lockOverrides}
            className={`px-3 py-1.5 flex items-center gap-2 rounded border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(255,255,255,0.1)] ${lockOverrides ? "opacity-50 cursor-not-allowed bg-gray-800 text-gray-500 border-gray-700" : "bg-white text-black border-white hover:bg-gray-200 shadow-[0_0_10px_rgba(255,255,255,0.2)]"}`}
          >
            <Play className="w-3.5 h-3.5" />
            Apply Overrides
          </button>
        )}

        <div className="h-6 w-[1px] bg-[#1a1a1a] mx-2 hidden sm:block"></div>
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Command Interface..."
            className="bg-[#0a0a0a] border border-[#222] text-xs font-mono px-8 py-1 rounded-sm w-48 focus:outline-none focus:border-[#00f0ff] transition-colors text-white"
          />
        </div>
      </div>
    </header>
  );
}
