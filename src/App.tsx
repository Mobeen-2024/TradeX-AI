/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { TopIntelligenceBar } from './components/TopIntelligenceBar';
import { BottomSystemTerminal } from './components/BottomSystemTerminal';
import { useState } from 'react';

export type TabType = 'Dashboard' | 'Markets' | 'AI Command Center' | 'Trade Execution' | 'Portfolio' | 'Risk Engine' | 'Strategy Lab' | 'Memory Vault' | 'Analytics' | 'Simulation Engine' | 'System Logs' | 'Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');

  return (
    <div className="min-h-[100dvh] bg-[#000] flex flex-col selection:bg-[#00f0ff]/30 overflow-hidden text-white font-sans">
      <TopIntelligenceBar />
      <div className="flex w-full flex-1 bg-[#020202] relative overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainContent activeTab={activeTab} />
      </div>
      <BottomSystemTerminal />
    </div>
  );
}
