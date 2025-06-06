import React, { useState, useEffect, useRef } from "react";
import { useW3W } from "@/hooks/use-w3w";
import { W3WBadge } from "../ui/w3w-badge";
import { SearchResult } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface SearchPanelProps {
  isVisible: boolean;
  onDestinationSelect: (destination: SearchResult) => void;
}

export function SearchPanel({ isVisible, onDestinationSelect }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "favorites">("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Type guard for validating search results
  const isValidSearchResult = (item: any): item is SearchResult => {
    return item && 
           typeof item.id === 'string' && 
           typeof item.name === 'string' && 
           typeof item.address === 'string' &&
           Array.isArray(item.coordinates) && 
           item.coordinates.length === 2 &&
           typeof item.coordinates[0] === 'number' && 
           typeof item.coordinates[1] === 'number' &&
           (item.type === 'address' || item.type === 'poi' || item.type === 'w3w');
  };
  
  // Fetch search results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Determine if it looks like a what3words address
        const isW3WFormat = searchQuery.startsWith("///") || 
                           /^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/.test(searchQuery);
        
        let results: SearchResult[] = [];
        
        if (isW3WFormat) {
          // If it's a w3w format, prioritize w3w search
          const cleanQuery = searchQuery.startsWith("///") ? searchQuery.substring(3) : searchQuery;
          
          try {
            const response = await axios.get(`/api/w3w/search?query=${encodeURIComponent(cleanQuery)}`);
            
            if (response.data && Array.isArray(response.data)) {
              const validResults = response.data
                .filter(item => item && item.words && item.coordinates && item.coordinates.lng && item.coordinates.lat)
                .map(item => ({
                  id: item.words,
                  name: item.words,
                  address: item.nearestPlace || "India",
                  coordinates: [item.coordinates.lng, item.coordinates.lat] as [number, number],
                  type: "w3w" as const
                }));
              
              results = validResults;
            }
          } catch (error) {
            console.error("Error in w3w search:", error);
          }
        } else {
          // Search for regular places first
          try {
            const placesResponse = await axios.get(`/api/search?query=${encodeURIComponent(searchQuery)}`);
            
            if (placesResponse.data && Array.isArray(placesResponse.data)) {
              // Convert and validate place results
              const placeResults = placesResponse.data
                .filter(item => item && item.coordinates && Array.isArray(item.coordinates) && item.coordinates.length === 2)
                .map(item => ({
                  id: item.id || `place-${Math.random().toString(36).substring(2, 9)}`,
                  name: item.name || "",
                  address: item.address || "",
                  coordinates: item.coordinates as [number, number],
                  type: (item.type === "poi" || item.type === "address") ? item.type : "address" as "address" | "poi" | "w3w"
                }));
              
              results = placeResults;
            }
          } catch (error) {
            console.error("Error in place search:", error);
          }
          
          // Also search for what3words if not too many results yet
          if (results.length < 5) {
            try {
              const w3wResponse = await axios.get(`/api/w3w/search?query=${encodeURIComponent(searchQuery)}`);
              
              if (w3wResponse.data && Array.isArray(w3wResponse.data)) {
                const w3wResults = w3wResponse.data
                  .filter(item => item && item.words && item.coordinates && item.coordinates.lng && item.coordinates.lat)
                  .map(item => ({
                    id: item.words,
                    name: item.words,
                    address: item.nearestPlace || "India",
                    coordinates: [item.coordinates.lng, item.coordinates.lat] as [number, number],
                    type: "w3w" as const
                  }));
                
                // Append w3w results to places
                results = [...results, ...w3wResults];
              }
            } catch (error) {
              console.error("Error in w3w search:", error);
            }
          }
        }
        
        // Final validation pass to ensure all results are valid
        const validatedResults = results.filter(isValidSearchResult);
        setSearchResults(validatedResults);
      } catch (error) {
        console.error("Error searching:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        fetchResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleClearSearch = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onDestinationSelect(result);
    
    // For w3w addresses, show with the /// prefix in the search bar
    if (result.type === "w3w" && !result.name.startsWith("///")) {
      setSearchQuery(`///${result.name}`);
    } else {
      setSearchQuery(result.name);
    }
  };

  // Filter results based on active tab
  const filteredResults = searchResults.filter(result => {
    if (activeTab === "all") return true;
    if (activeTab === "recent") {
      // In a real app, this would check a "recent" flag or timestamp
      // For now, just show some results
      return result.type === "address";
    }
    if (activeTab === "favorites") {
      // In a real app, this would check a "favorite" flag
      // For now, just show some different results
      return result.type === "poi";
    }
    return true;
  });

  return (
    <div className={`absolute inset-x-0 top-16 z-10 bg-white ${isVisible ? "" : "hidden"}`}>
      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--suzuki-dark-gray))]">
            <span className="material-icons">search</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for destination, POI or ///what3words"
            className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--suzuki-blue))] text-gray-800"
          />
          {searchQuery && (
            <span 
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
              onClick={handleClearSearch}
            >
              <span className="material-icons text-gray-400">close</span>
            </span>
          )}
        </div>
      </div>

      {/* Search Filter Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "all" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "recent" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"}`}
          onClick={() => setActiveTab("recent")}
        >
          Recent
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "favorites" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-gray-500"}`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
      </div>

      {/* Search Suggestions */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result, index) => (
            <div 
              key={`${result.id}-${index}`}
              className="search-suggestion px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50"
              onClick={() => handleResultClick(result)}
            >
              {result.type === "w3w" ? (
                <W3WBadge className="mt-1" />
              ) : result.type === "poi" ? (
                <span className="material-icons text-[hsl(var(--suzuki-blue))] mt-1">store</span>
              ) : (
                <span className="material-icons text-[hsl(var(--suzuki-blue))] mt-1">location_on</span>
              )}
              <div>
                <h3 className={`font-medium text-gray-900 ${result.type === "w3w" ? "what3words-address" : ""}`}>
                  {result.type === "w3w" && !result.name.startsWith("///") ? `${result.name}` : result.name}
                </h3>
                <p className="text-sm text-gray-500">{result.address}</p>
              </div>
            </div>
          ))
        ) : searchQuery.length > 2 ? (
          <div className="p-4 text-center text-gray-500">No results found</div>
        ) : null}
      </div>
    </div>
  );
}
