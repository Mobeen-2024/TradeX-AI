import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { TabType } from "../App";
import { LiveMarketsTab } from "./tabs/LiveMarketsTab";
import { AIAgentsTab } from "./tabs/AIAgentsTab";
import { WorkflowsTab } from "./tabs/WorkflowsTab";
import { AutoTradingTab } from "./tabs/AutoTradingTab";
import { MarketResearchTab } from "./tabs/MarketResearchTab";
import { ChartAnalysisTab } from "./tabs/ChartAnalysisTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { LibraryTab } from "./tabs/LibraryTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { RiskCenterTab } from "./tabs/RiskCenterTab";
import { SimulationEngineTab } from "./tabs/SimulationEngineTab";
import { SystemTelemetryTab } from "./tabs/SystemTelemetryTab";
import { SystemConfigurationTab } from "./tabs/SystemConfigurationTab";
import { AlphaGenerationTab } from "./tabs/AlphaGenerationTab";
import { AuditTrailTab } from "./tabs/AuditTrailTab";
import { useMarketRegime } from "../contexts/MarketRegimeContext";

export function MainContent({ activeTab }: { activeTab: TabType }) {
  const { regime } = useMarketRegime();

  const getGlowClasses = () => {
    switch (regime) {
      case "bull":
        return "from-[#0ea5e9]/15 via-[#00f0ff]/5";
      case "bear":
        return "from-[#ff4500]/15 via-[#ff4500]/5";
      case "volatile":
        return "from-[#facc15]/15 via-[#facc15]/5 animate-pulse";
      case "neutral":
      default:
        return "from-gray-500/10 via-transparent";
    }
  };

  return (
    <main className="flex-1 relative overflow-hidden bg-[#020202] flex flex-col">
      {/* Main Glow Background */}
      <div
        className={`absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-gradient-to-b to-transparent rounded-full blur-[160px] pointer-events-none transition-colors duration-1000 ${getGlowClasses()}`}
      ></div>

      {/* Header Removed */}

      <div className="flex-1 overflow-y-auto w-full relative z-10 no-scrollbar pb-10 scroll-smooth">
        <div className="max-w-[1400px] mx-auto px-8 pt-[4vh]">
          <AnimatePresence mode="wait">
            {activeTab === "PnL Dashboard" ? (
              <DashboardTab />
            ) : activeTab === "Market Intelligence" ? (
              <LiveMarketsTab />
            ) : activeTab === "Multi-Agent Protocol" ? (
              <AIAgentsTab />
            ) : activeTab === "Strategy Engine" ? (
              <WorkflowsTab />
            ) : activeTab === "Autonomous Execution" ? (
              <AutoTradingTab />
            ) : activeTab === "Technical Engine" ? (
              <MarketResearchTab />
            ) : activeTab === "Agent Memory" ? (
              <HistoryTab />
            ) : activeTab === "Risk Management" ? (
              <RiskCenterTab />
            ) : activeTab === "Backtesting Engine" ? (
              <SimulationEngineTab />
            ) : activeTab === "System Telemetry" ? (
              <SystemTelemetryTab />
            ) : activeTab === "Alpha Generation" ? (
              <AlphaGenerationTab />
            ) : activeTab === "Audit & Governance" ? (
              <AuditTrailTab />
            ) : activeTab === "System Configuration" ? (
              <SystemConfigurationTab />
            ) : (
              <motion.div
                key="clean-slate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center h-[80vh] w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#111] rounded-full mx-auto mb-6 flex items-center justify-center border border-[#333]">
                    <div
                      className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#0ea5e9] animate-spin opacity-80"
                      style={{ animationDuration: "2s" }}
                    ></div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    {activeTab}
                  </h2>
                  <p className="text-gray-500 font-mono text-sm tracking-wide">
                    Module initialization sequence pending...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
