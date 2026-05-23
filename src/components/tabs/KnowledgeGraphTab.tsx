import { motion } from "motion/react";

export function KnowledgeGraphTab() {
  return (
    <motion.div
      key="knowledge-graph"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[80vh]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            System Architecture
          </h2>
          <p className="text-gray-400 mt-1 capitalize text-sm">
            Graphify generated knowledge & architecture graph
          </p>
        </div>
        <div className="flex items-center gap-4">
           <a 
              href="/graphify-out/graph.html" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0a0a0a] border border-[#333] hover:border-[#555] px-4 py-2 rounded-md text-sm font-bold text-white transition-colors flex items-center gap-2"
            >
              Open in New Tab
           </a>
        </div>
      </div>
      
      <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <iframe
          src="/graphify-out/graph.html"
          className="w-full h-full border-0"
          title="Graphify Knowledge Graph"
        />
      </div>
    </motion.div>
  );
}
