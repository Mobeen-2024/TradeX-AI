import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, AlertTriangle, TrendingDown, Target, Brain, ArrowRight } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';
import { SystemInsight } from '../../types';

export function InsightsPanel() {
  const { systemInsights } = useSystemStore();

  if (systemInsights.length === 0) return null;

  const getPriorityIcon = (insight: SystemInsight) => {
      switch (insight.priority) {
          case 'HIGH': return <AlertTriangle className="w-4 h-4 text-red-500" />;
          case 'MEDIUM': return <TrendingDown className="w-4 h-4 text-[#facc15]" />;
          case 'LOW': return <Lightbulb className="w-4 h-4 text-[#0ea5e9]" />;
          default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
      }
  };

  const getComponentIcon = (type: string) => {
      switch(type) {
          case 'STRATEGY': return <Target className="w-3 h-3" />;
          case 'RISK': return <AlertTriangle className="w-3 h-3" />;
          case 'EXECUTION': return <Brain className="w-3 h-3" />;
          default: return <Lightbulb className="w-3 h-3" />;
      }
  };

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 space-y-4 font-mono relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Lightbulb className="w-24 h-24" />
      </div>
      
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
        <Lightbulb className="w-4 h-4 text-[#00f0ff]" />
        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Active System Insights</h3>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
            {systemInsights.map(insight => (
                <motion.div 
                    key={insight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-[#111] border border-[#222] rounded flex flex-col gap-2 relative group hover:border-[#333] transition-colors"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2 flex-1">
                            <div className="mt-0.5">
                                {getPriorityIcon(insight)}
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed font-sans">{insight.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[9px] uppercase font-bold text-gray-500 tracking-widest">
                                 {getComponentIcon(insight.affectedComponent)}
                                 {insight.affectedComponent}
                             </div>
                             <span className="text-[9px] text-[#0ea5e9]">Conf: {insight.confidence}%</span>
                        </div>
                    </div>
                    
                    <div className="mt-1 pt-2 border-t border-[#1a1a1a] flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Suggested Action:</span>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-[#00f0ff] transition-colors text-[10px] font-bold text-[#39ff14] uppercase tracking-widest">
                             {insight.suggestedAction} <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
