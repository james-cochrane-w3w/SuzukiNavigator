import React from "react";
import { useLocation } from "wouter";

interface TopNavigationBarProps {
  title: string;
  onBackClick?: () => void;
  onSettingsClick?: () => void;
}

export function TopNavigationBar({ 
  title, 
  onBackClick, 
  onSettingsClick 
}: TopNavigationBarProps) {
  const [, navigate] = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="bg-[hsl(var(--suzuki-blue))] text-white px-4 py-3 flex items-center justify-between">
      <button 
        className="flex items-center" 
        onClick={handleBackClick}
      >
        <span className="material-icons mr-1">arrow_back</span>
        <span className="font-medium">Back</span>
      </button>
      <h1 className="text-lg font-medium">{title}</h1>
      <button onClick={onSettingsClick}>
        <span className="material-icons">settings</span>
      </button>
    </div>
  );
}
