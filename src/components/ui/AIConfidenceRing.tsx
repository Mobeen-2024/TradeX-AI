import React from "react";
import { motion } from "motion/react";
import { BrainCircuit } from "lucide-react";

interface AIConfidenceRingProps {
  confidence: number; // 0 to 100
  size?: number; // pixel size
  theme?: "cyan" | "green" | "purple" | "amber";
}

export function AIConfidenceRing({
  confidence,
  size = 64,
  theme = "cyan",
}: AIConfidenceRingProps) {
  // Determine color based on theme
  const colors = {
    cyan: "#00f0ff",
    green: "#39ff14",
    purple: "#a855f7",
    amber: "#facc15",
  };

  const actualColor = colors[theme];

  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center font-sans group"
      style={{ width: size, height: size }}
    >
      {/* Background glow base */}
      <div
        className="absolute inset-0 rounded-full blur-[20px] opacity-30 transition-opacity duration-1000 group-hover:opacity-60"
        style={{ backgroundColor: actualColor }}
      />

      {/* Neural pulse ripples */}
      <motion.div
        className="absolute inset-0 rounded-full border-[2px] opacity-30"
        style={{ color: actualColor, borderColor: actualColor, filter: `drop-shadow(0 0 10px ${actualColor})` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-[1px] opacity-20"
        style={{ color: actualColor, borderColor: actualColor, filter: `drop-shadow(0 0 5px ${actualColor})` }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
        transition={{
          duration: 2.2,
          delay: 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#111111"
          strokeWidth="3"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={actualColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${actualColor}80)` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-[10px] sm:text-xs font-bold leading-none"
          style={{
            color: actualColor,
            textShadow: `0 0 10px ${actualColor}80`,
          }}
        >
          {confidence}%
        </span>
      </div>
    </div>
  );
}
