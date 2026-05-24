import React from "react";
import { motion } from "motion/react";
import { PieChart, Briefcase, Activity, Target, AlertTriangle } from "lucide-react";

export function PortfolioTab() {
  const allocations = [
    { asset: "BTC", percentage: 45, value: 125000, color: "#facc15" },
    { asset: "ETH", percentage: 25, value: 69400, color: "#a855f7" },
    { asset: "PAXG", percentage: 15, value: 41600, color: "#39ff14" },
    { asset: "USDT", percentage: 15, value: 41600, color: "#00f0ff" },
  ];

  const positions = [
    { pair: "BTC/USDT", size: "2.1", entry: 59400, current: 64200, pnl: "+10,080.00", pnlPct: "+16.9%", side: "LONG", leverage: "3x" },
    { pair: "ETH/USDT", size: "18.5", entry: 3200, current: 3150, pnl: "-925.00", pnlPct: "-1.5%", side: "LONG", leverage: "2x" },
    { pair: "XAU/USD", size: "15.0", entry: 2380, current: 2410, pnl: "+450.00", pnlPct: "+1.2%", side: "SHORT", leverage: "5x" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="flex justify-between items-end border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-[#00f0ff]" />
            PORTFOLIO & POSITION SIZING
          </h1>
          <p className="text-sm text-gray-500 font-mono mt-1">Real-time allocation and risk breakdown</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-white">$277,600.00</div>
          <div className="text-sm font-mono text-[#39ff14]">+12,450.00 (4.6%) Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Breakdown */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 blur-3xl rounded-full"></div>
          <h2 className="text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#00f0ff]" />
            Capital Allocation
          </h2>
          <div className="space-y-4">
            {allocations.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between font-mono text-sm mb-1.5">
                  <span className="text-gray-300 font-bold" style={{ color: item.color }}>{item.asset}</span>
                  <div className="text-right">
                    <span className="text-white">${item.value.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#111] rounded overflow-hidden">
                  <div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden lg:col-span-2">
          <h2 className="text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#facc15]" />
            Risk Metrics & Sizing Limits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-[#222] p-4 rounded text-center">
              <div className="text-gray-500 text-[10px] uppercase font-mono mb-2">Total Margin Usage</div>
              <div className="text-xl font-bold font-mono text-[#00f0ff]">24.5%</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4 rounded text-center">
              <div className="text-gray-500 text-[10px] uppercase font-mono mb-2">Portfolio Beta</div>
              <div className="text-xl font-bold font-mono text-white">0.85</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4 rounded text-center">
              <div className="text-gray-500 text-[10px] uppercase font-mono mb-2">Max Drawdown Limit</div>
              <div className="text-xl font-bold font-mono text-[#ff4500]">10.0%</div>
            </div>
            <div className="bg-[#111] border border-[#222] p-4 rounded text-center">
              <div className="text-gray-500 text-[10px] uppercase font-mono mb-2">Current Drawdown</div>
              <div className="text-xl font-bold font-mono text-[#39ff14]">1.2%</div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3 bg-[#facc15]/10 border border-[#facc15]/20 p-3 rounded text-[11px] font-mono text-[#facc15]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>Risk Guardian limits active. Max position size capped at 15% of total portfolio value per single asset to enforce diversification mandates.</p>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden">
        <h2 className="text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#39ff14]" />
          Active Positions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-[#222]">
                <th className="pb-3 font-normal uppercase tracking-widest">Asset</th>
                <th className="pb-3 font-normal uppercase tracking-widest text-right">Side</th>
                <th className="pb-3 font-normal uppercase tracking-widest text-right">Size</th>
                <th className="pb-3 font-normal uppercase tracking-widest text-right">Entry Price</th>
                <th className="pb-3 font-normal uppercase tracking-widest text-right">Mark Price</th>
                <th className="pb-3 font-normal uppercase tracking-widest text-right">Unrealized PnL</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i} className="border-b border-[#111] hover:bg-[#111] transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    {pos.pair} <span className="bg-[#222] text-[9px] px-1.5 py-0.5 rounded text-gray-400">{pos.leverage}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.side === 'LONG' ? 'bg-[#39ff14]/10 text-[#39ff14]' : 'bg-[#ff4500]/10 text-[#ff4500]'}`}>
                      {pos.side}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-300">{pos.size}</td>
                  <td className="py-3 text-right text-gray-400">${pos.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-right text-white">${pos.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`py-3 text-right font-bold ${pos.pnl.startsWith('+') ? 'text-[#39ff14]' : 'text-[#ff4500]'}`}>
                    {pos.pnl} ({pos.pnlPct})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
