import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Sparkles, TrendingUp } from 'lucide-react';

export function AlphaGenerationTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Alpha Generation</h2>
          <p className="text-sm text-gray-400 font-mono">Yield exploration and capital opportunities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder cards for Alpha Generation */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">Arbitrage Scan</h3>
            <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
          </div>
          <p className="text-[11px] text-gray-500 font-mono mb-4">Cross-exchange spread detection running.</p>
          <div className="h-2 bg-[#111] rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#00f0ff] w-[45%]" />
          </div>
        </div>
        
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">Yield Farming</h3>
            <TrendingUp className="w-4 h-4 text-[#39ff14]" />
          </div>
          <p className="text-[11px] text-gray-500 font-mono mb-4">DeFi liquidity pool tracking.</p>
          <div className="h-2 bg-[#111] rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-[#39ff14] to-emerald-400 w-[60%]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
