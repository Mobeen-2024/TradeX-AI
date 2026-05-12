import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, AlertTriangle, Activity, Crosshair, Lock, ShieldCheck, Boxes, Radar as RadarIcon, LineChart as LineChartIcon, Power, AlertOctagon, Terminal, Flame, Ban } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

const radarData = [
  { subject: "Directional Bias", A: 85, fullMark: 100 },
  { subject: "Liquidity Depth", A: 40, fullMark: 100 },
  { subject: "Sector Exposure", A: 60, fullMark: 100 },
  { subject: "Tail Risk", A: 90, fullMark: 100 },
  { subject: "Slippage", A: 35, fullMark: 100 },
  { subject: "Leverage", A: 75, fullMark: 100 },
];

const drawdownData = [
  { time: "08:00", value: 0 },
  { time: "09:00", value: -0.5 },
  { time: "10:00", value: -1.2 },
  { time: "11:00", value: -0.8 },
  { time: "12:00", value: -2.4 },
  { time: "13:00", value: -1.5 },
  { time: "14:00", value: -0.9 },
  { time: "15:00", value: -0.8 },
];

const heatmapData = [
  {
    symbol: "BTC",
    exposure: "45%",
    risk: "Low",
    color: "bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]",
  },
  {
    symbol: "ETH",
    exposure: "25%",
    risk: "Med",
    color: "bg-[#facc15]/10 border-[#facc15]/30 text-[#facc15]",
  },
  {
    symbol: "SOL",
    exposure: "15%",
    risk: "High",
    color: "bg-[#ff4500]/10 border-[#ff4500]/30 text-[#ff4500]",
  },
  {
    symbol: "AVAX",
    exposure: "10%",
    risk: "High",
    color: "bg-[#ff4500]/10 border-[#ff4500]/30 text-[#ff4500]",
  },
  {
    symbol: "DOGE",
    exposure: "5%",
    risk: "Extreme",
    color: "bg-red-600/10 border-red-600/30 text-red-500",
  },
];

