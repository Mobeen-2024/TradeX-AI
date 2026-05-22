import React, { useState, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Cpu,
  AlertCircle,
  Maximize2,
} from "lucide-react";
import { useSystemStore } from "../store/systemStore";

export function BottomSystemTerminal() {
  const { telemetryFeed } = useSystemStore();
  const logs = telemetryFeed
    .slice(0, 5)
    .map(
      (e: any) =>
        `${new Date(e.timestamp || Date.now()).toLocaleTimeString()} [${e.type || "SYSTEM"}] ${e.message || "EVENT"}`,
    );

  return (
    <footer className="h-32 bg-[#020202] border-t border-[#1a1a1a] flex flex-col flex-shrink-0 z-50">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#111] bg-[#050505]">
        <div className="flex items-center gap-4">
          <h3 className="text-[9px] font-bold font-mono tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5">
            <TerminalIcon className="w-3 h-3" />
            System Terminal
          </h3>
          <div className="flex gap-3 text-[9px] font-mono">
            <span className="text-white border-b border-[#00f0ff] pb-[1px] cursor-pointer">
              Logs
            </span>
            <span className="text-gray-600 hover:text-white cursor-pointer transition-colors pb-[1px]">
              Network
            </span>
            <span className="text-gray-600 hover:text-white cursor-pointer transition-colors pb-[1px]">
              Risk Engine
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-gray-400" /> SYS: 12%
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-gray-400" /> ERR: 0
          </span>
          <button className="hover:text-white transition-colors ml-2 cursor-pointer">
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-2 px-4 overflow-y-auto no-scrollbar font-mono text-[10px] leading-relaxed flex flex-col justify-end gap-0.5">
        {logs.map((log: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-gray-700">
              [{new Date().toISOString().split("T")[1].slice(0, -1)}]
            </span>
            <span
              className={
                log.startsWith("AGENT:")
                  ? "text-[#0ea5e9]"
                  : log.startsWith("RISK_ENGINE:")
                    ? "text-[#84cc16]"
                    : log.startsWith("NETWORK:")
                      ? "text-gray-400"
                      : "text-[#00f0ff]"
              }
            >
              {log}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
