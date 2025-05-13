import React from "react";
import { Route, SearchResult } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

interface DirectionsBottomSheetProps {
  isVisible: boolean;
  route?: Route;
  destination?: SearchResult;
  onStartNavigation: () => void;
  onEdit: () => void;
}

export function DirectionsBottomSheet({ 
  isVisible, 
  route, 
  destination, 
  onStartNavigation,
  onEdit
}: DirectionsBottomSheetProps) {
  if (!isVisible || !route) return null;

  // Calculate arrival time
  const arrivalTime = new Date(Date.now() + (route.duration * 1000));
  const formattedArrivalTime = format(arrivalTime, "h:mm a");
  
  // Format distance
  const distance = Math.round(route.distance / 100) / 10; // Convert to km

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-white rounded-t-3xl bottom-sheet">
      <div className="w-full flex justify-center py-2">
        <div className="w-10 h-1 bg-[hsl(var(--suzuki-gray))] rounded-full opacity-50"></div>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Route Overview</h2>
          <button 
            className="text-[hsl(var(--suzuki-blue))] font-medium text-sm"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
        
        {/* Route Details */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold">{Math.round(route.duration / 60)}</span>
            <span className="text-sm ml-1">min</span>
          </div>
          <div className="h-6 border-r border-[hsl(var(--suzuki-light))] mx-4"></div>
          <div className="flex items-center">
            <span className="text-2xl font-bold">{distance}</span>
            <span className="text-sm ml-1">km</span>
          </div>
          <div className="h-6 border-r border-[hsl(var(--suzuki-light))] mx-4"></div>
          <div className="flex items-center">
            <span className="text-sm">Arrival</span>
            <span className="text-sm font-bold ml-1">{formattedArrivalTime}</span>
          </div>
        </div>

        {/* Route Path */}
        <div className="mt-4 flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--suzuki-blue))] border-2 border-white"></div>
            <div className="w-0.5 h-12 bg-[hsl(var(--suzuki-gray))]"></div>
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--suzuki-red))] border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <p className="text-sm text-[hsl(var(--suzuki-gray))]">Starting Point</p>
              <p className="font-medium">Current Location</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--suzuki-gray))]">Destination</p>
              <p className="font-medium">{destination?.name || 'Selected Destination'}</p>
              {destination?.address && (
                <p className="text-xs text-[hsl(var(--suzuki-dark-gray))]">{destination.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button 
          className="mt-4 w-full bg-[hsl(var(--suzuki-blue))] text-white py-3 rounded-lg font-medium mb-4"
          onClick={onStartNavigation}
        >
          Start Navigation
        </button>
      </div>
    </div>
  );
}
