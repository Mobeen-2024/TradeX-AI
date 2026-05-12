/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { TopIntelligenceBar } from "./components/TopIntelligenceBar";
import { BottomSystemTerminal } from "./components/BottomSystemTerminal";
import { AuthFlow } from "./components/auth/AuthFlow";
import { MobileApp } from "./components/MobileApp";
import { AIVoiceAssistant } from "./components/AIVoiceAssistant";
import { useState } from "react";
import { useMarketRegime } from "./contexts/MarketRegimeContext";

export type TabType =
  | "Dashboard"
  | "Markets"
  | "AI Command Center"
  | "Trade Execution"
  | "Portfolio"
  | "Risk Engine"
  | "Strategy Lab"
  | "Memory Vault"
  | "Analytics"
  | "Simulation Engine"
  | "System Logs"
  | "Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { regime } = useMarketRegime();

  if (!isAuthenticated) {
    return <AuthFlow onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  const getRegimeClasses = () => {
    switch (regime) {
      case "bull":
        return "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[rgba(0,180,255,0.08)] before:via-transparent before:to-transparent before:pointer-events-none before:z-0";
      case "bear":
        return "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[rgba(255,60,0,0.12)] before:via-transparent before:to-transparent before:pointer-events-none before:z-0";
      case "volatile":
        return "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[rgba(250,204,21,0.15)] before:via-transparent before:to-transparent before:pointer-events-none before:z-0 before:animate-pulse";
      case "neutral":
      default:
        return "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[rgba(255,255,255,0.03)] before:via-transparent before:to-transparent before:pointer-events-none before:z-0";
    }
  };

  return (
    <div
      className={`relative min-h-[100dvh] bg-[#000] selection:bg-[#00f0ff]/30 text-white font-sans ${getRegimeClasses()}`}
    >
      <div className="hidden md:flex flex-col min-h-[100dvh] overflow-hidden relative z-10 w-full bg-black/60">
        <TopIntelligenceBar />
        <div className="flex w-full flex-1 bg-[#020202] relative overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <MainContent activeTab={activeTab} />
        </div>
        <BottomSystemTerminal />
      </div>
      <div className="md:hidden relative z-10 w-full min-h-[100dvh] bg-[#050505]">
        <MobileApp />
      </div>
      <div className="relative z-50">
        <AIVoiceAssistant />
      </div>
    </div>
  );
}
