import { Sparkles, Activity, CheckCircle2, ChevronRight, MessageSquarePlus, MessageCircle, Archive, Library, Image as ImageIcon, Presentation, Zap, Settings, BookOpen, Command, Boxes, Shield, Server, Cpu, LayoutDashboard, LineChart, Target, Wallet, Database, TestTube, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { TabType } from '../App';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: TabType, setActiveTab: (tab: TabType) => void }) {
  return (
    <aside className="w-[72px] hover:w-[280px] group/sidebar flex-shrink-0 bg-[#020202] border-r border-[#1a1a1a] flex flex-col h-full relative z-50 transition-all duration-300 overflow-hidden">
      <div className="p-4 overflow-y-auto overflow-x-hidden no-scrollbar flex-1 pb-32 w-full block scroll-smooth">
        {/* Core Identity */}
        <div className="flex items-center justify-between mb-8 px-1 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex flex-shrink-0 items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
            </div>
            <div className="flex flex-col whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <span className="text-[14px] font-bold tracking-widest text-white/95 uppercase">TradeX OS</span>
              <span className="text-[9px] text-[#00f0ff] font-mono tracking-widest uppercase">Kernel v4.2.1</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 via-[#00f0ff]/5 to-transparent rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative flex items-center bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] border-l-[#00f0ff] border-l-[2px] text-sm text-gray-200 py-3 px-3 rounded-lg transition-colors overflow-hidden">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap">
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <Command className="w-3.5 h-3.5 text-[#00f0ff]" />
              </div>
              <span className="font-bold text-white/90 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Initialize Agent</span>
            </div>
          </div>
        </button>

        {/* Main Interface Navigation */}
        <div className="mb-6">
          <h3 className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-3 px-3 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 h-3">Core Operations</h3>
          <ul className="space-y-[2px]">
            <NavItem icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Command Center" active={activeTab === 'Command Center'} onClick={() => setActiveTab('Command Center')} />
            <NavItem icon={<Activity className="w-3.5 h-3.5" />} label="Market Intelligence" active={activeTab === 'Market Intelligence'} onClick={() => setActiveTab('Market Intelligence')} />
            <NavItem icon={<Cpu className="w-3.5 h-3.5" />} label="Multi-Agent Protocol" active={activeTab === 'Multi-Agent Protocol'} onClick={() => setActiveTab('Multi-Agent Protocol')} />
            <NavItem icon={<Zap className="w-3.5 h-3.5" />} label="Autonomous Execution" active={activeTab === 'Autonomous Execution'} onClick={() => setActiveTab('Autonomous Execution')} />
          </ul>
        </div>

        {/* Portfolio & Risk */}
        <div className="mb-6">
          <h3 className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-3 px-3 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 h-3">Portfolio & Risk</h3>
          <ul className="space-y-[2px]">
            <NavItem icon={<Wallet className="w-3.5 h-3.5" />} label="Alpha Generation" active={activeTab === 'Alpha Generation'} onClick={() => setActiveTab('Alpha Generation')} />
            <NavItem icon={<Shield className="w-3.5 h-3.5" />} label="Risk Management" active={activeTab === 'Risk Management'} onClick={() => setActiveTab('Risk Management')} />
          </ul>
        </div>

        {/* Intelligence Context */}
        <div className="mb-6">
          <h3 className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-3 px-3 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 h-3">Intelligence & Experimentation</h3>
          <ul className="space-y-[2px]">
            <NavItem icon={<Boxes className="w-3.5 h-3.5" />} label="Strategy Engine" active={activeTab === 'Strategy Engine'} onClick={() => setActiveTab('Strategy Engine')} />
            <NavItem icon={<Database className="w-3.5 h-3.5" />} label="Agent Memory" active={activeTab === 'Agent Memory'} onClick={() => setActiveTab('Agent Memory')} />
            <NavItem icon={<LineChart className="w-3.5 h-3.5" />} label="Technical Engine" active={activeTab === 'Technical Engine'} onClick={() => setActiveTab('Technical Engine')} />
            <NavItem icon={<TestTube className="w-3.5 h-3.5" />} label="Backtesting Engine" active={activeTab === 'Backtesting Engine'} onClick={() => setActiveTab('Backtesting Engine')} />
          </ul>
        </div>

        {/* System Navigation */}
        <div className="mb-8">
          <h3 className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-3 px-3 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 h-3">System</h3>
          <ul className="space-y-[2px]">
            <NavItem icon={<Terminal className="w-3.5 h-3.5" />} label="System Telemetry" active={activeTab === 'System Telemetry'} onClick={() => setActiveTab('System Telemetry')} />
            <NavItem icon={<Settings className="w-3.5 h-3.5" />} label="System Configuration" active={activeTab === 'System Configuration'} onClick={() => setActiveTab('System Configuration')} />
          </ul>
        </div>
      </div>

      {/* System Status telemetry */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-[#020202] border-t border-[#1a1a1a]">
        <div className="flex flex-col gap-3 h-[72px] overflow-hidden whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-500 uppercase tracking-widest">Connectivity</span>
            <span className="text-[#39ff14] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] opacity-80"></span>Secure</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-500 uppercase tracking-widest">Risk Engine</span>
            <span className="text-gray-300">Armed</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono pb-1">
            <span className="text-gray-500 uppercase tracking-widest">Server Load</span>
            <span className="text-[#0ea5e9]">14%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, badge, active, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-1"
    >
      <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2 rounded transition-colors duration-200 text-[12px] group relative ${active ? 'text-[#00f0ff]' : 'text-gray-400 hover:text-gray-200'} overflow-hidden`}>
        
        {active && (
          <motion.div
            layoutId="active-nav-bg"
            className="absolute inset-0 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/20"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        {!active && isHovered && (
          <motion.div
            layoutId="hover-nav-bg"
            className="absolute inset-0 bg-[#111] rounded border border-[#222]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}

        <div className="flex items-center gap-3 relative z-10 whitespace-nowrap">
          <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center transition-colors duration-300 ${active ? 'text-[#00f0ff]' : 'opacity-50 group-hover:opacity-80'}`}>
            {icon}
          </span>
          <span className="font-mono tracking-wide uppercase opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{label}</span>
        </div>
        {badge && (
          <span className="relative z-10 text-[9px] uppercase tracking-widest font-bold bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 px-1.5 py-0.5 rounded-sm flex items-center shadow-[0_0_8px_rgba(57,255,20,0.15)] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            {badge}
          </span>
        )}
      </button>
    </li>
  );
}

