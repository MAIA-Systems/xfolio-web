"use client";

import { useId } from "react";

export function Sparkline({
  values,
  width = 100,
  height = 28,
  positive = true,
  className = "",
  fill = true,
}: {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  className?: string;
  fill?: boolean;
}) {
  // useId rather than a random suffix: the gradient id has to match between the
  // server render and hydration, or React discards the markup.
  const gradientId = useId();

  if (!values.length) return null;

  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const step = width / (values.length - 1);

  const line = `M${values
    .map((value, index) => `${(index * step).toFixed(2)},${(height - ((value - min) / range) * height).toFixed(2)}`)
    .join(" L")}`;
  const area = `${line} L${width.toFixed(2)},${height} L0,${height} Z`;
  const stroke = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={line}
        stroke={stroke}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
