"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  progress: number;
}

const CircularProgress = React.forwardRef<
  SVGSVGElement,
  CircularProgressProps
>(({ className, progress, ...props }, ref) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      ref={ref}
      className={cn("h-32 w-32", className)}
      viewBox="0 0 100 100"
      {...props}
    >
      <circle
        className="stroke-current text-muted/20"
        strokeWidth="10"
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
      />
      <circle
        className="stroke-current text-primary transition-[stroke-dashoffset] duration-300"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy=".3em"
        className="fill-current text-lg font-bold text-foreground"
      >
        {`${Math.round(progress)}%`}
      </text>
    </svg>
  );
});

CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
