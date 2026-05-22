import React, { useEffect, useState } from "react";
import {
  Brain,
  Activity,
  Newspaper,
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

export const DecisionInspector: React.FC<{ correlationId: string }> = ({
  correlationId,
}) => {
  const [currentTrace, setCurrentTrace] = useState<any>(null);
  const [isLoadingTrace, setIsLoadingTrace] = useState(false);

  useEffect(() => {
    if (!correlationId) return;
    const fetchTrace = async () => {
      setIsLoadingTrace(true);
      try {
        const response = await fetch(`/api/system/trace/${correlationId}`);
        const data = await response.json();
        setCurrentTrace(data);
      } catch (err) {
        console.error("Failed to fetch decision trace:", err);
      } finally {
        setIsLoadingTrace(false);
      }
    };
    fetchTrace();
  }, [correlationId]);

  if (isLoadingTrace) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentTrace) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-gray-500">
        Select a decision to inspect the AI trace
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto no-scrollbar p-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#00f0ff]" />
          Decision Trace Inspector
        </h3>
        <span className="text-xs font-mono text-gray-500">
          ID: {correlationId.slice(0, 8)}...
        </span>
      </div>

      <div className="grid grid-cols-1 space-y-6">
        {/* Quant Module */}
        {currentTrace.quant && (
          <TraceCard
            title="Quant Analysis"
            icon={<Cpu className="w-4 h-4 text-[#ff0055]" />}
            color="border-[#ff0055]"
            memory={currentTrace.quant}
          />
        )}

        {/* Risk Module */}
        {currentTrace.risk && (
          <TraceCard
            title="Risk Guardian"
            icon={<Activity className="w-4 h-4 text-[#ffcc00]" />}
            color="border-[#ffcc00]"
            memory={currentTrace.risk}
          />
        )}

        {/* News Module */}
        {currentTrace.news && (
          <TraceCard
            title="News Oracle"
            icon={<Newspaper className="w-4 h-4 text-[#00ffcc]" />}
            color="border-[#00ffcc]"
            memory={currentTrace.news}
          />
        )}

        {/* Coordinator Decision */}
        {currentTrace.coordinator && (
          <TraceCard
            title="Final Decision (Coordinator)"
            icon={<Brain className="w-4 h-4 text-[#00f0ff]" />}
            color="border-[#00f0ff]"
            memory={currentTrace.coordinator}
          />
        )}

        {/* Evaluation Output */}
        {currentTrace.evaluation && (
          <div className="border border-[#39ff14]/30 bg-[#39ff14]/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#39ff14]" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Evaluation & Learning
              </h4>
            </div>
            <div className="text-sm text-gray-300 font-sans leading-relaxed">
              <div className="markdown-body text-xs">
                <Markdown>{currentTrace.evaluation.ai_rationale}</Markdown>
              </div>
            </div>
            {currentTrace.evaluation.metadata && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">
                    Score
                  </span>
                  <span className="text-xs text-white">
                    {currentTrace.evaluation.metadata.score}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">
                    PnL
                  </span>
                  <span className="text-xs text-white">
                    ${currentTrace.evaluation.metadata.pnl?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">
                    Accuracy
                  </span>
                  <span className="text-xs text-white">
                    {currentTrace.evaluation.metadata.accuracy_score}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TraceCard = ({
  title,
  icon,
  color,
  memory,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  memory: any;
}) => {
  return (
    <div
      className={`border-l-2 ${color} bg-[#0a0a0a] rounded-r-xl p-4 shadow-md`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
          {title}
        </h4>
      </div>
      {memory.market_regime && (
        <div className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 mb-3">
          Regime: {memory.market_regime}
        </div>
      )}
      <div className="text-sm text-gray-400 font-sans leading-relaxed">
        <div className="markdown-body">
          <Markdown>{memory.ai_rationale}</Markdown>
        </div>
      </div>
      {memory.metadata && (
        <div className="mt-3 bg-black/50 p-2 rounded border border-white/5 overflow-x-auto">
          <pre className="text-[10px] font-mono text-gray-500 m-0">
            {JSON.stringify(memory.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
