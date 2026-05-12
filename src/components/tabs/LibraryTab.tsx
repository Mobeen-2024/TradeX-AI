import React from 'react';
import { motion } from 'motion/react';
import { Library, Code, FileText, Blocks, DownloadCloud, ChevronRight, Search } from 'lucide-react';

export function LibraryTab() {
  return (
    <motion.div 
      key="library"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <Library className="w-8 h-8 text-[#00f0ff]" />
            Component & Strategy Library
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Pre-compiled Algorithms & Integrations</p>
        </div>
        <div className="flex gap-2">
           <form className="relative" onSubmit={(e) => e.preventDefault()}>
             <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Search Modules..."
               className="bg-[#050505] border border-[#222] text-white text-xs px-9 py-2 rounded-sm w-48 focus:outline-none focus:border-[#00f0ff] transition-colors"
             />
           </form>
           <button className="flex items-center gap-2 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <DownloadCloud className="w-3.5 h-3.5" />
              Import Custom
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Algorithms */}
        <div className="flex flex-col gap-4">
           <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-2">
             <Code className="w-4 h-4 text-[#a855f7]" />
             Execution Algorithms
           </h2>
           
           {[
             { name: 'TWAP Execution', desc: 'Time-Weighted Average Price execution engine for large sizes.', ver: 'v2.1', type: 'CORE' },
             { name: 'VWAP Implementation', desc: 'Volume-Weighted order routing to minimize market impact.', ver: 'v4.0', type: 'CORE' },
             { name: 'Mean Reversion', desc: 'Statistical arbitrage identifying deviations from moving averages.', ver: 'v1.4', type: 'COMMUNITY' },
           ].map((algo, i) => (
             <div key={i} className="bg-[#050505] border border-[#1a1a1a] hover:border-[#a855f7]/50 rounded-sm p-4 cursor-pointer transition-colors group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-200 font-bold text-sm tracking-wide group-hover:text-white transition-colors">{algo.name}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 border rounded uppercase font-bold tracking-widest ${algo.type === 'CORE' ? 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20' : 'bg-[#111] text-gray-400 border-[#333]'}`}>{algo.type}</span>
                </div>
                <p className="text-xs text-gray-500 font-sans leading-relaxed mb-4">{algo.desc}</p>
                <div className="flex justify-between items-center text-[10px] border-t border-[#1a1a1a] pt-3">
                  <span className="text-gray-600 font-mono">Version {algo.ver}</span>
                  <span className="text-[#a855f7] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Deploy <ChevronRight className="w-3 h-3" /></span>
                </div>
             </div>
           ))}
        </div>

        {/* Neural Networks */}
        <div className="flex flex-col gap-4">
           <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-2">
             <Blocks className="w-4 h-4 text-[#ff00f0]" />
             Neural Models
           </h2>
           
           {[
             { name: 'Sentiment NLP Core', desc: 'Real-time text analysis on X, Reddit, and News feeds.', ver: 'v5.5', type: 'CORE' },
             { name: 'Orderbook CNN', desc: 'Convolutional neural net for L2/L3 spoofing detection.', ver: 'v1.2', type: 'BETA' },
             { name: 'Macro-Economic GAN', desc: 'Generative model simulating interest rate shock scenarios.', ver: 'v2.0', type: 'CORE' },
           ].map((model, i) => (
             <div key={i} className="bg-[#050505] border border-[#1a1a1a] hover:border-[#ff00f0]/50 rounded-sm p-4 cursor-pointer transition-colors group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-200 font-bold text-sm tracking-wide group-hover:text-white transition-colors">{model.name}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 border rounded uppercase font-bold tracking-widest flex items-center gap-1 ${model.type === 'BETA' ? 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20' : 'bg-[#111] text-gray-400 border-[#333]'}`}>
                    {model.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-sans leading-relaxed mb-4">{model.desc}</p>
                <div className="flex justify-between items-center text-[10px] border-t border-[#1a1a1a] pt-3">
                  <span className="text-gray-600 font-mono">Version {model.ver}</span>
                  <span className="text-[#ff00f0] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Load Model <ChevronRight className="w-3 h-3" /></span>
                </div>
             </div>
           ))}
        </div>

        {/* Documentation / Blueprints */}
        <div className="flex flex-col gap-4">
           <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-2">
             <FileText className="w-4 h-4 text-[#0ea5e9]" />
             System Blueprints
           </h2>
           
           <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 h-full flex flex-col">
              <p className="text-xs text-gray-400 leading-relaxed font-sans mb-6">
                Access formal proofs, backtesting rig documentation, and API interface specifications for the TradeX OS execution layer.
              </p>

              <div className="space-y-2 flex-1 flex flex-col">
                 <a href="#" className="flex items-center gap-3 p-3 rounded bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors group">
                   <div className="w-8 h-8 flex items-center justify-center bg-[#111] rounded text-[#0ea5e9] group-hover:scale-110 transition-transform"><FileText className="w-4 h-4" /></div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-white tracking-wide">REST API Specs</span>
                     <span className="text-[10px] text-gray-500">Swagger Definitions</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-3 p-3 rounded bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors group">
                   <div className="w-8 h-8 flex items-center justify-center bg-[#111] rounded text-[#0ea5e9] group-hover:scale-110 transition-transform"><FileText className="w-4 h-4" /></div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-white tracking-wide">Risk Engine Logic</span>
                     <span className="text-[10px] text-gray-500">Margin & Delta formulas</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-3 p-3 rounded bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors group">
                   <div className="w-8 h-8 flex items-center justify-center bg-[#111] rounded text-[#0ea5e9] group-hover:scale-110 transition-transform"><FileText className="w-4 h-4" /></div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-white tracking-wide">WebSocket Auth</span>
                     <span className="text-[10px] text-gray-500">Security Guidelines</span>
                   </div>
                 </a>
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
