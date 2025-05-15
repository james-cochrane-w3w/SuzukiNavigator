import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigationBar } from "@/components/navigation/top-navigation-bar";
import { BottomNavigationBar } from "@/components/navigation/bottom-navigation-bar";
import { W3WMap } from "@/components/navigation/w3w-map-simple";
import { DirectionsBottomSheet } from "@/components/navigation/directions-bottom-sheet";
import { TurnByTurnView } from "@/components/navigation/turn-by-turn-view";
import { SearchResult, Route } from "@/types";
import { W3WBadge } from "@/components/ui/w3w-badge";

export default function Navigation() {
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  const [showTurnByTurn, setShowTurnByTurn] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [destination, setDestination] = useState<SearchResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [showW3WInfo, setShowW3WInfo] = useState(true);

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.longitude, position.coords.latitude]);
        },
        () => {
          // Default to New Delhi if geolocation fails
          setCurrentLocation([77.2090, 28.6139]);
        }
      );
    } else {
      // Default to New Delhi if geolocation not supported
      setCurrentLocation([77.2090, 28.6139]);
    }
  }, []);

  // Fetch route data if destination is selected
  const { data: route } = useQuery<Route>({
    queryKey: ['/api/directions', currentLocation, destination?.coordinates],
    enabled: !!currentLocation && !!destination?.coordinates,
  });

  const handleDestinationSelect = (result: SearchResult) => {
    setDestination(result);
    setShowSearchPanel(false);
    setShowDirections(true);
  };

  const handleStartNavigation = () => {
    setShowDirections(false);
    setShowTurnByTurn(true);
    setShowBottomNav(false);
  };

  const handleCloseNavigation = () => {
    setShowTurnByTurn(false);
    setShowSearchPanel(true);
    setShowBottomNav(true);
  };

  const handleEditRoute = () => {
    setShowDirections(false);
    setShowSearchPanel(true);
  };

  const handleBackClick = () => {
    if (showTurnByTurn) {
      setShowTurnByTurn(false);
      setShowDirections(true);
      return;
    }
    
    if (showDirections) {
      setShowDirections(false);
      setShowSearchPanel(true);
      return;
    }
  };

  return (
    <div className="screen bg-white relative">
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
      <TopNavigationBar 
        title="Navigation" 
        onBackClick={handleBackClick}
      />
      
      {/* W3W Map with integrated search */}
      <div className="w-full h-[calc(100vh-120px)]">
        <W3WMap 
          initialWords={destination?.type === 'w3w' ? destination.name : undefined}
          onDestinationSelect={handleDestinationSelect}
        />
      </div>

      {/* Directions Bottom Sheet */}
      <DirectionsBottomSheet
        isVisible={showDirections}
        route={route}
        destination={destination || undefined}
        onStartNavigation={handleStartNavigation}
        onEdit={handleEditRoute}
      />

      {/* Turn-by-Turn Navigation View */}
      <TurnByTurnView
        isVisible={showTurnByTurn}
        route={route}
        onClose={handleCloseNavigation}
      />

      {/* what3words Integration Info */}
      {showW3WInfo && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-5 max-w-sm w-full z-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">what3words Integration</h3>
            <button 
              className="text-gray-500"
              onClick={() => setShowW3WInfo(false)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <p className="mb-3 text-sm">You can now search for locations using what3words addresses.</p>
          <div className="flex items-center mb-4 bg-gray-100 p-3 rounded">
            <W3WBadge size="lg" className="mr-3" />
            <div>
              <p className="text-sm font-medium">Example: ///filled.count.soap</p>
              <p className="text-xs text-gray-500">Every 3m x 3m square has a unique combination of three words</p>
            </div>
          </div>
          <p className="text-xs mb-4">what3words addresses in India will be suggested as you type.</p>
          <button 
            className="w-full bg-[hsl(var(--suzuki-blue))] text-white py-2 rounded font-medium"
            onClick={() => {
              setShowW3WInfo(false);
              const input = document.querySelector('input[placeholder*="destination"]') as HTMLElement;
              if (input) input.focus();
            }}
          >
            Try It Now
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {showBottomNav && <BottomNavigationBar />}
    </div>
  );
}