export function RiskCenterTab() {
  const [stressLevel, setStressLevel] = useState(68);

  useEffect(() => {
    const interval = setInterval(() => {
      setStressLevel((prev) => {
        const delta = (Math.random() - 0.5) * 5;
        return Math.min(100, Math.max(0, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
              System Status
            </span>
            <span className="text-[#39ff14] text-xs font-bold uppercase flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Defense
            </span>
          </div>
          <button className="flex items-center gap-2 bg-[#ff4500]/10 border border-[#ff4500]/30 hover:bg-[#ff4500]/20 text-[#ff4500] px-4 py-2 rounded-sm text-xs font-bold transition-colors shadow-[0_0_15px_rgba(255,69,0,0.15)] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            Liquidate All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-2">
        {/* Exposure Radar */}
        <div className="col-span-1 xl:col-span-4 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-4">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4 flex items-center gap-2">
            <RadarIcon className="w-3.5 h-3.5 text-[#00f0ff]" />
            Real-time Exposure Radar
          </h3>
          <div className="h-48 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#222" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#888", fontSize: 10, fontFamily: "monospace" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#444", fontSize: 9 }}
                />
                <Radar
                  name="Exposure"
                  dataKey="A"
                  stroke="#00f0ff"
                  fill="#00f0ff"
                  fillOpacity={0.2}
                  dot={{ r: 3, fill: "#00f0ff" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">
              Tail Risk Warning
            </span>
            <span className="text-[#ff4500] font-bold uppercase tracking-widest">
              Elevated
            </span>
          </div>
        </div>

        {/* Drawdown Monitor */}
        <div className="col-span-1 xl:col-span-8 bg-[#050505] border border-[#1a1a1a] rounded flex flex-col p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-r from-transparent to-[#ff4500]/5 pointer-events-none"></div>
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#ff4500]" />
            Drawdown Monitor
          </h3>

          <div className="flex gap-8 mb-4 z-10">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">
                Max Drawdown (24h)
              </span>
              <span className="text-white text-2xl font-bold font-sans tracking-tight">
                -2.40%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">
                Current Distance
              </span>
              <span className="text-[#39ff14] text-2xl font-bold font-sans tracking-tight">
                1.50%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">
                Hard Stop Level
              </span>
              <span className="text-[#ff4500] text-2xl font-bold font-sans tracking-tight opacity-80">
                -5.00%
              </span>
            </div>
          </div>

          <div className="h-48 w-full z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={drawdownData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorDrawdown"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ff4500" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#111"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#444"
                  tick={{ fill: "#666", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#444"
                  tick={{ fill: "#888", fontSize: 10 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#1a1a1a",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#ff4500" }}
                  formatter={(val: number) => [`${val}%`, "Drawdown"]}
                />
                <ReferenceLine
                  y={-5}
                  stroke="#ff4500"
                  strokeDasharray="3 3"
                  label={{
                    position: "insideTopLeft",
                    value: "Hard Stop -5%",
                    fill: "#ff4500",
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff4500"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDrawdown)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-[300px]">
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
            <div className="flex flex-col items-center justify-center z-10 w-[70px]">
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
            {heatmapData.map((item) => (
              <div
                key={item.symbol}
                className={`rounded p-4 border flex flex-col justify-between ${item.color}`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold font-sans tracking-tight text-white">
                    {item.symbol}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest py-1 px-2 rounded-sm bg-black/20 font-bold">
                    {item.risk} Risk
                  </span>
                </div>
                <div className="flex justify-between items-end mt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1 font-bold">
                      Allocation
                    </span>
                    <span className="font-bold font-mono text-xl text-white/90">
                      {item.exposure}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-current opacity-40 flex items-center justify-center">
                    <LineChartIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500] via-[#ef4444] to-[#ff4500]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ff4500 0, #ff4500 2px, transparent 2px, transparent 16px)' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[#ff4500]/20 pb-4">
           <div>
             <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3 font-sans">
               <AlertOctagon className="w-6 h-6 text-[#ff4500]" />
               Emergency Control System
             </h3>
             <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Terminal Overrides & Immediate Halt Protocols</p>
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
                 <div className="text-white font-bold uppercase tracking-widest text-sm mb-1">Kill Switch</div>
                 <div className="text-[#ff4500] text-[10px] uppercase tracking-widest opacity-80">Stop All Trading</div>
              </div>
           </button>

           {/* Risk Lockdown */}
           <button className="group bg-black border border-[#facc15]/40 hover:border-[#facc15] rounded p-4 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#facc15]/5 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full border-2 border-[#facc15]/50 group-hover:bg-[#facc15]/20 flex items-center justify-center transition-all bg-[#111]">
                 <Ban className="w-5 h-5 text-[#facc15]" />
              </div>
              <div className="text-center">
                 <div className="text-white font-bold uppercase tracking-widest text-sm mb-1">Risk Lockdown</div>
                 <div className="text-[#facc15] text-[10px] uppercase tracking-widest opacity-80">Close Open Positions</div>
              </div>
           </button>

           {/* Auto Shutdown */}
           <div className="bg-black border border-[#1a1a1a] rounded p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Auto Shutdown</span>
                 </div>
                 <div className="w-8 h-4 bg-[#39ff14]/20 rounded-full flex items-center p-0.5 border border-[#39ff14]/30 cursor-pointer transition-colors">
                    <div className="w-3 h-3 bg-[#39ff14] rounded-full translate-x-4 shadow-[0_0_5px_rgba(57,255,20,0.8)] transition-transform"></div>
                 </div>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Threshold Config</div>
              <div className="bg-[#111] rounded p-2 text-[10px] font-mono text-gray-400 border border-[#222]">
                 <div className="flex justify-between mb-1"><span>Drawdown &gt;</span><span className="text-[#ff4500]">5.0%</span></div>
                 <div className="flex justify-between mb-1"><span>Spread &gt;</span><span className="text-[#facc15]">0.8%</span></div>
                 <div className="flex justify-between"><span>VIX &gt;</span><span className="text-[#00f0ff]">85.0</span></div>
              </div>
           </div>

           {/* Manual Override */}
           <div className="bg-black border border-[#1a1a1a] rounded p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-gray-500/10 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                 <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Manual Override</span>
                 </div>
                 <div className="w-8 h-4 bg-[#111] rounded-full flex items-center p-0.5 border border-[#333] cursor-pointer transition-colors">
                    <div className="w-3 h-3 bg-gray-600 rounded-full transition-transform"></div>
                 </div>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 relative z-10">Bypass AI Engine</div>
              <p className="text-[9px] text-gray-600 leading-relaxed font-mono uppercase relative z-10">
                 Engaging manual override disables algorithmic execution. Director, Quant, and Risk agents will be suspended.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
