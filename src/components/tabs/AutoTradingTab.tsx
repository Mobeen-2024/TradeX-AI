import React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, TrendingUp, TrendingDown, Clock, BarChart3, AlertTriangle, Power } from 'lucide-react';

export function AutoTradingTab() {
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
            Auto-Trading Hub
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-mono tracking-widest">Active Autonomous Portfolios</p>
        </div>
        
        <div className="bg-[#050505] p-2 rounded-sm flex items-center gap-4 border border-[#222]">
           <div className="flex flex-col items-end border-r border-[#1a1a1a] pr-4">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">24h PNL</span>
             <span className="text-[#39ff14] font-mono font-bold">+$1,420.50</span>
           </div>
           <button className="flex items-center gap-2 bg-[#facc15]/10 text-[#facc15] hover:bg-[#facc15]/20 border border-[#facc15]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <Power className="w-3.5 h-3.5" />
              Global Pause
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Side: Active Strategies List */}
         <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
           {/* Strategy Card 1 */}
           <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#39ff14]/10 transition-colors"></div>
             
             <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 rounded-sm bg-[#39ff14]/10 flex items-center justify-center border border-[#39ff14]/20 shadow-none">
                   <Activity className="w-5 h-5 text-[#39ff14]" />
                 </div>
                 <div>
                   <h3 className="font-bold text-white tracking-wide">High-Frequency Scalper</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] opacity-80"></span>
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Running • BTC/USDT</span>
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-col items-end">
                 <span className="font-mono font-bold text-[#39ff14] flex items-center gap-1">
                   <TrendingUp className="w-4 h-4" />
                   14.2%
                 </span>
                 <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Win Rate 68%</span>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 border-t border-[#1a1a1a] pt-4 mt-2">
                 <div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Exposure</span>
                   <span className="font-mono text-gray-200 text-sm">$45,000</span>
                 </div>
                 <div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Last Trade</span>
                   <span className="font-mono text-gray-400 text-sm">2m ago</span>
                 </div>
                 <div className="text-right">
                   <button className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Manage <span className="ml-1">→</span></button>
                 </div>
             </div>
           </div>

           {/* Strategy Card 2 */}
           <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition-colors group relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 rounded-sm bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/20 shadow-none">
                   <BarChart3 className="w-5 h-5 text-[#0ea5e9]" />
                 </div>
                 <div>
                   <h3 className="font-bold text-white tracking-wide">Macro Swing Arb</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] opacity-80"></span>
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Running • ETH/SOL</span>
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-col items-end">
                 <span className="font-mono font-bold text-gray-400 flex items-center gap-1">
                   <TrendingUp className="w-4 h-4 text-gray-600" />
                   1.1%
                 </span>
                 <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Win Rate 82%</span>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 border-t border-[#1a1a1a] pt-4 mt-2">
                 <div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Exposure</span>
                   <span className="font-mono text-gray-200 text-sm">$120,500</span>
                 </div>
                 <div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Last Trade</span>
                   <span className="font-mono text-gray-400 text-sm">4h ago</span>
                 </div>
                 <div className="text-right">
                   <button className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Manage <span className="ml-1">→</span></button>
                 </div>
             </div>
           </div>
         </div>

         {/* Right Side: Risk & Quick Info */}
         <div className="col-span-1 flex flex-col gap-6">
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 border-l-[3px] border-l-[#facc15] shadow-none">
               <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4 text-[#facc15]" />
                 Risk Perimeter
               </h3>

               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-gray-300">Total Margin Used</span>
                     <span className="font-mono text-[#facc15]">42%</span>
                   </div>
                   <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                     <div className="bg-[#facc15] h-full" style={{ width: '42%' }}></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-gray-300">Max Open Drawdown</span>
                     <span className="font-mono text-gray-400">0.8%</span>
                   </div>
                   <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                     <div className="bg-gray-500 h-full" style={{ width: '20%' }}></div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 overflow-hidden relative group">
               <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>
               
               <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-[#00f0ff]" />
                 Recent Autonomous Actions
               </h3>

               <div className="space-y-3 relative z-10 flex flex-col h-[200px] overflow-y-auto no-scrollbar font-mono text-[10px]">
                 <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                   <span className="text-[#39ff14]">BUY BTC 0.5 @ MKT</span>
                   <span className="text-gray-500">10:42:01</span>
                 </div>
                 <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                   <span className="text-gray-400">Cancel H-ID: x992</span>
                   <span className="text-gray-500">10:39:14</span>
                 </div>
                 <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                   <span className="text-[#ff4500]">SELL ETH 14 @ LMT</span>
                   <span className="text-gray-500">10:35:42</span>
                 </div>
                 <div className="flex justify-between pb-2 border-b border-[#1a1a1a]">
                   <span className="text-gray-400">Risk Adj: Stop -&gt; $61k</span>
                   <span className="text-gray-500">10:35:01</span>
                 </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
