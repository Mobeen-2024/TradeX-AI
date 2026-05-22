import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Server, Database } from 'lucide-react';

export function SystemConfigurationTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">System Configuration</h2>
          <p className="text-sm text-gray-400 font-mono">Kernel settings and module integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200">Execution Node</h3>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">Latency Mode</span>
            <span className="text-[11px] text-[#00f0ff] font-mono">Ultra-Low</span>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">API Throttling</span>
            <span className="text-[11px] text-gray-300 font-mono">100 req/s</span>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200">Security Parameters</h3>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">Auto-Kill Switch</span>
            <span className="text-[11px] text-[#39ff14] font-mono">Armed</span>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">Max Global Drawdown</span>
            <span className="text-[11px] text-red-500 font-mono">10.0%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
