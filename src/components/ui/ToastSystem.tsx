import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useToastStore, Toast } from "../../store/toastStore";

const typeStyles: Record<
  Toast["type"],
  { border: string; bg: string; text: string; icon: React.ReactNode }
> = {
  info: {
    border: "border-[#00f0ff]",
    bg: "bg-black/80",
    text: "text-[#00f0ff]",
    icon: <Info className="w-5 h-5 text-[#00f0ff]" />,
  },
  success: {
    border: "border-[#39ff14]",
    bg: "bg-black/80",
    text: "text-[#39ff14]",
    icon: <CheckCircle className="w-5 h-5 text-[#39ff14]" />,
  },
  warning: {
    border: "border-[#facc15]",
    bg: "bg-black/80",
    text: "text-[#facc15]",
    icon: <AlertTriangle className="w-5 h-5 text-[#facc15]" />,
  },
  error: {
    border: "border-[#ff4500]",
    bg: "bg-black/80",
    text: "text-[#ff4500]",
    icon: <AlertCircle className="w-5 h-5 text-[#ff4500]" />,
  },
};

export function ToastSystem() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      id="toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const styles = typeStyles[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.2 } }}
              className={`p-4 border ${styles.border} ${styles.bg} rounded backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto w-full`}
            >
              <div className="shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1 text-xs font-mono font-medium leading-relaxed uppercase tracking-wider text-white">
                {toast.message}
              </div>
              <button
                id={`dismiss-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
