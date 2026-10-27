import React from "react";

export default function ScoreRing({ score = 0, size = 140, label = "Employability" }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200/80 dark:stroke-slate-800"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-white"
          fontSize="28"
          fontWeight="800"
        >
          {Math.round(score)}%
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400"
          fontSize="11"
          fontWeight="600"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
