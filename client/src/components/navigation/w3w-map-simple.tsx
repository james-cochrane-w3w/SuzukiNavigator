import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { SearchResult } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface W3WMapProps {
  initialWords?: string;
  onDestinationSelect?: (destination: SearchResult) => void;
}

export function W3WMap({ initialWords = "filled.count.soap", onDestinationSelect }: W3WMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Fetch API keys from server
  const { data: apiKeys } = useQuery<{googleMapsApiKey: string, w3wApiKey: string}>({
    queryKey: ['/api/config/maps'],
    staleTime: Infinity,
  });
  
  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 1) {
      setIsSearching(true);
      try {
        const response = await axios.get(`/api/search?query=${encodeURIComponent(value)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    if (onDestinationSelect) {
      onDestinationSelect(result);
      setSearchQuery(result.name);
      setSearchResults([]);
    }
  };
  
  // Initialize the what3words map once we have the API keys
  useEffect(() => {
    if (!containerRef.current || !apiKeys) {
      console.log("Waiting for API keys or container...");
      return;
    }

    if (!apiKeys.w3wApiKey || !apiKeys.googleMapsApiKey) {
      console.log("Missing API keys:", { 
        w3wApiKey: apiKeys.w3wApiKey ? "Present" : "Missing", 
        googleMapsApiKey: apiKeys.googleMapsApiKey ? "Present" : "Missing" 
      });
      return;
    }
    
    console.log("Creating what3words map component with keys");
    
    // Clear any existing content
    containerRef.current.innerHTML = '';
    
    // Create the what3words map element
    const mapElement = document.createElement('what3words-map');
    mapElement.setAttribute('api_key', apiKeys.w3wApiKey);
    mapElement.setAttribute('map_api_key', apiKeys.googleMapsApiKey);
    mapElement.setAttribute('words', initialWords);
    mapElement.setAttribute('language', 'en');
    mapElement.setAttribute('clip_to_country', 'IN');
    
    // Add map element attributes for display
    mapElement.setAttribute('current_location_control_position', 'bottom-right');
    mapElement.setAttribute('fullscreen_control', 'false');
    mapElement.setAttribute('disable_default_ui', 'false');
    
    // Create and add the map canvas
    const mapCanvas = document.createElement('div');
    mapCanvas.setAttribute('slot', 'map');
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = '100%';
    mapElement.appendChild(mapCanvas);
    
    // Add the map element to our container
    containerRef.current.appendChild(mapElement);
    
    // Add error handling for the map component
    mapElement.addEventListener('error', (e: any) => {
      console.error("what3words map error:", e.detail);
    });
    
    // Add event listener for when map is ready
    mapElement.addEventListener('ready', (e: any) => {
      console.log("what3words map is ready!");
    });
    
    // Add event listener for selected addresses
    const handleSelected = (e: any) => {
      console.log("Map selection event:", e.detail);
      if (onDestinationSelect && e.detail && e.detail.words) {
        const words = e.detail.words;
        const coordinates = e.detail.coordinates || { lat: 0, lng: 0 };
        
        // Create a SearchResult from the w3w address
        const result: SearchResult = {
          id: words,
          name: words,
          address: e.detail.nearestPlace || "what3words address",
          coordinates: [coordinates.lng, coordinates.lat],
          type: "w3w"
        };
        
        onDestinationSelect(result);
      }
    };
    
    mapElement.addEventListener('selected', handleSelected);
    
    return () => {
      mapElement.removeEventListener('selected', handleSelected);
      if (containerRef.current && containerRef.current.contains(mapElement)) {
        containerRef.current.removeChild(mapElement);
      }
    };
  }, [apiKeys, initialWords, onDestinationSelect]);
  
  return (
    <div className="w-full h-full relative">
      {/* Search input at the top */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4">
        <div className="relative max-w-md mx-auto">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search location or enter what3words address"
              className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg shadow-md"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg max-h-[50vh] overflow-y-auto z-20">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                <ul>
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="p-4 flex items-start cursor-pointer">
                        <span className="material-icons mr-3 text-[hsl(var(--suzuki-blue))]">
                          {result.type === "w3w" ? "grid_3x3" : result.type === "poi" ? "place" : "location_on"}
                        </span>
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-gray-500">{result.address}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Map container */}
      <div 
        ref={containerRef}
        className="w-full h-full"
        data-testid="w3w-map-container"
      />
    </div>
  );
}