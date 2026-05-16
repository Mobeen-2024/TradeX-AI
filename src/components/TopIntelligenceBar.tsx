import React from "react";
import { Shield, Zap, Search, Bell, Activity } from "lucide-react";
import { useMarketRegime, MarketRegime } from "../contexts/MarketRegimeContext";

export function TopIntelligenceBar() {
  const { regime, setRegime } = useMarketRegime();

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

  return (
    <header className="h-12 bg-[#020202] border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-[#39ff14] opacity-80"></div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
            System <span className="text-white">Active</span>
          </span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <Shield className="w-3.5 h-3.5 text-[#0ea5e9]" />
          Risk Guard: <span className="text-[#0ea5e9]">Level 2</span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <Zap className="w-3.5 h-3.5 text-[#39ff14]" />
          Global Latency: <span className="text-[#39ff14]">14ms</span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a] hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <Activity className={`w-3.5 h-3.5 ${getRegimeColor(regime)}`} />
          <label htmlFor="regime-select">Regime:</label>
          <select
            id="regime-select"
            value={regime}
            onChange={(e) => setRegime(e.target.value as MarketRegime)}
            className={`bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:outline-none rounded cursor-pointer uppercase font-bold tracking-widest ${getRegimeColor(regime)}`}
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

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Command Interface..."
            className="bg-[#0a0a0a] border border-[#222] text-xs font-mono px-8 py-1 rounded-sm w-48 md:w-64 focus:outline-none focus:border-[#00f0ff] transition-colors text-white"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-600 border border-[#333] px-1 rounded-sm bg-[#111]">
            ⌘K
          </span>
        </div>
        <button
          className="text-gray-500 hover:text-white transition-colors relative cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:outline-none rounded"
          aria-label="View Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff4500] rounded-full border border-[#020202]"></span>
        </button>
      </div>
    </header>
  );
}
