import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield,
  AlertTriangle,
  Activity,
  Crosshair,
  Lock,
  ShieldCheck,
  Boxes,
  Radar as RadarIcon,
  LineChart as LineChartIcon,
  Power,
  AlertOctagon,
  Terminal,
  Flame,
  Ban,
} from "lucide-react";
import { useSystemStore } from "../../store/systemStore";
import { Skeleton } from "../ui/Skeleton";

export function RiskCenterTab() {
  const {
    activePortfolio: portfolio,
    riskState,
    riskOverrides,
    setRiskOverride,
    systemInsights,
  } = useSystemStore();

  const activeRiskInsights = systemInsights.filter(
    (i) => i.affectedComponent === "RISK",
  );

  const [stressLevel, setStressLevel] = useState(68);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);

  useEffect(() => {
    if (!portfolio?.id) return;
    
    let active = true;
    const fetchPositions = async () => {
      setPositionsLoading(true);
      try {
        const res = await fetch(`/api/portfolio/${portfolio.id}/positions`);
        if (!res.ok) throw new Error("Failed to fetch positions");
        const data = await res.json();
        if (active) {
          setPositions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setPositionsLoading(false);
        }
      }
    };
    
    fetchPositions();
    return () => {
      active = false;
    };
  }, [portfolio?.id]);

  useEffect(() => {
    // Sync stress level based on real risk level if available
    if (riskState) {
      if (riskState.state === "CRITICAL") setStressLevel(90);
      else if (riskState.state === "ELEVATED") setStressLevel(65);
      else setStressLevel(30);
    }
  }, [riskState]);

  const runRiskCheck = async () => {
    if (!portfolio) return;
    setLoading(true);
    try {
      await fetch("/api/intelligence/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: portfolio.id }),
      });
      // The store will pick up telemetry updates via websocket
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono gap-6 p-1 pl-1 pr-1"
    >
      <div className="flex justify-between items-end mb-4 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <Shield className="w-8 h-8 text-[#facc15]" />
            Risk Engine
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            Global Exposure & Protection Override
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              AI Risk Status
            </span>
            <span
              className={`${riskState?.state === "CRITICAL" ? "text-red-500" : riskState?.state === "ELEVATED" ? "text-yellow-400" : "text-[#39ff14]"} text-xs font-bold uppercase flex items-center gap-2`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {loading ? "Checking..." : riskState?.state || "IDLE"}
            </span>
          </div>
          <button
            onClick={runRiskCheck}
            disabled={loading}
            className="flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/30 hover:bg-[#39ff14]/20 text-[#39ff14] px-4 py-2 rounded-sm text-xs font-bold transition-colors shadow-[0_0_15px_rgba(57,255,20,0.15)] uppercase tracking-widest disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5" />
            {loading ? "Analyzing..." : "Run Risk Check"}
          </button>
          <button className="flex items-center gap-2 bg-[#ff4500]/10 border border-[#ff4500]/30 hover:bg-[#ff4500]/20 text-[#ff4500] px-4 py-2 rounded-sm text-xs font-bold transition-colors shadow-[0_0_15px_rgba(255,69,0,0.15)] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            Liquidate All
          </button>
        </div>
      </div>

      {activeRiskInsights.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {activeRiskInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-red-500/10 border border-red-500/30 rounded px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div className="flex flex-col">
                  <span className="text-red-400 font-bold text-xs uppercase tracking-widest">
                    {insight.priority} PRIORITY RISK ALERT
                  </span>
                  <span className="text-gray-300 text-sm">
                    {insight.description}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest">
                  Suggested Action
                </span>
                <span className="text-red-400 text-xs font-bold uppercase">
                  {insight.suggestedAction}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-2">
        <div className="bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-6">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2">
            <RadarIcon className="w-4 h-4 text-[#00f0ff]" />
            System Drawdown & Factor Analysis
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                Max Drawdown
              </span>
              <span className="font-bold text-white text-xl">
                {(riskState?.drawdown || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                Risk Multiplier
              </span>
              <span className="font-bold text-[#00f0ff] text-xl">
                {(riskState?.riskMultiplier || 1.0).toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                State
              </span>
              <span
                className={`font-bold text-xl uppercase ${riskState?.state === "CRITICAL" ? "text-red-500" : riskState?.state === "ELEVATED" ? "text-yellow-400" : "text-[#39ff14]"}`}
              >
                {riskState?.state || "NORMAL"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-6">
          <div className="flex flex-col h-full justify-center">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4 border-b border-[#1a1a1a] pb-2">
              Actionable AI Feedback
            </h3>
            <div className="text-gray-300 text-lg font-mono mb-4 bg-black/40 p-4 rounded border border-white/5 h-24 flex items-center">
              {riskState?.state === "CRITICAL"
                ? "CRITICAL RISK: Suspending new allocations and accelerating deleveraging."
                : riskState?.state === "ELEVATED"
                  ? "ELEVATED RISK: Reducing exposure size and tightening stops."
                  : "System operating optimally within parameters."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-75">
        {/* Volatility Stress Meter */}
        <div className="col-span-1 xl:col-span-4 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-6 items-center justify-center relative">
          <div className="absolute top-4 left-4">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-[#a855f7]" />
              Volatility Stress
            </h3>
          </div>

          <div className="relative w-40 h-40 mt-8 flex items-center justify-center">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-[#222] border-dashed animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-4 rounded-full border border-[#1a1a1a] animate-[spin_15s_linear_infinite_reverse]"></div>

            {/* The Stress Arc */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#111"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={
                  stressLevel > 80
                    ? "#ef4444"
                    : stressLevel > 50
                      ? "#facc15"
                      : "#39ff14"
                }
                strokeWidth="6"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - stressLevel}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Text */}
            <div className="flex flex-col items-center justify-center z-10 w-17.5">
              <span className="text-4xl font-bold text-white font-sans tracking-tighter tabular-nums">
                {stressLevel.toFixed(0)}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-gray-500 mt-1">
                Index
              </span>
            </div>
          </div>

          <div className="w-full mt-auto mb-0 bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded flex items-start gap-3">
            <AlertTriangle
              className={`w-4 h-4 shrink-0 mt-0.5 ${stressLevel > 80 ? "text-[#ef4444]" : stressLevel > 50 ? "text-[#facc15]" : "text-[#39ff14]"}`}
            />
            <div>
              <div className="text-xs text-white font-bold mb-1">
                {stressLevel > 80
                  ? "CRITICAL VOLATILITY"
                  : stressLevel > 50
                    ? "WARNING: SPREADS WIDENING"
                    : "MARKET STABLE"}
              </div>
              <div className="text-[10px] text-gray-500 leading-relaxed font-mono">
                {stressLevel > 80
                  ? "Halt on market orders."
                  : stressLevel > 50
                    ? "Monitoring correlation breakdown."
                    : "Execution parameters active."}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Heatmap */}
        <div className="col-span-1 xl:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-4">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4 flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-white" />
            Portfolio Heatmap & Exposure
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {positionsLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded p-4 border border-[#1a1a1a] bg-[#050505] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12 rounded-sm" />
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div className="flex flex-col gap-1.5 w-1/2">
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              (() => {
                const totalVal = Number(portfolio?.totalValue || positions.reduce((acc, p) => acc + Math.abs(p.size) * p.current_price, 0) || 1);
                
                return positions.map((pos) => {
                  const posValue = Math.abs(pos.size) * pos.current_price;
                  const exposurePct = (posValue / totalVal) * 100;
                  
                  let risk = "Low";
                  let color = "bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]";
                  
                  if (exposurePct > 40) {
                    risk = "Extreme";
                    color = "bg-red-600/10 border-red-600/30 text-red-500";
                  } else if (exposurePct > 25) {
                    risk = "High";
                    color = "bg-[#ff4500]/10 border-[#ff4500]/30 text-[#ff4500]";
                  } else if (exposurePct > 15) {
                    risk = "Med";
                    color = "bg-[#facc15]/10 border-[#facc15]/30 text-[#facc15]";
                  }
                  
                  return (
                    <div
                      key={pos.asset_id}
                      className={`rounded p-4 border flex flex-col justify-between ${color}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold font-sans tracking-tight text-white">
                          {pos.asset_id}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest py-1 px-2 rounded-sm bg-black/20 font-bold">
                          {risk} Risk
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1 font-bold">
                            Allocation
                          </span>
                          <span className="font-bold font-mono text-xl text-white/90">
                            {exposurePct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-current opacity-40 flex items-center justify-center font-mono text-[9px]">
                          {pos.size >= 0 ? "LONG" : "SHRT"}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            )}
            <div className="rounded p-4 border border-[#1a1a1a] border-dashed flex flex-col items-center justify-center text-gray-600 gap-2 hover:border-[#333] hover:text-gray-400 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
                <span className="text-xl leading-none font-light mb-0.5">
                  +
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Add Asset
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Control System */}
      <div className="bg-[#050505] border border-[#ff4500]/30 rounded flex flex-col p-6 mt-2 relative overflow-hidden shadow-[0_0_20px_rgba(255,69,0,0.05)]">
        {/* Animated hazard stripes top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#ff4500] via-[#ef4444] to-[#ff4500]"></div>
        <div
          className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #ff4500 0, #ff4500 2px, transparent 2px, transparent 16px)",
          }}
        ></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[#ff4500]/20 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3 font-sans">
              <AlertOctagon className="w-6 h-6 text-[#ff4500]" />
              Emergency Control System
            </h3>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">
              Terminal Overrides & Immediate Halt Protocols
            </p>
          </div>

          <div className="mt-4 md:mt-0 px-3 py-1.5 bg-[#ff4500]/10 border border-[#ff4500]/30 rounded text-[#ff4500] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff4500]"></div>
            Authorization Level: Alpha
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
          {/* Kill Switch */}
          <button className="group bg-black border border-[#ff4500]/40 hover:border-[#ff4500] rounded p-4 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#ff4500]/5 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full border-2 border-[#ff4500]/50 group-hover:bg-[#ff4500]/20 flex items-center justify-center transition-all bg-[#111]">
              <Power className="w-5 h-5 text-[#ff4500]" />
            </div>
            <div className="text-center">
              <div className="text-white font-bold uppercase tracking-widest text-sm mb-1">
                Kill Switch
              </div>
              <div className="text-[#ff4500] text-[10px] uppercase tracking-widest opacity-80">
                Stop All Trading
              </div>
            </div>
          </button>

          {/* Risk Lockdown */}
          <button className="group bg-black border border-[#facc15]/40 hover:border-[#facc15] rounded p-4 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#facc15]/5 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full border-2 border-[#facc15]/50 group-hover:bg-[#facc15]/20 flex items-center justify-center transition-all bg-[#111]">
              <Ban className="w-5 h-5 text-[#facc15]" />
            </div>
            <div className="text-center">
              <div className="text-white font-bold uppercase tracking-widest text-sm mb-1">
                Risk Lockdown
              </div>
              <div className="text-[#facc15] text-[10px] uppercase tracking-widest opacity-80">
                Close Open Positions
              </div>
            </div>
          </button>

          {/* Auto Shutdown -> Replaced by Risk Controls */}
          <div className="bg-black border border-[#1a1a1a] rounded p-4 flex flex-col justify-between col-span-1 md:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <span className="text-white font-bold uppercase tracking-widest text-xs">
                  Risk Controls
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">
                  <span>Drawdown Cap</span>
                  <span className="text-[#ff4500]">
                    {riskOverrides.drawdownCap.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={riskOverrides.drawdownCap}
                  onChange={(e) =>
                    setRiskOverride({ drawdownCap: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#ff4500]"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">
                  <span>Vol Sensitivity</span>
                  <span className="text-[#facc15]">
                    {riskOverrides.volSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={riskOverrides.volSensitivity}
                  onChange={(e) =>
                    setRiskOverride({
                      volSensitivity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#facc15]"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">
                  <span>Emergency Throttle</span>
                  <span className="text-[#00f0ff]">
                    {riskOverrides.emergencyThrottle.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={riskOverrides.emergencyThrottle}
                  onChange={(e) =>
                    setRiskOverride({
                      emergencyThrottle: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#00f0ff]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
