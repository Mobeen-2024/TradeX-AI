import React from "react";
import {
  Shield,
  Zap,
  Search,
  Bell,
  Activity,
  Beaker,
  Play,
} from "lucide-react";
import { useMarketRegime, MarketRegime } from "../contexts/MarketRegimeContext";
import { useSystemStore } from "../store/systemStore";

export function TopIntelligenceBar() {
  const { regime, setRegime } = useMarketRegime();
  const { isSimulationMode, setIsSimulationMode, overrideState } =
    useSystemStore();

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
    console.log("Applying overrides payload: ", overrideState);
    // UI just shows feedback or triggers local mock log
    alert("Overrides formulated. Ready for backend execution proxy.");
  };

  return (
    <header className="h-12 bg-[#020202] border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
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
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <Shield className="w-3.5 h-3.5 text-[#0ea5e9]" />
          Risk Guard: <span className="text-[#0ea5e9]">Level 2</span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-gray-500">
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
            className="px-3 py-1.5 flex items-center gap-2 rounded bg-white text-black border border-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]"
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
