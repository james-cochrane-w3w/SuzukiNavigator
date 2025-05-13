import React from "react";

interface W3WBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function W3WBadge({ size = "md", className = "" }: W3WBadgeProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[8px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm"
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} bg-[hsl(var(--suzuki-light-blue))] rounded ${className}`}>
      <span className="text-white font-bold">///</span>
    </div>
  );
}
