import React from 'react';
import { Shield, Zap, Search, Bell } from 'lucide-react';

export function TopIntelligenceBar() {
  return (
    <header className="h-12 bg-[#020202] border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-sm bg-[#39ff14] opacity-80"></div>
           <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">System <span className="text-white">Active</span></span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
           <Shield className="w-3.5 h-3.5 text-[#0ea5e9]" />
           Risk Guard: <span className="text-[#0ea5e9]">Level 2</span>
        </div>
        <div className="h-4 w-[1px] bg-[#1a1a1a]"></div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
           <Zap className="w-3.5 h-3.5 text-[#facc15]" />
           Global Latency: <span className="text-[#facc15]">14ms</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <div className="relative">
           <Search className="w-3.5 h-3.5 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Command Interface..." 
             className="bg-[#0a0a0a] border border-[#222] text-xs font-mono px-8 py-1 rounded-sm w-64 focus:outline-none focus:border-[#00f0ff] transition-colors text-white"
           />
           <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-600 border border-[#333] px-1 rounded-sm bg-[#111]">⌘K</span>
         </div>
         <button className="text-gray-500 hover:text-white transition-colors relative cursor-pointer">
           <Bell className="w-4 h-4" />
           <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff4500] rounded-full border border-[#020202]"></span>
         </button>
      </div>
    </header>
  );
}
