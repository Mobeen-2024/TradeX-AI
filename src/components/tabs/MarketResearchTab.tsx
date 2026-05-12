import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, ArrowUpRight, ArrowDownRight, Filter, Globe, Database, Network } from 'lucide-react';

export function MarketResearchTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.div 
      key="market-research"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <BookOpen className="w-8 h-8 text-[#0ea5e9]" />
            Deep Market Intelligence
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Global Macro & On-Chain Synthesis</p>
        </div>
        <div className="flex gap-2">
           <form className="relative" onSubmit={(e) => e.preventDefault()}>
             <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="QUERY ASSET OR MACRO THEME..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-[#050505] border border-[#222] text-white text-xs px-9 py-2 rounded-sm w-64 focus:outline-none focus:border-[#0ea5e9] transition-colors"
             />
           </form>
           <button className="bg-[#050505] border border-[#222] px-3 py-2 flex items-center justify-center rounded-sm hover:border-[#333] transition-colors">
             <Filter className="w-4 h-4 text-gray-400" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Feed */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Intelligence Banner */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden flex items-start gap-5">
             <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded border border-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
               <Globe className="w-6 h-6 text-[#0ea5e9]" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <h2 className="text-gray-200 font-bold font-sans text-lg">AI Macro Synthesis Report</h2>
                 <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-[#0ea5e9]/20">Generated 2m ago</span>
               </div>
               <p className="text-sm text-gray-400 leading-relaxed font-sans mb-3">
                 System indicates a 68% probability of liquidity compression entering the European session. Tech equities exhibit decoupling from legacy bond yields. Recommend reducing delta exposure by 0.2 in leading digital assets.
               </p>
               <div className="flex gap-4 border-t border-[#1a1a1a] pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Correlation</span>
                    <span className="text-[#ff4500] text-sm font-bold flex items-center gap-1 font-sans">BTC/QQQ <ArrowDownRight className="w-3.5 h-3.5" /> -0.4</span>
                  </div>
                  <div className="w-[1px] bg-[#1a1a1a]"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Risk Sentiment</span>
                    <span className="text-[#facc15] text-sm font-bold font-sans">Risk-Off (Elevated)</span>
                  </div>
               </div>
             </div>
          </div>

          {/* Research Feed */}
          <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm flex flex-col">
            <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]/50">
              <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4 text-gray-500" />
                Aggregated Signal Feed
              </h3>
              <div className="flex gap-2">
                 <button className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-1 border border-[#0ea5e9]/20 rounded transition-colors uppercase font-bold">All Signals</button>
                 <button className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1 uppercase font-bold transition-colors">On-Chain</button>
                 <button className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1 uppercase font-bold transition-colors">Social Sentiment</button>
              </div>
            </div>

            <div className="flex-1 flex flex-col divide-y divide-[#1a1a1a] overflow-y-auto min-h-[300px]">
               {/* Signal Item */}
               <div className="p-4 hover:bg-[#0a0a0a] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#0ea5e9] font-bold">#ONCHAIN_WHALE</span>
                      <span className="text-[10px] text-gray-600">14:02:18 UTC</span>
                    </div>
                    <span className="bg-[#39ff14]/10 text-[#39ff14] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#39ff14]/20">High Impact</span>
                  </div>
                  <h4 className="text-gray-200 font-sans font-medium text-sm mb-2 group-hover:text-white transition-colors">Large Exchange Outflow Detected</h4>
                  <p className="text-xs text-gray-500 font-sans line-clamp-2">
                    Analysis of raw mempool data confirms 14,500 BTC moved off Binance to cold storage wallets. Structural accumulation pattern matched against historical fractal (confidence: 91%).
                  </p>
               </div>
               {/* Signal Item */}
               <div className="p-4 hover:bg-[#0a0a0a] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#a855f7] font-bold">#SOCIAL_SENTIMENT</span>
                      <span className="text-[10px] text-gray-600">13:45:00 UTC</span>
                    </div>
                    <span className="bg-[#facc15]/10 text-[#facc15] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#facc15]/20">Medium Impact</span>
                  </div>
                  <h4 className="text-gray-200 font-sans font-medium text-sm mb-2 group-hover:text-white transition-colors">Retail Exhaustion on X (Twitter)</h4>
                  <p className="text-xs text-gray-500 font-sans line-clamp-2">
                    NLP models parsing leading FinTwit accounts detect peak fear semantics. Historical backwardation suggests standard bottoming phase.
                  </p>
               </div>
               {/* Signal Item */}
               <div className="p-4 hover:bg-[#0a0a0a] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#ff4500] font-bold">#DERIVATIVES</span>
                      <span className="text-[10px] text-gray-600">13:12:44 UTC</span>
                    </div>
                    <span className="bg-[#ff4500]/10 text-[#ff4500] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#ff4500]/20">Critical</span>
                  </div>
                  <h4 className="text-gray-200 font-sans font-medium text-sm mb-2 group-hover:text-white transition-colors">Funding Rate Divergence</h4>
                  <p className="text-xs text-gray-500 font-sans line-clamp-2">
                    Perpetual swap funding rates deeply negative while spot price holds structural support. Extreme short squeeze probability (86%).
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Data Sources & Topics */}
        <div className="xl:col-span-1 flex flex-col gap-6">
           <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 border-l-[3px] border-l-[#0ea5e9]">
             <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0ea5e9]" />
                Active Knowledge Sources
             </h3>
             <ul className="space-y-3">
               <li className="flex justify-between items-center text-xs">
                 <span className="text-gray-300">Glassnode API</span>
                 <span className="text-[#39ff14] text-[10px]">Synced</span>
               </li>
               <li className="flex justify-between items-center text-xs">
                 <span className="text-gray-300">Binance Orderbook</span>
                 <span className="text-[#39ff14] text-[10px] opacity-80">Streaming</span>
               </li>
               <li className="flex justify-between items-center text-xs">
                 <span className="text-gray-300">Bloomberg RSS</span>
                 <span className="text-gray-500 text-[10px]">Delayed (5m)</span>
               </li>
             </ul>
           </div>

           <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col">
             <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">Trending Vectors</h3>
             <div className="flex flex-wrap gap-2">
               {['#L1_ROTATION', '#AI_TOKENS', '#MACRO_RATES', '#ETF_FLOWS', '#STABLECOIN_SUPPLY'].map(tag => (
                 <span key={tag} className="text-[10px] px-2 py-1 bg-[#111] border border-[#222] text-gray-400 rounded cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors uppercase">
                   {tag}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
