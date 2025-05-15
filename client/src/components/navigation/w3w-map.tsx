import React, { useEffect, useRef } from 'react';

// Define types for the what3words map component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'what3words-map': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        api_key?: string;
        map_api_key?: string;
        words?: string;
        disable_default_ui?: boolean;
        fullscreen_control?: boolean;
        current_location_control_position?: string;
        fullscreen_control_position?: string;
        search_control_position?: string;
        map_type?: string;
        language?: string;
        ref?: React.Ref<any>;
      }, HTMLElement>;
    }
  }
}

interface W3WMapProps {
  initialWords?: string;
  onWordsChanged?: (words: string) => void;
}

export function W3WMap({ initialWords = "filled.count.soap", onWordsChanged }: W3WMapProps) {
  const mapRef = useRef<HTMLElement>(null);
  
  // Get the API keys from environment variables
  const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  // Add event listener for words changed
  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const handleWordsChanged = (e: any) => {
      if (onWordsChanged && e.detail && e.detail.words) {
        onWordsChanged(e.detail.words);
      }
    };

    mapElement.addEventListener('wordsChanged', handleWordsChanged);
    return () => {
      mapElement.removeEventListener('wordsChanged', handleWordsChanged);
    };
  }, [onWordsChanged]);

  return (
    <what3words-map
      ref={mapRef}
      api_key={W3W_API_KEY}
      map_api_key={GOOGLE_MAPS_API_KEY}
      words={initialWords}
      disable_default_ui
      fullscreen_control
      current_location_control_position="9"
      fullscreen_control_position="3"
      search_control_position="2"
      map_type="roadmap"
    >
      {/* Map canvas fills container */}
      <div slot="map" style={{ width: "100%", height: "100%" }}></div>

      {/* Centered search bar */}
      <div
        slot="search-control"
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "100%",
          maxWidth: "500px",
          padding: "0 16px",
          boxSizing: "border-box"
        }}
      >
        <what3words-autosuggest 
          api_key={W3W_API_KEY}
          clip_to_country="IN"
          return_coordinates="true"
        >
          <input
            type="text"
            placeholder="Search what3words address"
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
  );
}