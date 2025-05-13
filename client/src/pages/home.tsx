import React from "react";
import { BottomNavigationBar } from "@/components/navigation/bottom-navigation-bar";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="screen bg-white">
      {/* Status Bar */}
      <div className="status-bar px-4 flex justify-between items-center">
        <div className="text-xs">9:41</div>
        <div className="flex items-center space-x-1">
          <span className="material-icons text-xs">signal_cellular_alt</span>
          <span className="material-icons text-xs">wifi</span>
          <span className="material-icons text-xs">battery_full</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[hsl(var(--suzuki-blue))] text-white px-4 py-4">
        <h1 className="text-xl font-medium">Suzuki Ride Connect</h1>
        <p className="text-sm opacity-80">Welcome back</p>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-medium mb-2">My Motorcycle</h2>
          <div className="aspect-[16/9] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="material-icons text-6xl text-[hsl(var(--suzuki-blue))]">motorcycle</span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Suzuki V-Strom 650</p>
              <p className="text-sm font-medium">DL650-2023</p>
            </div>
            <Link href="/my-bike">
              <a className="text-[hsl(var(--suzuki-blue))] font-medium text-sm">View Details</a>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Link href="/navigation">
            <a className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
              <span className="material-icons text-3xl text-[hsl(var(--suzuki-blue))] mb-2">map</span>
              <span className="font-medium">Navigation</span>
            </a>
          </Link>
          <Link href="/discover">
            <a className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
              <span className="material-icons text-3xl text-[hsl(var(--suzuki-blue))] mb-2">explore</span>
              <span className="font-medium">Discover</span>
            </a>
          </Link>
        </div>

        {/* Recent Rides */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-medium mb-2">Recent Rides</h2>
          <div className="border-b border-gray-100 py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Morning Ride</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Yesterday, 10:30 AM</p>
              </div>
              <div className="text-right">
                <p className="font-medium">28 km</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">45 min</p>
              </div>
            </div>
          </div>
          <div className="py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Weekend Trip</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Sunday, 2:15 PM</p>
              </div>
              <div className="text-right">
                <p className="font-medium">152 km</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">3h 20m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigationBar />
    </div>
  );
}
