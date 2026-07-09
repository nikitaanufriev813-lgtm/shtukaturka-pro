"use client";

import { motion } from "framer-motion";

interface ProgressCircleProps {
  percent: number; // 0-100
  daysLeft?: number;
  size?: number;
}

export function ProgressCircle({ percent, daysLeft, size = 220 }: ProgressCircleProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-100 dark:text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9A441" />
            <stop offset="100%" stopColor="#2E4374" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          key={percent}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-extrabold text-brand-dark dark:text-white"
        >
          {percent}%
        </motion.span>
        <span className="text-sm text-gray-400">готовности</span>
        {daysLeft !== undefined && (
          <span className="mt-1 text-xs font-medium text-accent">
            {daysLeft} дн. до сдачи
          </span>
        )}
      </div>
    </div>
  );
}
