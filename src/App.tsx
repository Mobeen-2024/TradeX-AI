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
import { DecisionTracePanel } from "./components/ui/DecisionTracePanel";
import { SimulationOverlay } from "./components/ui/SimulationOverlay";
import { ToastSystem } from "./components/ui/ToastSystem";
import { useState } from "react";
import { useMarketRegime } from "./contexts/MarketRegimeContext";

import { SystemInitializer } from "./components/SystemInitializer";

export type TabType =
  | "PnL Dashboard"
  | "Market Intelligence"
  | "Multi-Agent Protocol"
  | "Autonomous Execution"
  | "Alpha Generation"
  | "Risk Management"
  | "Strategy Engine"
  | "Agent Memory"
  | "Technical Engine"
  | "Backtesting Engine"
  | "System Telemetry"
  | "Audit & Governance"
  | "System Configuration"
  | "Knowledge Graph";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("PnL Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(
    (import.meta as any).env?.DEV || false,
  );
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
    <SystemInitializer>
      <div
        className={`relative min-h-dvh bg-black selection:bg-[#00f0ff]/30 text-white font-sans ${getRegimeClasses()}`}
      >
        <div className="hidden md:flex flex-col min-h-dvh overflow-hidden relative z-10 w-full bg-black/60">
          <TopIntelligenceBar />
          <div className="flex w-full flex-1 bg-[#020202] relative overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <MainContent activeTab={activeTab} />
          </div>
          <BottomSystemTerminal />
        </div>
        <div className="md:hidden relative z-10 w-full min-h-dvh bg-[#050505]">
          <MobileApp />
        </div>
        <div className="relative z-50">
          <ToastSystem />
          <AIVoiceAssistant />
          <DecisionTracePanel />
          <SimulationOverlay />
        </div>
      </div>
    </SystemInitializer>
  );
}
