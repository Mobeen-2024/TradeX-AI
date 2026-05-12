import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Maximize2, Crosshair, Layers, Save, SlidersHorizontal, MousePointer2, ShieldAlert } from 'lucide-react';

export function ChartAnalysisTab() {
  return (
    <motion.div 
      key="chart-analysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full py-8 w-full font-mono"
    >
      <div className="flex justify-between items-end mb-6 border-b border-[#1a1a1a] pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <ImageIcon className="w-8 h-8 text-[#84cc16]" />
            Advanced Chart Analysis
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Multi-Timeframe Fractal Rendering</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-[#050505] border border-[#222] text-gray-400 hover:text-white hover:border-[#333] px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save Layout
           </button>
           <button className="flex items-center gap-2 bg-[#84cc16]/10 text-[#84cc16] hover:bg-[#84cc16]/20 border border-[#84cc16]/30 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
              Fullscreen
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-[600px]">
        {/* Toolbar */}
        <div className="w-12 flex-shrink-0 flex flex-col gap-2 bg-[#050505] border border-[#1a1a1a] rounded-sm py-2 items-center">
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors" title="Select">
             <MousePointer2 className="w-4 h-4" />
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20" title="Crosshair">
             <Crosshair className="w-4 h-4" />
           </button>
           <div className="w-6 h-[1px] bg-[#1a1a1a] my-1"></div>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors" title="Trend Line">
             <div className="w-4 h-[2px] bg-current rotate-45"></div>
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors" title="Fibonacci">
             <div className="flex flex-col gap-[2px] w-4">
               <div className="w-full h-[1px] bg-current"></div>
               <div className="w-full h-[1px] bg-current"></div>
               <div className="w-full h-[1px] bg-current"></div>
             </div>
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors" title="Rect">
             <div className="w-4 h-3 border border-current rounded-sm"></div>
           </button>
        </div>

        {/* Main Chart Canvas */}
        <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm relative flex flex-col overflow-hidden">
           {/* Chart Header */}
           <div className="h-10 border-b border-[#1a1a1a] flex items-center justify-between px-3 bg-[#0a0a0a]/50">
             <div className="flex items-center gap-4">
                <span className="font-bold text-white text-sm font-sans tracking-wide">BTC/USDT</span>
                <div className="flex gap-1">
                  {['15m', '1H', '4H', '1D', '1W'].map((t) => (
                    <button key={t} className={`px-2 py-0.5 text-[10px] rounded font-bold ${t === '4H' ? 'bg-[#111] text-white border border-[#333]' : 'text-gray-500 hover:text-white'}`}>{t}</button>
                  ))}
                </div>
                <div className="w-[1px] h-4 bg-[#222]"></div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-gray-500">O: <span className="text-gray-300">64120</span></span>
                  <span className="text-gray-500">H: <span className="text-gray-300">64500</span></span>
                  <span className="text-gray-500">L: <span className="text-gray-300">63800</span></span>
                  <span className="text-gray-500">C: <span className="text-[#39ff14]">64320</span></span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-white p-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button className="text-gray-400 hover:text-white p-1">
                  <Layers className="w-3.5 h-3.5" />
                </button>
             </div>
           </div>

           {/* The Canvas (Fake) */}
           <div className="flex-1 relative overflow-hidden bg-[#020202] cursor-crosshair">
              {/* Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(#1a1a1a_1px,transparent_1px),linear-gradient(90deg,#1a1a1a_1px,transparent_1px)] [background-size:40px_40px] opacity-30"></div>
              
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none font-sans font-black text-8xl tracking-widest text-white">
                TRADEX
              </div>

              {/* Fake Candles & Volume */}
              <div className="absolute bottom-10 left-10 right-16 top-10 border-b border-t border-[#111] opacity-50"></div>

              {/* Price Scale Right */}
              <div className="absolute right-0 top-0 bottom-0 w-14 border-l border-[#1a1a1a] bg-[#050505] flex flex-col justify-between py-10 text-[9px] text-gray-500 items-center">
                 <span>65000</span>
                 <span>64500</span>
                 <span className="text-white bg-[#111] w-full text-center py-1 border-y border-[#333]">64320</span>
                 <span>64000</span>
                 <span>63500</span>
              </div>

              {/* Time Scale Bottom */}
              <div className="absolute bottom-0 left-0 right-14 h-6 border-t border-[#1a1a1a] bg-[#050505] flex justify-between px-10 text-[9px] text-gray-500 items-center">
                 <span>12:00</span>
                 <span>16:00</span>
                 <span>20:00</span>
                 <span>00:00</span>
                 <span>04:00</span>
              </div>
              
              {/* AI Overlay Element */}
              <div className="absolute top-[30%] left-[40%] bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto w-64">
                <div className="flex items-center gap-2 text-[#84cc16] font-mono font-bold text-[10px] uppercase mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> Orderblock Detected
                </div>
                <div className="text-gray-300 text-xs leading-relaxed font-sans mb-3">
                  High-probability mitigation block aligned with 4H fair value gap.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-bold bg-[#84cc16]/10 text-[#84cc16] px-1.5 py-0.5 rounded border border-[#84cc16]/20">Volume Confirm: 88%</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
