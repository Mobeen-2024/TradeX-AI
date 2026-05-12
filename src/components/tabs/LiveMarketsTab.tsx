import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LineChart, Activity, Zap, ShieldAlert, Cpu, Eye, ArrowUpRight, ArrowDownRight, Radio, Terminal } from 'lucide-react';

function ExecutionLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "SYSTEM: INITIALIZING QUANT-V4 KERNEL...",
      "AGENT: ANALYZING ORDER FLOW IMBALANCE AT $64,300...",
      "RISK_ENGINE: CHECKING MARGIN ALLOCATION. NORMAL.",
      "AGENT: DETECTED SPOOFING ALGORITHM ON L2 ASK MATRIX.",
      "SYSTEM: RECALIBRATING MICRO-TREND THRESHOLDS...",
      "EXECUTION: DYNAMIC HEDGE DEPLOYED (H-ID: x88B1).",
      "AGENT: LIQUIDITY VACUUM IDENTIFIED BELOW $64,150.",
      "RISK_ENGINE: EXPOSURE DELTA ADJUSTED -> 0.4.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, messages[i % messages.length]]);
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 relative overflow-hidden h-[160px] flex flex-col font-mono text-[10px] leading-tight">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-30"></div>
      <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
        <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
        Tactical Execution Feed
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5 scroll-smooth">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-gray-600">[{new Date().toISOString().split('T')[1].slice(0, -1)}]</span>
            <span className={
              log.startsWith('AGENT:') ? 'text-[#0ea5e9]' :
              log.startsWith('RISK_ENGINE:') ? 'text-[#84cc16]' :
              log.startsWith('EXECUTION:') ? 'text-[#ff4500]' :
              'text-gray-400'
            }>{log}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
    </div>
  );
}

