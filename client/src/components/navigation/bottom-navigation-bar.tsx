import React from "react";
import { Link, useLocation } from "wouter";

export function BottomNavigationBar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg px-2 py-1 z-50">
      <div className="flex justify-between items-center">
        <Link href="/">
          <a className={`bottom-nav-item flex flex-col items-center pt-1 pb-1 px-3 ${isActive("/") ? "active" : ""}`}>
            <span className={`material-icons ${isActive("/") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>home</span>
            <span className={`text-xs ${isActive("/") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>Home</span>
          </a>
        </Link>
        
        <Link href="/my-bike">
          <a className={`bottom-nav-item flex flex-col items-center pt-1 pb-1 px-3 ${isActive("/my-bike") ? "active" : ""}`}>
            <span className={`material-icons ${isActive("/my-bike") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>motorcycle</span>
            <span className={`text-xs ${isActive("/my-bike") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>My Bike</span>
          </a>
        </Link>
        
        <Link href="/navigation">
          <a className={`bottom-nav-item flex flex-col items-center pt-1 pb-1 px-3 ${isActive("/navigation") ? "active" : ""}`}>
            <span className={`material-icons ${isActive("/navigation") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>map</span>
            <span className={`text-xs ${isActive("/navigation") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>Navigation</span>
          </a>
        </Link>
        
        <Link href="/discover">
          <a className={`bottom-nav-item flex flex-col items-center pt-1 pb-1 px-3 ${isActive("/discover") ? "active" : ""}`}>
            <span className={`material-icons ${isActive("/discover") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>explore</span>
            <span className={`text-xs ${isActive("/discover") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>Discover</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`bottom-nav-item flex flex-col items-center pt-1 pb-1 px-3 ${isActive("/profile") ? "active" : ""}`}>
            <span className={`material-icons ${isActive("/profile") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>person</span>
            <span className={`text-xs ${isActive("/profile") ? "text-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-dark-gray))]"}`}>Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
