import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchResult } from "@/types";
import { cn } from "@/lib/utils";

// Get W3W API key from environment variables
const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string;

// Define the combined search panel props
interface CombinedSearchPanelProps {
  isVisible: boolean;
  onDestinationSelect: (destination: SearchResult) => void;
}

// Add types for the what3words component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'what3words-autosuggest': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        api_key?: string;
        ref?: React.Ref<any>;
        clip_to_country?: string;
        clip_to_bounding_box?: string;
        clip_to_circle?: string;
        clip_to_polygon?: string;
        language?: string;
        return_coordinates?: boolean;
      }, HTMLElement>;
    }
  }
}

interface What3wordsAutosuggestElement extends HTMLElement {
  addEventListener(type: string, listener: (e: any) => void): void;
  removeEventListener(type: string, listener: (e: any) => void): void;
}

export function CombinedSearchPanel({ isVisible, onDestinationSelect }: CombinedSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const w3wRef = useRef<What3wordsAutosuggestElement>(null);
  const [isW3WMode, setIsW3WMode] = useState(false);
  
  // Fetch search results
  const { data: searchResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', query],
    enabled: !!query && query.length > 1 && !isW3WMode,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Detect if this looks like a what3words input
    const isW3WFormat = value.startsWith("///") || 
                        (value.includes(".") && value.split('.').length >= 2);
    
    setIsW3WMode(isW3WFormat);
  };

  // Handle what3words selected suggestion event
  useEffect(() => {
    const w3wElement = w3wRef.current;
    if (!w3wElement) return;

    const handleSelected = (e: any) => {
      const words = e.detail.suggestion.words as string;
      const coordinates = e.detail.suggestion.coordinates;
      
      if (words && coordinates) {
        const w3wResult: SearchResult = {
          id: words,
          name: words,
          address: "what3words address",
          coordinates: [coordinates.lng, coordinates.lat],
          type: "w3w"
        };
        
        onDestinationSelect(w3wResult);
      }
    };

    w3wElement.addEventListener("selected_suggestion", handleSelected);
    return () => w3wElement.removeEventListener("selected_suggestion", handleSelected);
  }, [onDestinationSelect]);
  
  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    onDestinationSelect(result);
  };

  // Tab selection
  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
  };

  // Filter results based on tab selection
  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    switch (selectedTab) {
      case "recent":
        // This would need real persistence, for now just show a subset
        return searchResults.slice(0, 2);
      case "favorites":
        // This would need real persistence, just a placeholder
        return searchResults.slice(0, 1);
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredResults();

  // Show w3w component only when in w3w mode
  const showW3WComponent = isW3WMode;

  return (
    <div className={`search-panel bg-white w-full overflow-hidden transition-all duration-300 ${isVisible ? 'max-h-[85vh]' : 'max-h-0'}`}>
      <div className="p-4">
        <div className="relative">
          {showW3WComponent ? (
            <what3words-autosuggest 
              api_key={W3W_API_KEY}
              ref={w3wRef}
              clip_to_country="IN" // Limit to India
              return_coordinates={true}
            >
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search location or enter what3words address"
                className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                ref={inputRef}
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
                className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                ref={inputRef}
              />
            </>
          )}
          {query && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => {
                setQuery("");
                setIsW3WMode(false);
                if (inputRef.current) inputRef.current.focus();
              }}
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={cn(
            "flex-1 py-2 text-center font-medium",
            selectedTab === "all" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"
          )}
          onClick={() => handleTabSelect("all")}
        >
          All
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-center font-medium",
            selectedTab === "recent" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"
          )}
          onClick={() => handleTabSelect("recent")}
        >
          Recent
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-center font-medium",
            selectedTab === "favorites" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"
          )}
          onClick={() => handleTabSelect("favorites")}
        >
          Favorites
        </button>
      </div>

      {/* Results list - only show when not in w3w mode (w3w shows its own results) */}
      {!showW3WComponent && (
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredResults && filteredResults.length > 0 ? (
            <ul>
              {filteredResults.map((result) => (
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
  );
}