import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function W3WMap({ 
  initialWords = "filled.count.soap",
  onDestinationSelect
}) {
  // Fetch API keys from server
  const { data: apiKeys } = useQuery({
    queryKey: ['/api/config/maps'],
    staleTime: Infinity,
  });
  
  const [mapElement, setMapElement] = useState(null);
  
  useEffect(() => {
    if (!apiKeys || !apiKeys.w3wApiKey || !apiKeys.googleMapsApiKey) {
      console.log("Waiting for API keys...");
      return;
    }
    
    // Get the map element
    const mapEl = document.getElementById('w3w-map');
    
    if (!mapEl) {
      console.log("Map element not found");
      return;
    }
    
    setMapElement(mapEl);
    
    // Set up event listeners
    const handleWordsChanged = (e) => {
      console.log("Words changed:", e.detail.words);
    };
    
    const handleSelected = (e) => {
      console.log("Selection:", e.detail);
      
      if (onDestinationSelect && e.detail) {
        const { words, coordinates } = e.detail;
        const result = {
          id: words,
          name: words,
          address: e.detail.nearestPlace || "what3words address",
          coordinates: [coordinates.lng, coordinates.lat],
          type: "w3w"
        };
        
        onDestinationSelect(result);
      }
    };
    
    const handleError = (e) => {
      console.error("Map error:", e.detail);
    };
    
    mapEl.addEventListener('wordsChanged', handleWordsChanged);
    mapEl.addEventListener('selected', handleSelected);
    mapEl.addEventListener('error', handleError);
    
    // Clean up event listeners
    return () => {
      if (mapEl) {
        mapEl.removeEventListener('wordsChanged', handleWordsChanged);
        mapEl.removeEventListener('selected', handleSelected);
        mapEl.removeEventListener('error', handleError);
      }
    };
  }, [apiKeys, onDestinationSelect]);
  
  return (
    <>
      <what3words-map
        id="w3w-map"
        api_key={apiKeys?.w3wApiKey || ''}
        map_api_key={apiKeys?.googleMapsApiKey || ''}
        words={initialWords}
        language="en"
        clip_to_country="IN"
        disable_default_ui="false"
        fullscreen_control="false"
        current_location_control_position="bottom-right"
      >
        {/* Map canvas that fills the viewport */}
        <div slot="map" style={{ width: "100%", height: "100%" }}></div>
        
        {/* Responsive search bar at the top */}
        <div
          slot="search-control"
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "90%",
            maxWidth: "400px"
          }}
        >
          <what3words-autosuggest
            api_key={apiKeys?.w3wApiKey || ''}
            clip_to_country="IN"
            return_coordinates="true"
          >
            <input
              type="text"
              placeholder="Search for a location or what3words address"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </what3words-autosuggest>
        </div>
      </what3words-map>
    </>
  );
}