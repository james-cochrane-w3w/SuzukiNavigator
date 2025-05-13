import React from "react";
import { TopNavigationBar } from "@/components/navigation/top-navigation-bar";
import { BottomNavigationBar } from "@/components/navigation/bottom-navigation-bar";
import { Link } from "wouter";

export default function Discover() {
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
      <TopNavigationBar title="Discover" />

      {/* Main Content */}
      <div className="p-4 pb-24">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">Popular Rides</h2>
          <div className="mb-4">
            <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <span className="material-icons text-6xl text-[hsl(var(--suzuki-blue))]">landscape</span>
            </div>
            <h3 className="font-medium">Shimla Mountain Pass</h3>
            <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">245 km • Challenging</p>
          </div>
          <div>
            <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <span className="material-icons text-6xl text-[hsl(var(--suzuki-blue))]">terrain</span>
            </div>
            <h3 className="font-medium">Coastal Highway Route</h3>
            <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">180 km • Moderate</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">Nearby Points of Interest</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <div className="flex-shrink-0 w-40">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <span className="material-icons text-3xl text-[hsl(var(--suzuki-blue))]">lunch_dining</span>
              </div>
              <h3 className="font-medium text-sm">Food & Dining</h3>
            </div>
            <div className="flex-shrink-0 w-40">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <span className="material-icons text-3xl text-[hsl(var(--suzuki-blue))]">local_gas_station</span>
              </div>
              <h3 className="font-medium text-sm">Fuel Stations</h3>
            </div>
            <div className="flex-shrink-0 w-40">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <span className="material-icons text-3xl text-[hsl(var(--suzuki-blue))]">hotel</span>
              </div>
              <h3 className="font-medium text-sm">Accommodation</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-3">Community Events</h2>
          <div className="border-b border-gray-100 py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Weekend Ride Meetup</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">This Saturday, 7:00 AM</p>
              </div>
              <Link href="/navigation">
                <a className="text-[hsl(var(--suzuki-blue))] font-medium">Join</a>
              </Link>
            </div>
          </div>
          <div className="py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Suzuki Owners Meet</p>
                <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">June 15, 9:00 AM</p>
              </div>
              <Link href="/navigation">
                <a className="text-[hsl(var(--suzuki-blue))] font-medium">Join</a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigationBar />
    </div>
  );
}
