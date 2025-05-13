import React from "react";
import { TopNavigationBar } from "@/components/navigation/top-navigation-bar";
import { BottomNavigationBar } from "@/components/navigation/bottom-navigation-bar";

export default function MyBike() {
  return (
    <div className="screen bg-[hsl(var(--suzuki-gray))]">
      {/* Status Bar */}
      <div className="status-bar px-4 flex justify-between items-center">
        <div className="text-xs">9:41</div>
        <div className="flex items-center space-x-1">
          <span className="material-icons text-xs">signal_cellular_alt</span>
          <span className="material-icons text-xs">wifi</span>
          <span className="material-icons text-xs">battery_full</span>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <TopNavigationBar title="My Bike" />

      {/* Main Content */}
      <div className="p-4 pb-24">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-xl font-medium mb-2">Suzuki V-Strom 650</h2>
          <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="material-icons text-6xl text-[hsl(var(--suzuki-blue))]">motorcycle</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Model: DL650-2023</p>
            <p className="text-sm font-medium">VIN: XXXXXXXX1234</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Bike Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Odometer</p>
              <p className="text-lg font-medium">3,245 km</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Fuel Level</p>
              <p className="text-lg font-medium">80%</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Next Service</p>
              <p className="text-lg font-medium">1,755 km</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Battery</p>
              <p className="text-lg font-medium">Good</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Recent Rides</h3>
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

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-3">Maintenance</h3>
          <button className="w-full bg-[hsl(var(--suzuki-blue))] text-white py-3 rounded-lg font-medium">
            Schedule Service
          </button>
        </div>
      </div>

      <BottomNavigationBar />
    </div>
  );
}
