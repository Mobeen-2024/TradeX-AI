import React from 'react';

export function TelemetryBadge({ icon, label, value, bg, border }: { icon: React.ReactNode, label: string, value: string, bg: string, border: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} ${border} border`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-[12px] font-mono text-gray-200">{value}</span>
      </div>
    </div>
  );
}

export function ActionChip({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="relative group overflow-hidden px-4 py-2 rounded-full bg-[#0d0d0d] border border-[#222] hover:border-[#ff4500]/50 flex items-center gap-2 text-[13px] text-gray-400 hover:text-[#ff4500] transition-all cursor-pointer">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#ff4500]/10 rounded-full blur-md group-hover:bg-[#ff4500]/20 transition-colors"></div>
      <span className="relative z-10">{label}</span>
      <span className="relative z-10 opacity-70 ml-1">{icon}</span>
    </button>
  );
}

export function InputToolButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors font-medium border border-transparent hover:border-[#222] cursor-pointer">
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function FeatureCard({ icon, title, desc, badgeText, status }: { icon: React.ReactNode, title: string, desc: string, badgeText: string, status?: string }) {
  return (
    <div className="relative group overflow-hidden bg-[#0d0d0d] rounded-2xl border border-[#1a1a1a] p-5 hover:border-[#333] transition-all duration-300 cursor-pointer flex flex-col justify-between">
      {/* Subtle glow on top edge */}
      <div className="absolute top-0 right-4 w-24 h-px bg-linear-to-r from-transparent via-[#ff4500]/80 to-transparent"></div>
      
      {/* subtle radial glow top right */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff4500]/10 rounded-full blur-2xl group-hover:bg-[#ff4500]/20 transition-colors duration-500"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 group-hover:text-gray-400 transition-colors">
               {badgeText}
             </span>
             {status && (
               <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-80"></span>
                 {status}
               </span>
             )}
          </div>
        </div>
        <h3 className="text-[15px] font-medium text-gray-200 mb-2 group-hover:text-[#ff4500] transition-colors">{title}</h3>
        <p className="text-[12px] text-gray-500 leading-relaxed pr-2">{desc}</p>
      </div>
    </div>
  );
}

export function ArchNode({ icon, title, desc, color, active }: { icon: React.ReactNode, title: string, desc: string, color: 'purple' | 'blue' | 'emerald' | 'orange', active?: boolean }) {
  const colorMap = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    orange: { bg: 'bg-[#ff4500]/10', border: 'border-[#ff4500]/30', text: 'text-[#ff4500]', shadow: 'shadow-[0_0_15px_rgba(255,69,0,0.15)]' },
  };

  const theme = colorMap[color];

  return (
    <div className={`flex flex-col items-center w-45 p-4 rounded-2xl bg-[#0f0f0f] border ${active ? 'border-gray-700' : 'border-[#1a1a1a]'} hover:border-gray-500 transition-colors z-10`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${theme.bg} ${theme.border} ${theme.shadow}`}>
        <span className={theme.text}>{icon}</span>
      </div>
      <h4 className="text-gray-200 font-semibold text-[13px] text-center mb-1">{title}</h4>
      <p className="text-gray-500 text-[10px] text-center leading-tight">{desc}</p>
    </div>
  );
}

export function ArchConnector() {
  return (
    <div className="flex-1 h-0.5 bg-linear-to-r from-gray-800 via-gray-600 to-gray-800 w-full min-w-5 md:min-w-10 relative">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#ff4500]/30 to-transparent w-full h-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rotate-45 border-t-2 border-r-2 border-gray-500"></div>
    </div>
  );
}
