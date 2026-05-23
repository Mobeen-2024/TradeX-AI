import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Wallet, 
  ShieldAlert, 
  Power, 
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Cpu,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

type MobileTab = 'Overview' | 'Alerts' | 'Risk' | 'Emergency';

export function MobileApp() {
  const [activeTab, setActiveTab] = useState<MobileTab>('Overview');
  const [showApproval, setShowApproval] = useState(true);

  return (
    <div className="flex flex-col min-h-dvh w-full bg-[#050505] text-white font-sans md:hidden relative overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]">
         <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00f0ff]" />
            <span className="font-bold tracking-widest text-sm uppercase">TradeX Mobile</span>
         </div>
         <div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-pulse"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
         {activeTab === 'Overview' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Portfolio Summary */}
              <div className="bg-[#111] border border-[#222] rounded-lg p-5">
                 <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Balance</h3>
                 <div className="text-3xl font-bold tracking-tight mb-2">$142,580.40</div>
                 <div className="flex items-center gap-2 text-[#39ff14] text-xs font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                    +$2,450.20 (2.4%) Today
                 </div>
              </div>

              {/* Quick Trade Approval Modal-ish */}
              {showApproval && (
                <div className="bg-[#0a0a0a] border border-[#00f0ff]/30 rounded-lg p-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-[#00f0ff]"></div>
                   <div className="flex items-start gap-3 mb-3">
                      <Cpu className="w-5 h-5 text-[#00f0ff] shrink-0" />
                      <div>
                         <div className="text-xs font-bold text-white uppercase tracking-widest">AI Action Required</div>
                         <div className="text-[10px] text-gray-400 font-mono mt-1">Agent Alpha seeks approval to enter LONG BTC/USDT.</div>
                      </div>
                   </div>
                   <div className="bg-[#111] p-2 rounded border border-[#222] text-[10px] font-mono text-gray-300 mb-3 space-y-1">
                      <div className="flex justify-between"><span>Size:</span><span className="text-white">1.5 BTC</span></div>
                      <div className="flex justify-between"><span>Leverage:</span><span className="text-white">10x</span></div>
                      <div className="flex justify-between"><span>Risk:</span><span className="text-[#facc15]">Moderate</span></div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setShowApproval(false)} className="flex-1 bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#39ff14]/20 transition-colors flex justify-center items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                     </button>
                     <button onClick={() => setShowApproval(false)} className="flex-1 bg-transparent border border-[#333] text-gray-400 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#222] transition-colors">
                        Reject
                     </button>
                   </div>
                </div>
              )}

              {/* Active Positions Mini */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Active Positions</h3>
                <div className="space-y-2">
                   <div className="bg-[#111] border border-[#222] rounded p-3 flex justify-between items-center">
                      <div>
                         <div className="font-bold text-sm">ETH/USDT</div>
                         <div className="text-[10px] text-[#39ff14] uppercase tracking-widest font-mono">LONG 10x</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[#39ff14] font-bold text-sm">+$450.20</div>
                         <div className="text-[10px] text-gray-500 font-mono">PNL</div>
                      </div>
                   </div>
                   <div className="bg-[#111] border border-[#222] rounded p-3 flex justify-between items-center">
                      <div>
                         <div className="font-bold text-sm">SOL/USDT</div>
                         <div className="text-[10px] text-[#ff4500] uppercase tracking-widest font-mono">SHORT 5x</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[#ff4500] font-bold text-sm">-$120.50</div>
                         <div className="text-[10px] text-gray-500 font-mono">PNL</div>
                      </div>
                   </div>
                </div>
              </div>
           </motion.div>
         )}

         {activeTab === 'Alerts' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-[#ff00f0]" /> AI Notifications</h2>
              <div className="bg-[#111] border border-[#ff00f0]/30 rounded p-3 flex gap-3">
                 <div className="mt-1"><AlertTriangle className="w-4 h-4 text-[#ff00f0]" /></div>
                 <div>
                    <div className="text-xs font-bold text-[#ff00f0] uppercase tracking-widest mb-1">Volatility Spike detected</div>
                    <div className="text-[11px] text-gray-400 font-mono">BTC standard deviation exceeded 3 sigma. Risk agent narrowing stops.</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest mt-2 font-bold">2 mins ago</div>
                 </div>
              </div>
              <div className="bg-[#111] border border-[#222] rounded p-3 flex gap-3">
                 <div className="mt-1"><Activity className="w-4 h-4 text-[#00f0ff]" /></div>
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">Strategy Rebalance</div>
                    <div className="text-[11px] text-gray-400 font-mono">Mean-Reversion v2 closed 3 positions reaching profit targets.</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest mt-2 font-bold">1 hour ago</div>
                 </div>
              </div>
           </motion.div>
         )}

         {activeTab === 'Risk' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#facc15]" /> Risk Warnings</h2>
              
              <div className="bg-[#facc15]/5 border border-[#facc15]/30 rounded p-4">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-[#facc15] uppercase tracking-widest">Global Exposure</span>
                    <span className="text-[#facc15] text-sm font-mono font-bold">64%</span>
                 </div>
                 <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-[#facc15] to-[#ff4500]" style={{ width: '64%' }}></div>
                 </div>
                 <p className="text-[10px] text-gray-400 font-mono mt-3">High exposure detected. Consider reducing leverage on tech sector assets.</p>
              </div>

              <div className="bg-[#111] border border-[#222] rounded p-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Agent Constraints</h3>
                 <div className="space-y-2 text-[10px] uppercase font-mono tracking-widest">
                    <div className="flex justify-between border-b border-[#222] pb-2">
                       <span className="text-gray-400">Max Drawdown Limit</span>
                       <span className="text-white">5.0%</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222] py-2">
                       <span className="text-gray-400">Current Drawdown</span>
                       <span className="text-[#39ff14]">1.2%</span>
                    </div>
                    <div className="flex justify-between pt-2">
                       <span className="text-gray-400">Agent Override</span>
                       <span className="text-[#00f0ff]">Enabled</span>
                    </div>
                 </div>
              </div>
           </motion.div>
         )}

         {activeTab === 'Emergency' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex flex-col items-center justify-center pt-8">
              <div className="text-center mb-4">
                 <h2 className="text-xl font-bold text-[#ff4500] uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                   <AlertTriangle className="w-5 h-5" /> Emergency
                 </h2>
                 <p className="text-xs text-gray-500 uppercase tracking-widest px-4">Use these controls only in critical market events</p>
              </div>

              <button className="w-full relative overflow-hidden bg-black border border-[#ff4500]/50 hover:bg-[#ff4500]/10 rounded-lg p-6 group transition-colors">
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#ff4500]"></div>
                 <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-[#ff4500] flex items-center justify-center bg-[#111] group-hover:scale-105 transition-transform">
                       <Power className="w-8 h-8 text-[#ff4500]" />
                    </div>
                    <div className="text-center">
                       <div className="font-bold text-white uppercase tracking-widest text-lg">Kill Switch</div>
                       <div className="text-[#ff4500] text-[10px] uppercase tracking-widest mt-1">Halt system operations</div>
                    </div>
                 </div>
              </button>

              <button className="w-full bg-black border border-[#facc15]/50 hover:bg-[#facc15]/10 rounded-lg p-6 group transition-colors flex gap-4 items-center">
                 <div className="w-12 h-12 rounded-full border-2 border-[#facc15] flex items-center justify-center bg-[#111] shrink-0">
                    <ShieldAlert className="w-5 h-5 text-[#facc15]" />
                 </div>
                 <div>
                    <div className="font-bold text-white uppercase tracking-widest text-sm">Risk Lockdown</div>
                    <div className="text-[#facc15] text-[10px] uppercase tracking-widest mt-1">Close all active positions</div>
                 </div>
              </button>
           </motion.div>
         )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] p-2 flex justify-around absolute bottom-0 left-0 right-0 z-50">
         <button onClick={() => setActiveTab('Overview')} className={`flex flex-col items-center justify-center p-2 rounded flex-1 ${activeTab === 'Overview' ? 'text-white' : 'text-gray-600'}`}>
            <Wallet className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Monitor</span>
         </button>
         <button onClick={() => setActiveTab('Alerts')} className={`flex flex-col items-center justify-center p-2 rounded flex-1 relative ${activeTab === 'Alerts' ? 'text-[#ff00f0]' : 'text-gray-600'}`}>
            <div className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-[#ff00f0]"></div>
            <Bell className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Alerts</span>
         </button>
         <button onClick={() => setActiveTab('Risk')} className={`flex flex-col items-center justify-center p-2 rounded flex-1 ${activeTab === 'Risk' ? 'text-[#facc15]' : 'text-gray-600'}`}>
            <ShieldAlert className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Risk</span>
         </button>
         <button onClick={() => setActiveTab('Emergency')} className={`flex flex-col items-center justify-center p-2 rounded flex-1 ${activeTab === 'Emergency' ? 'text-[#ff4500]' : 'text-gray-600'}`}>
            <Power className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Controls</span>
         </button>
      </div>
    </div>
  );
}
