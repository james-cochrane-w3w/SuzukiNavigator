import React, { useEffect, useRef, useState } from 'react';
import { SearchResult } from '@/types';
import axios from 'axios';

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

// Add what3words-autosuggest type to avoid conflicts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'what3words-autosuggest': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        api_key?: string;
        clip_to_country?: string;
        return_coordinates?: boolean | string;
        ref?: React.Ref<any>;
      }, HTMLElement>;
    }
  }
}

interface W3WMapProps {
  initialWords?: string;
  onWordsChanged?: (words: string) => void;
  onDestinationSelect?: (destination: SearchResult) => void;
  showSearchBox?: boolean;
}

interface What3wordsAutosuggestElement extends HTMLElement {
  addEventListener(type: string, listener: (e: any) => void): void;
  removeEventListener(type: string, listener: (e: any) => void): void;
}

export function W3WMap({ 
  initialWords = "filled.count.soap", 
  onWordsChanged, 
  onDestinationSelect,
  showSearchBox = true 
}: W3WMapProps) {
  const mapRef = useRef<HTMLElement>(null);
  const w3wAutosuggestRef = useRef<What3wordsAutosuggestElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isW3WFormat, setIsW3WFormat] = useState(false);
  
  // Get the API keys from environment variables
  const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Detect if this looks like a what3words input
    const isW3wFormat = value.startsWith("///") || 
                      (value.includes(".") && value.split('.').length >= 2);
    
    setIsW3WFormat(isW3wFormat);
    
    // Show search results panel for normal searches
    if (value.length > 1 && !isW3wFormat) {
      setShowResults(true);
      fetchSearchResults(value);
    } else {
      setShowResults(false);
    }
  };
  
  // Fetch search results for non-w3w queries
  const fetchSearchResults = async (value: string) => {
    if (value.length < 2) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/search?query=${encodeURIComponent(value)}`);
      setSearchResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setLoading(false);
    }
  };
  
  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    if (onDestinationSelect) {
      onDestinationSelect(result);
      setShowResults(false);
      setQuery(result.name);
    }
  };
  
  // Handle what3words selected suggestion event
  useEffect(() => {
    const w3wElement = w3wAutosuggestRef.current;
    if (!w3wElement) return;

    const handleSelected = (e: any) => {
      const words = e.detail.suggestion.words as string;
      const coordinates = e.detail.suggestion.coordinates;
      
      if (words && coordinates && onDestinationSelect) {
        const w3wResult: SearchResult = {
          id: words,
          name: words,
          address: "what3words address",
          coordinates: [coordinates.lng, coordinates.lat],
          type: "w3w"
        };
        
        onDestinationSelect(w3wResult);
        setShowResults(false);
      }
    };

    w3wElement.addEventListener("selected_suggestion", handleSelected);
    return () => w3wElement.removeEventListener("selected_suggestion", handleSelected);
  }, [onDestinationSelect]);
  
  // Add event listener for words changed on the map
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
    <div className="w-full h-full relative">
      {/* Combined search bar at top */}
      {showSearchBox && (
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-[500px] px-4 box-border"
        >
          <div className="relative">
            {isW3WFormat ? (
              <what3words-autosuggest
                ref={w3wAutosuggestRef}
                api_key={W3W_API_KEY}
                clip_to_country="IN"
                return_coordinates="true"
              >
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search location or enter what3words address"
                  className="w-full p-3 border border-gray-300 rounded-lg pl-10 shadow-md"
                />
              </what3words-autosuggest>
            ) : (
              <>
                <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search location or enter what3words address"
                  className="w-full p-3 border border-gray-300 rounded-lg pl-10 shadow-md"
                />
              </>
            )}
            {query && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  setQuery("");
                  setIsW3WFormat(false);
                  setShowResults(false);
                }}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
          
          {/* Search results */}
          {showResults && (
            <div className="mt-1 bg-white rounded-lg shadow-lg max-h-[50vh] overflow-y-auto z-[1001]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : searchResults && searchResults.length > 0 ? (
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
              ) : query && query.length > 1 ? (
                <div className="p-4 text-center text-gray-500">No results found</div>
              ) : null}
            </div>
          )}
        </div>
      )}
      
      {/* The actual map component */}
      <what3words-map
        ref={mapRef}
        api_key={W3W_API_KEY}
        map_api_key={GOOGLE_MAPS_API_KEY}
        words={initialWords}
        disable_default_ui
        fullscreen_control
        current_location_control_position="9"
        fullscreen_control_position="3"
      >
        {/* Map canvas fills container */}
        <div slot="map" style={{ width: "100%", height: "100%" }}></div>
      </what3words-map>
    </div>
  );
}