import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, Shield, Server, Database, Save, Power } from "lucide-react";
import { useSystemStore } from "../../store/systemStore";

export function SystemConfigurationTab() {
  const [config, setConfig] = useState({
    latencyMode: "Ultra-Low",
    killSwitch: false,
    maxDrawdown: 10.0,
    apiRate: 100,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/system/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Error fetching system config", err);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setSaving(true);
    try {
      await fetch("/api/system/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          <h2 className="text-xl font-bold text-white tracking-wide">
            System Configuration
          </h2>
          <p className="text-sm text-gray-400 font-mono">
            Kernel settings and module integrations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200">
              Execution Node
            </h3>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">
              Latency Mode
            </span>
            <select
              value={config.latencyMode}
              onChange={(e) => handleSave({ latencyMode: e.target.value })}
              className="bg-transparent text-[11px] text-[#00f0ff] font-mono outline-none text-right cursor-pointer"
            >
              <option value="Standard">Standard</option>
              <option value="Low">Low</option>
              <option value="Ultra-Low">Ultra-Low</option>
            </select>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">
              API Throttling (req/s)
            </span>
            <input
              type="number"
              className="bg-transparent text-[11px] text-gray-300 font-mono outline-none w-16 text-right"
              value={config.apiRate}
              onChange={(e) => handleSave({ apiRate: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200">
              Security Parameters
            </h3>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">
              Auto-Kill Switch
            </span>
            <button
              onClick={() => handleSave({ killSwitch: !config.killSwitch })}
              className={`flex items-center gap-2 px-2 py-0.5 rounded border transition-colors ${config.killSwitch ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]"}`}
            >
              <Power className="w-3 h-3" />
              <span className="text-[10px] font-mono uppercase font-bold">
                {config.killSwitch ? "Engaged" : "Armed"}
              </span>
            </button>
          </div>
          <div className="px-3 py-2 bg-[#111] rounded border border-[#222] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">
              Max Global Drawdown (%)
            </span>
            <input
              type="number"
              step="0.1"
              className="bg-transparent text-[11px] text-red-500 font-mono outline-none w-16 text-right"
              value={config.maxDrawdown}
              onChange={(e) =>
                handleSave({ maxDrawdown: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
