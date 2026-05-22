import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  AlertTriangle,
  Power,
  Cpu,
  Shield,
  BrainCircuit,
  Play,
  Save,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function AutoTradingTab() {
  const { activePortfolio: portfolio } = useSystemStore();

  const [osMode, setOsMode] = useState<
    "Manual" | "Assisted" | "Semi-Auto" | "Autonomous"
  >("Autonomous");
  const [limits, setLimits] = useState({
    maxPositionSize: 0,
    maxLoss: 0,
    isTradingEnabled: false,
  });

  // Sync state when portfolio from store changes
  useEffect(() => {
    if (portfolio) {
      setLimits({
        maxPositionSize: (portfolio as any).max_position_size || 0,
        maxLoss: (portfolio as any).max_loss || 0,
        isTradingEnabled: (portfolio as any).is_trading_enabled || false,
      });
      setOsMode(
        (portfolio as any).is_trading_enabled ? "Autonomous" : "Manual",
      );
    }
  }, [portfolio]);

  const saveSettings = async (override?: any) => {
    if (!portfolio) return;
    const toSave = override || limits;
    try {
      await fetch(`/api/portfolio/${portfolio.id}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_trading_enabled: toSave.isTradingEnabled,
          max_position_size: toSave.maxPositionSize,
          max_loss: toSave.maxLoss,
        }),
      });
      // A Websocket event should eventually update the portfolio in the store
    } catch (e) {
      console.error("Failed to save limits", e);
    }
  };

  const handleEmergencyHalt = async () => {
    setLimits((prev) => ({ ...prev, isTradingEnabled: false }));
    setOsMode("Manual");
    await saveSettings({ ...limits, isTradingEnabled: false });
    alert("Emergency Halt Executed. All trading stopped.");
  };

  const toggleMode = (mode: any) => {
    setOsMode(mode);
    const enabled = mode === "Autonomous";
    setLimits((prev) => ({ ...prev, isTradingEnabled: enabled }));
    saveSettings({ ...limits, isTradingEnabled: enabled });
  };

  const modes = [
    {
      id: "Manual",
      icon: <Shield className="w-4 h-4" />,
      desc: "User Executed",
    },
    {
      id: "Assisted",
      icon: <BrainCircuit className="w-4 h-4" />,
      desc: "AI Recommends",
    },
    {
      id: "Semi-Auto",
      icon: <Play className="w-4 h-4" />,
      desc: "1-Click Approve",
    },
    {
      id: "Autonomous",
      icon: <Cpu className="w-4 h-4" />,
      desc: "Zero Intervention",
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
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#facc15]" />
            System Intelligence Control
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">
            Global Execution Protocol
          </p>
        </div>

        <div className="bg-[#050505] p-2 rounded-sm flex items-center gap-4 border border-[#222]">
          <div className="flex flex-col items-end border-r border-[#1a1a1a] pr-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Global Status
            </span>
            <span className="text-[#39ff14] font-mono font-bold uppercase">
              {osMode} MODE
            </span>
          </div>
          <button
            onClick={handleEmergencyHalt}
            className="flex items-center gap-2 bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 border border-[#ff4500]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            Emergency Halt
          </button>
        </div>
      </div>

      {/* Autonomous Mode Selector */}
      <div className="mb-8 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        {osMode === "Autonomous" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent animate-[shimmer_2s_infinite]"></div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Cpu
              className={`w-5 h-5 ${osMode === "Autonomous" ? "text-[#00f0ff]" : "text-gray-500"}`}
            />
            Operating Protocol
          </h2>
          <span className="bg-[#111] border border-[#222] px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
            Core Thread:{" "}
            {osMode === "Autonomous" ? "LOCKED" : "AWAITING USER OPT"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {modes.map((mode) => {
            const isActive = osMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => toggleMode(mode.id)}
                className={`flex flex-col items-center justify-center p-4 rounded border transition-all ${isActive ? (mode.id === "Autonomous" ? "bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]" : "bg-white/5 border-white text-white") : "bg-[#0a0a0a] border-[#222] text-gray-500 hover:border-[#444] hover:text-gray-300"}`}
              >
                <div
                  className={`mb-3 ${isActive ? (mode.id === "Autonomous" ? "text-[#00f0ff]" : "text-white") : "text-gray-600"}`}
                >
                  {mode.icon}
                </div>
                <div
                  className={`text-sm font-bold uppercase tracking-widest mb-1 ${isActive ? (mode.id === "Autonomous" ? "text-[#00f0ff]" : "text-white") : "text-gray-500"}`}
                >
                  {mode.id}
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-opacity-70">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#050505] border border-[#1a1a1a] rounded-sm p-6 relative overflow-hidden">
        <div>
          <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#facc15]" />
            Portfolio Control Panel Limits
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Max Position Size ($)
              </label>
              <input
                type="number"
                className="bg-[#111] border border-[#222] text-white p-2 rounded w-full text-sm font-mono"
                value={limits.maxPositionSize}
                onChange={(e) =>
                  setLimits({
                    ...limits,
                    maxPositionSize: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Max Loss Limit ($)
              </label>
              <input
                type="number"
                className="bg-[#111] border border-[#222] text-white p-2 rounded w-full text-sm font-mono"
                value={limits.maxLoss}
                onChange={(e) =>
                  setLimits({ ...limits, maxLoss: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <button
            onClick={() => saveSettings()}
            className="mt-4 flex items-center gap-2 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 px-4 py-2 rounded-sm text-xs font-bold transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Limits
          </button>
        </div>

        <div>
          <div className="bg-[#111] p-4 rounded border border-[#222] h-full flex flex-col justify-center">
            <h4 className="text-gray-400 text-sm font-bold mb-2">
              Portfolio Enforcements
            </h4>
            <p className="text-xs text-gray-500">
              The execution agent will respect these hard limits. If Max Loss is
              hit, emergency halt will automatically trigger and positions will
              be flat-lined. Max position size restricts any single asset
              exposure.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
