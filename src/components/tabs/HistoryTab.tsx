import React from 'react';
import { motion } from 'motion/react';
import { Archive, Download, Filter, Search, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export function HistoryTab() {
  const mockTrades = [
    { id: 'T-9821', pair: 'BTC/USDT', type: 'LONG', entry: 63100, exit: 64250, pnl: '+1.82%', amount: '12.5', time: '2024-05-12 14:30:21', status: 'CLOSED', agent: 'Quant-v4' },
    { id: 'T-9820', pair: 'ETH/USDT', type: 'SHORT', entry: 3105, exit: 3080, pnl: '+0.81%', amount: '150.0', time: '2024-05-12 12:15:05', status: 'CLOSED', agent: 'Alpha-Seeker' },
    { id: 'T-9819', pair: 'SOL/USDT', type: 'LONG', entry: 145.2, exit: 142.1, pnl: '-2.13%', amount: '850', time: '2024-05-12 09:44:11', status: 'STOP_LOSS', agent: 'Momentum Scalper' },
    { id: 'T-9818', pair: 'BTC/USDT', type: 'SHORT', entry: 64500, exit: 63800, pnl: '+1.08%', amount: '8.2', time: '2024-05-11 22:10:55', status: 'CLOSED', agent: 'Quant-v4' },
    { id: 'T-9817', pair: 'AVAX/USDT', type: 'LONG', entry: 35.5, exit: 38.2, pnl: '+7.60%', amount: '2400', time: '2024-05-11 18:20:00', status: 'TAKE_PROFIT', agent: 'Quant-v4' },
    { id: 'T-9816', pair: 'DOGE/USDT', type: 'SHORT', entry: 0.165, exit: 0.170, pnl: '-3.03%', amount: '150000', time: '2024-05-11 15:05:33', status: 'STOP_LOSS', agent: 'Sentiment NLP' },
    { id: 'T-9815', pair: 'BTC/USDT', type: 'LONG', entry: 62000, exit: 63000, pnl: '+1.61%', amount: '15.0', time: '2024-05-11 08:30:12', status: 'CLOSED', agent: 'Macro' },
  ];

  return (
    <motion.div 
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <Archive className="w-8 h-8 text-gray-400" />
            Execution Archive
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Immutable Trade Ledger & Performance</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-[#050505] border border-[#222] text-gray-400 hover:text-white hover:border-[#333] px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
           </button>
           <button className="flex items-center gap-2 bg-[#050505] border border-[#222] text-gray-400 hover:text-white hover:border-[#333] px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export CSV
           </button>
        </div>
      </div>

      <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm overflow-hidden flex flex-col shadow-none">
        
        {/* Table Header Controls */}
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]/50">
           <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search ID or Asset..."
                 className="bg-[#020202] border border-[#222] text-white text-xs px-9 py-1.5 rounded-sm w-48 focus:outline-none focus:border-gray-500 transition-colors"
               />
             </div>
             <div className="h-4 w-[1px] bg-[#222]"></div>
             <span className="text-xs text-gray-500">Showing last <span className="text-white font-bold">7</span> trades</span>
           </div>
           
           <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Win Rate:</span>
                <span className="text-[#39ff14] font-bold">71.4%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Realized PNL:</span>
                <span className="text-[#39ff14] font-bold">+$12,450.00</span>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#020202] border-b border-[#1a1a1a] text-[10px] uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3 font-semibold">Trade ID</th>
                <th className="px-4 py-3 font-semibold">Time (UTC)</th>
                <th className="px-4 py-3 font-semibold">Pair</th>
                <th className="px-4 py-3 font-semibold">Side</th>
                <th className="px-4 py-3 font-semibold">Entry &rarr; Exit</th>
                <th className="px-4 py-3 font-semibold text-right">PNL %</th>
                <th className="px-4 py-3 font-semibold">Execution Agent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#111]">
              {mockTrades.map((trade, i) => {
                const isProfit = trade.pnl.startsWith('+');
                return (
                  <tr key={i} className="hover:bg-[#0a0a0a] transition-colors group cursor-pointer">
                    <td className="px-4 py-3 font-mono text-gray-400 group-hover:text-white transition-colors">{trade.id}</td>
                    <td className="px-4 py-3 text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3 h-3" /> {trade.time}
                    </td>
                    <td className="px-4 py-3 font-bold font-sans text-gray-200">{trade.pair}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${trade.type === 'LONG' ? 'bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20' : 'bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {trade.entry} <span className="text-gray-600 mx-1">→</span> {trade.exit}
                    </td>
                    <td className={`px-4 py-3 font-bold text-right flex items-center justify-end gap-1 ${isProfit ? 'text-[#39ff14]' : 'text-[#ff4500]'}`}>
                      {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {trade.pnl}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{trade.agent}</td>
                    <td className="px-4 py-3">
                       <span className={`text-[10px] uppercase font-bold tracking-wider ${trade.status === 'CLOSED' || trade.status === 'TAKE_PROFIT' ? 'text-gray-400' : 'text-gray-600'}`}>
                         {trade.status}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Fake */}
        <div className="p-3 border-t border-[#1a1a1a] bg-[#020202] flex justify-between items-center text-xs text-gray-500">
           <span>Page 1 of 124</span>
           <div className="flex gap-2">
             <button className="px-3 py-1 border border-[#222] rounded-sm hover:bg-[#111] hover:text-white transition-colors">Prev</button>
             <button className="px-3 py-1 border border-[#222] rounded-sm bg-[#111] text-white">1</button>
             <button className="px-3 py-1 border border-[#222] rounded-sm hover:bg-[#111] hover:text-white transition-colors">2</button>
             <button className="px-3 py-1 border border-[#222] rounded-sm hover:bg-[#111] hover:text-white transition-colors">3</button>
             <button className="px-3 py-1 border border-[#222] rounded-sm hover:bg-[#111] hover:text-white transition-colors">Next</button>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