export function LiveMarketsTab() {
  const [dataStream, setDataStream] = useState<number[]>(Array(50).fill(64200));

  useEffect(() => {
    // Simulate high-frequency data stream
    const interval = setInterval(() => {
      setDataStream(prev => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 50;
        return [...prev.slice(1), last + change];
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      key="live-markets-v2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col min-h-full pb-10 w-full"
    >
      {/* Top Header / Market Status */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <Radio className="w-6 h-6 text-[#0ea5e9]" />
            Live Market Feed
          </h1>
          <p className="text-gray-400 text-sm font-mono tracking-wide">AI-DRIVEN HIGH-FREQUENCY PIPELINE</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Latency</span>
            <span className="text-[#39ff14] font-mono text-sm">2.4ms</span>
          </div>
          <div className="h-8 w-[1px] bg-[#1a1a1a]"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Network</span>
            <span className="text-[#00f0ff] font-mono text-sm">Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Chart Area (Spans 3 cols) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          
          {/* Main Price Action Canvas Component */}
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden shadow-none">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none hidden"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">BTC/USDT-PERP</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-xs font-mono font-bold">LONG</span>
                </div>
                <div className="font-mono text-4xl text-white font-medium flex items-center gap-2">
                  <span className="text-gray-500 text-2xl">$</span>
                  {dataStream[dataStream.length - 1].toFixed(1)}
                  <span className="text-[#39ff14] text-lg flex items-center mb-1"><ArrowUpRight className="w-5 h-5 stroke-[3]"/> 2.14%</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1H', '4H', '1D'].map((time) => (
                  <button key={time} className={`px-4 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-all ${time === '1m' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30' : 'bg-[#0a0a0a] text-gray-500 hover:text-gray-300 border border-[#222]'}`}>
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Fake Chart Area */}
            <div className="h-[380px] w-full border border-[#1a1a1a] rounded-sm bg-[#0a0a0a] relative flex flex-col items-center justify-center overflow-hidden">
               {/* Trend Line (Fake SVG) */}
               <svg className="absolute w-full h-full preserve-3d" viewBox="0 0 1000 400" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                    <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2"/>
                       <stop offset="100%" stopColor="#000" stopOpacity="0"/>
                    </linearGradient>
                 </defs>
                 
                 <path 
                   d={`M 0,300 ${dataStream.map((val, i) => `L ${i * (1000 / 50)},${400 - ((val - 64000) / 400) * 400}`).join(' ')}`}
                   fill="none"
                   stroke="url(#glowLine)"
                   strokeWidth="3"
                   className="transition-all duration-75"
                 />
                 <path 
                   d={`M 0,400 L 0,300 ${dataStream.map((val, i) => `L ${i * (1000 / 50)},${400 - ((val - 64000) / 400) * 400}`).join(' ')} L 1000,400 Z`}
                   fill="url(#fadeBottom)"
                   className="transition-all duration-75"
                 />
                 
                 {/* Current Price Dot */}
                 <circle cx="1000" cy={400 - ((dataStream[dataStream.length - 1] - 64000) / 400) * 400} r="6" fill="#39ff14" />
               </svg>
               
               {/* Vertical grid lines overlay */}
               <div className="absolute inset-0 flex justify-between px-10 pointer-events-none opacity-20">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="w-[1px] h-full bg-[#00f0ff] mix-blend-screen"></div>
                 ))}
               </div>
            </div>
            
            {/* AI Agent Analysis Banner */}
            <div className="mt-4 bg-[#ff4500]/5 border border-[#ff4500]/20 rounded-sm p-3 flex items-start gap-4">
               <div className="w-8 h-8 rounded-sm bg-[#ff4500]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <ShieldAlert className="w-4 h-4 text-[#ff4500]" />
               </div>
               <div>
                  <h4 className="text-[#ff4500] font-bold text-sm tracking-wide flex items-center gap-2">
                    Critical Liquidity Zone Approaching
                    <span className="text-[10px] bg-[#ff4500] text-black px-1.5 py-0.5 rounded font-black uppercase">Alpha Signal</span>
                  </h4>
                  <p className="text-[#ff4500]/70 text-xs mt-1 leading-relaxed">
                    Agent 'Quant-v4' detected anomalous high-density ask walls at $64,350. Order flow imbalance suggests a 78% probability of rejection. Algorithm adjusting risk parameters from 1.5 to 0.8 automatically.
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Volume Delta Analysis */}
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent opacity-50"></div>
              <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0ea5e9]" />
                Cumulative Volume Delta
              </h3>
              <div className="flex items-end gap-2 h-24 mb-2">
                {[...Array(20)].map((_, i) => {
                  const isPositive = Math.random() > 0.4;
                  const height = Math.random() * 100;
                  return (
                     <div key={i} className="flex-1 rounded-t-sm flex items-end justify-center group relative h-full">
                       <div 
                         className={`w-full rounded-sm transition-all duration-300 ${isPositive ? 'bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.3)]' : 'bg-[#ff4500] shadow-[0_0_8px_rgba(255,69,0,0.3)]'}`} 
                         style={{ height: `${height}%` }}
                       ></div>
                     </div>
                  );
                })}
              </div>
            </div>

            {/* AI Decision Confidence */}
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#84cc16]/5 blur-[50px] rounded-full hidden"></div>
               <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Cpu className="w-4 h-4 text-[#84cc16]" />
                 AI Model Confidence
               </h3>
               <div className="flex items-center justify-center p-2 mt-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#111" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#84cc16" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="45" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold text-white tracking-tighter">82<span className="text-sm text-gray-400">%</span></span>
                     <span className="text-[#84cc16] text-[10px] font-bold uppercase tracking-widest mt-0.5">Strong</span>
                  </div>
               </div>
            </div>
          </div>
          
          <ExecutionLog />
        </div>

        {/* Right Sidebar: Order Book & Trades (Spans 1 col) */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col overflow-hidden relative shadow-none">
             <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1a1a]">
               <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                 <Eye className="w-4 h-4 text-[#00f0ff]" />
                 L2 Market Depth
               </h3>
             </div>
             
             {/* Dynamic Asks (Radiant Coral/Red) */}
             <div className="flex-1 flex flex-col-reverse justify-end gap-[2px] font-mono text-[11px] overflow-hidden">
               {[...Array(14)].map((_, i) => {
                 const price = (64200 + i * 1.5).toFixed(1);
                 const size = (Math.random() * 5).toFixed(3);
                 const sum = (Math.random() * 100).toFixed(1);
                 const depth = Math.random() * 100;
                 return (
                   <div key={`ask-${i}`} className="flex justify-between relative py-1 px-1 group cursor-pointer">
                     <div className="absolute top-0 right-0 h-full bg-[#ff4500]/15" style={{ width: `${depth}%`}}></div>
                     <span className="text-[#ff4500] relative z-10 font-bold">{price}</span>
                     <span className="text-gray-400 relative z-10">{size}</span>
                     <span className="text-gray-600 relative z-10">{sum}</span>
                   </div>
                 );
               })}
             </div>
             
             {/* Spread Display */}
             <div className="py-3 my-2 border-y border-[#222] flex justify-between items-center text-sm font-bold font-mono px-2 bg-[#0ea5e9]/5 rounded border border-[#0ea5e9]/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
               <span className="text-[#39ff14] flex items-center"><ArrowUpRight className="w-4 h-4 mr-1"/> 64,198.5</span>
               <span className="text-[#00f0ff] text-xs">Spread: 1.5</span>
             </div>

             {/* Dynamic Bids (Sky Blue/Teal/Lime) */}
             <div className="flex-1 flex flex-col gap-[2px] font-mono text-[11px] overflow-hidden">
               {[...Array(14)].map((_, i) => {
                 const price = (64197 - i * 1.5).toFixed(1);
                 const size = (Math.random() * 5).toFixed(3);
                 const sum = (Math.random() * 100).toFixed(1);
                 const depth = Math.random() * 100;
                 return (
                   <div key={`bid-${i}`} className="flex justify-between relative py-1 px-1 group cursor-pointer">
                     <div className="absolute top-0 right-0 h-full bg-[#00f0ff]/10" style={{ width: `${depth}%`}}></div>
                     <span className="text-[#0ea5e9] relative z-10 font-bold">{price}</span>
                     <span className="text-gray-400 relative z-10">{size}</span>
                     <span className="text-gray-600 relative z-10">{sum}</span>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
