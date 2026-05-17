import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, X, BrainCircuit, Activity } from "lucide-react";

export function AIVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<
    { role: "user" | "ai"; text: string; action?: string }[]
  >([{ role: "ai", text: "System ready. How can I assist you?" }]);

  const [overrideActive, setOverrideActive] = useState(false);

  const handleMicClick = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate listening and responding
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          { role: "user", text: "Why was the SOL trade rejected?" },
        ]);
        setIsListening(false);

        setTimeout(() => {
          setConversation((prev) => [
            ...prev,
            {
              role: "ai",
              text: "Risk exceeded volatility threshold during low liquidity conditions.",
              action: "override",
            },
          ]);
        }, 800);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        aria-label="Open AI Voice Assistant"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-[#050505] border border-[#a855f7]/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-[#a855f7] outline-none"
        whileHover={{
          boxShadow: "0 0 30px rgba(168,85,247,0.4)",
          borderColor: "#a855f7",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[#a855f7]/10 animate-ping opacity-20"></div>
        <Mic className="w-6 h-6 text-[#a855f7]" />
      </motion.button>

      {/* Voice Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-36 right-6 md:bottom-28 md:right-8 z-50 w-80 md:w-96 bg-[#050505]/95 backdrop-blur-xl border border-[#a855f7]/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#a855f7]/20 flex justify-between items-center bg-[#a855f7]/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#111] border border-[#a855f7]/50 flex items-center justify-center relative">
                  <BrainCircuit className="w-4 h-4 text-[#a855f7]" />
                  {isListening && (
                    <div className="absolute -inset-1 rounded-full bg-[#a855f7]/20 animate-ping"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest">
                    TradeX AI Voice
                  </h3>
                  <div className="text-[9px] text-[#a855f7] font-mono flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-pulse"></div>{" "}
                    Active
                  </div>
                </div>
              </div>
              <button
                aria-label="Close Voice Assistant"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#a855f7] outline-none rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 p-4 overflow-y-auto max-h-64 no-scrollbar space-y-4 font-mono text-xs">
              {conversation.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded p-3 flex flex-col gap-2 ${
                      msg.role === "user"
                        ? "bg-[#111] border border-[#333] text-gray-300 rounded-tr-none"
                        : "bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] rounded-tl-none"
                    }`}
                  >
                    <div>
                      {msg.role === "ai" && (
                        <Volume2 className="w-3 h-3 mb-1 opacity-50 inline-block mr-2" />
                      )}
                      {msg.text}
                    </div>
                    {msg.action === "override" && (
                      <div className="mt-2 pt-2 border-t border-[#a855f7]/20 flex justify-end">
                        <button 
                         onClick={() => setOverrideActive(true)}
                         disabled={overrideActive}
                         className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded border transition-colors ${overrideActive ? "bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]" : "bg-[#ff4500]/10 border-[#ff4500]/30 text-[#ff4500] hover:bg-[#ff4500]/20"}`}
                        >
                          {overrideActive ? "Override Executed" : "Execute Override"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Area */}
            <div className="p-4 border-t border-[#1a1a1a] flex flex-col items-center justify-center bg-black/50">
              {/* Voice Visualizer (fake) */}
              <div className="h-8 flex items-center justify-center gap-1 mb-4 opacity-70">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={
                      isListening
                        ? { height: [4, 20 + Math.random() * 10, 4] }
                        : { height: 4 }
                    }
                    transition={
                      isListening
                        ? { duration: 0.5, repeat: Infinity, delay: i * 0.1 }
                        : {}
                    }
                    className={`w-1 rounded-full ${isListening ? "bg-[#a855f7]" : "bg-[#333]"}`}
                  />
                ))}
              </div>

              <button
                aria-label={isListening ? "Stop listening" : "Start listening"}
                onClick={handleMicClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#a855f7] outline-none ${
                  isListening
                    ? "bg-[#a855f7] text-white shadow-[0_0_20px_#a855f7] scale-110"
                    : "bg-[#111] border border-[#a855f7]/50 text-[#a855f7] hover:bg-[#a855f7]/10"
                }`}
              >
                {isListening ? (
                  <Activity className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-3 font-bold">
                {isListening ? "Listening..." : "Tap to speak"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
