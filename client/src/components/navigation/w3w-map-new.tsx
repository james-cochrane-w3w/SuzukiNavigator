import React, { useEffect, useRef, useState } from 'react';
import { SearchResult } from '@/types';
import axios from 'axios';

// Define props for our component
interface W3WMapProps {
  initialWords?: string;
  onWordsChanged?: (words: string) => void;
  onDestinationSelect?: (destination: SearchResult) => void;
  showSearchBox?: boolean;
}

// Type for HTML elements not in React's built-in types
interface W3WMapElement extends HTMLElement {
  addEventListener(type: string, listener: (e: any) => void): void;
  removeEventListener(type: string, listener: (e: any) => void): void;
}

interface W3WAutosuggestElement extends HTMLElement {
  addEventListener(type: string, listener: (e: any) => void): void;
  removeEventListener(type: string, listener: (e: any) => void): void;
}

export function W3WMap({ 
  initialWords = "filled.count.soap", 
  onWordsChanged, 
  onDestinationSelect,
  showSearchBox = true 
}: W3WMapProps) {
  // Component state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isW3WFormat, setIsW3WFormat] = useState(false);
  
  // Get the API keys from environment variables
  const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  
  // Element refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<W3WMapElement | null>(null);
  const autosuggestRef = useRef<W3WAutosuggestElement | null>(null);

  // Initialize the map component once the container is available
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Create the w3w map element
    const w3wMap = document.createElement('what3words-map') as W3WMapElement;
    w3wMap.setAttribute('api_key', W3W_API_KEY);
    w3wMap.setAttribute('map_api_key', GOOGLE_MAPS_API_KEY);
    w3wMap.setAttribute('words', initialWords);
    w3wMap.setAttribute('disable_default_ui', '');
    w3wMap.setAttribute('fullscreen_control', '');
    w3wMap.setAttribute('current_location_control_position', '9');
    w3wMap.setAttribute('fullscreen_control_position', '3');
    
    // Create the map canvas div
    const mapCanvas = document.createElement('div');
    mapCanvas.setAttribute('slot', 'map');
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = '100%';
    
    // Add canvas to map
    w3wMap.appendChild(mapCanvas);
    
    // Store reference to map
    mapRef.current = w3wMap;
    
    // Add map to container
    mapContainerRef.current.appendChild(w3wMap);
    
    // Listen for words changed event
    const handleWordsChanged = (e: any) => {
      if (onWordsChanged && e.detail && e.detail.words) {
        onWordsChanged(e.detail.words);
      }
    };
    
    w3wMap.addEventListener('wordsChanged', handleWordsChanged);
    
    // Clean up
    return () => {
      w3wMap.removeEventListener('wordsChanged', handleWordsChanged);
      if (mapContainerRef.current && mapContainerRef.current.contains(w3wMap)) {
        mapContainerRef.current.removeChild(w3wMap);
      }
    };
  }, [initialWords, W3W_API_KEY, GOOGLE_MAPS_API_KEY, onWordsChanged]);
  
  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Detect if this looks like a what3words input
    const isW3wFormat = value.startsWith("///") || 
                       (value.includes(".") && value.split('.').length >= 2);
    
    setIsW3WFormat(isW3wFormat);
    
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
  
  // Handle street/POI result selection
  const handleResultClick = (result: SearchResult) => {
    if (onDestinationSelect) {
      onDestinationSelect(result);
      setShowResults(false);
      setQuery(result.name);
      
      // Update map marker
      if (mapRef.current) {
        const [lng, lat] = result.coordinates;
        mapRef.current.setAttribute('center', `${lat},${lng}`);
      }
    }
  };
  
  // Initialize w3w autosuggest
  useEffect(() => {
    if (!isW3WFormat) return;
    
    // Create autosuggest programmatically
    setTimeout(() => {
      const autosuggestContainer = document.getElementById('w3w-autosuggest-container');
      if (!autosuggestContainer) return;
      
      // Clear previous content
      while (autosuggestContainer.firstChild) {
        autosuggestContainer.removeChild(autosuggestContainer.firstChild);
      }
      
      // Create autosuggest element
      const autosuggest = document.createElement('what3words-autosuggest') as W3WAutosuggestElement;
      autosuggest.setAttribute('api_key', W3W_API_KEY);
      autosuggest.setAttribute('clip_to_country', 'IN');
      autosuggest.setAttribute('return_coordinates', 'true');
      
      // Create input element
      const input = document.createElement('input');
      input.type = 'text';
      input.value = query;
      input.placeholder = 'Search location or enter what3words address';
      input.className = 'w-full p-3 border border-gray-300 rounded-lg pl-10 shadow-md';
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        setQuery(target.value);
      });
      
      // Add input to autosuggest
      autosuggest.appendChild(input);
      
      // Add autosuggest to container
      autosuggestContainer.appendChild(autosuggest);
      
      // Store reference
      autosuggestRef.current = autosuggest;
      
      // Add event listener for suggestion selection
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
          setQuery(words);
          
          // Update map
          if (mapRef.current) {
            mapRef.current.setAttribute('words', words);
          }
        }
      };
      
      autosuggest.addEventListener('selected_suggestion', handleSelected);
    }, 100);
    
    return () => {
      if (autosuggestRef.current) {
        autosuggestRef.current.removeEventListener('selected_suggestion', () => {});
      }
    };
  }, [isW3WFormat, query, W3W_API_KEY, onDestinationSelect]);

  return (
    <div className="w-full h-full relative">
      {/* Combined search bar at top */}
      {showSearchBox && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-[500px] px-4 box-border">
          <div className="relative">
            {isW3WFormat ? (
              <div id="w3w-autosuggest-container">
                {/* Autosuggest will be injected here */}
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">search</span>
                  <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search location or enter what3words address"
                    className="w-full p-3 border border-gray-300 rounded-lg pl-10 shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search location or enter what3words address"
                  className="w-full p-3 border border-gray-300 rounded-lg pl-10 shadow-md"
                />
              </div>
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
      
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ backgroundColor: '#f5f5f5' }}
      ></div>
    </div>
  );
}