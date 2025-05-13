import React from "react";
import { TopNavigationBar } from "@/components/navigation/top-navigation-bar";
import { BottomNavigationBar } from "@/components/navigation/bottom-navigation-bar";

export default function Profile() {
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
      <TopNavigationBar title="Profile" />

      {/* Main Content */}
      <div className="p-4 pb-24">
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center">
          <div className="w-16 h-16 bg-[hsl(var(--suzuki-blue))] rounded-full flex items-center justify-center mr-4">
            <span className="material-icons text-white text-2xl">person</span>
          </div>
          <div>
            <h2 className="text-lg font-medium">Rider Name</h2>
            <p className="text-sm text-[hsl(var(--suzuki-dark-gray))]">Suzuki Enthusiast</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 border-b">
            <h3 className="font-medium">Account Settings</h3>
          </div>
          <div className="divide-y">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">account_circle</span>
                <span>Personal Information</span>
              </div>
              <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">notifications</span>
                <span>Notifications</span>
              </div>
              <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">privacy_tip</span>
                <span>Privacy Settings</span>
              </div>
              <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 border-b">
            <h3 className="font-medium">App Settings</h3>
          </div>
          <div className="divide-y">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">language</span>
                <span>Language</span>
              </div>
              <div className="flex items-center">
                <span className="text-[hsl(var(--suzuki-dark-gray))] mr-2">English</span>
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">format_size</span>
                <span>Text Size</span>
              </div>
              <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="material-icons text-[hsl(var(--suzuki-dark-gray))] mr-3">map</span>
                <span>Navigation Settings</span>
              </div>
              <span className="material-icons text-[hsl(var(--suzuki-dark-gray))]">chevron_right</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="material-icons text-[hsl(var(--suzuki-red))] mr-3">logout</span>
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigationBar />
    </div>
  );
}
