import React from "react";
import { Route, RouteStep } from "@/types";
import { format } from "date-fns";

interface TurnByTurnViewProps {
  isVisible: boolean;
  route?: Route;
  onClose: () => void;
}

export function TurnByTurnView({ isVisible, route, onClose }: TurnByTurnViewProps) {
  if (!isVisible || !route) return null;

  // Get current step and next step
  const currentStep = route.steps?.[0];
  const nextStep = route.steps?.[1];

  // Calculate arrival time
  const arrivalTime = new Date(Date.now() + (route.duration * 1000));
  const formattedArrivalTime = format(arrivalTime, "h:mm a");

  const getDirectionIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-right':
        return 'turn_right';
      case 'turn-left':
        return 'turn_left';
      case 'uturn':
        return 'u_turn_right';
      case 'merge':
        return 'merge';
      case 'roundabout':
        return 'roundabout_right';
      default:
        return 'arrow_upward';
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      {/* Current Direction Card */}
      <div className="bg-white rounded-t-lg shadow-lg p-4">
        <div className="flex items-center">
          <div className="direction-icon mr-4">
            <span className="material-icons text-sm">
              {currentStep ? getDirectionIcon(currentStep.maneuver) : 'arrow_upward'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[hsl(var(--suzuki-gray))]">
              {currentStep?.instruction || 'Continue straight for'}
            </p>
            <p className="font-medium text-lg">
              {currentStep ? `${(currentStep.distance / 1000).toFixed(1)} km` : 'Calculating...'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[hsl(var(--suzuki-gray))]">ETA</p>
            <p className="font-medium">{formattedArrivalTime}</p>
          </div>
        </div>
      </div>
      
      {/* Next Direction Preview */}
      {nextStep && (
        <div className="bg-[hsl(var(--suzuki-light))] p-4 flex items-center">
          <div className="direction-icon mr-4 bg-[hsl(var(--suzuki-gray))]">
            <span className="material-icons text-sm">{getDirectionIcon(nextStep.maneuver)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm">{nextStep.instruction}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{(nextStep.distance / 1000).toFixed(1)} km</p>
          </div>
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="bg-white p-4 flex justify-between items-center">
        <button className="p-2">
          <span className="material-icons text-[hsl(var(--suzuki-dark))]">volume_up</span>
        </button>
        <button className="p-2">
          <span className="material-icons text-[hsl(var(--suzuki-dark))]">explore</span>
        </button>
        <button className="p-2">
          <span className="material-icons text-[hsl(var(--suzuki-dark))]">layers</span>
        </button>
        <button 
          className="p-2 bg-[hsl(var(--suzuki-red))] rounded-full w-12 h-12 flex items-center justify-center"
          onClick={onClose}
        >
          <span className="material-icons text-white">close</span>
        </button>
      </div>
    </div>
  );
}
