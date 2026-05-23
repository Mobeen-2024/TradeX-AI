import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1a1a1a] rounded ${className}`} />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-3 p-3 border-b border-[#111]">
      <Skeleton className="w-16 h-3" />
      <Skeleton className="w-12 h-3" />
      <Skeleton className="flex-1 h-3" />
      <Skeleton className="w-20 h-3" />
    </div>
  );
}
