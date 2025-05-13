import React, { useState, useEffect, useRef } from "react";
import { useW3W } from "@/hooks/use-w3w";
import { W3WBadge } from "../ui/w3w-badge";
import { SearchResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface SearchPanelProps {
  isVisible: boolean;
  onDestinationSelect: (destination: SearchResult) => void;
}

export function SearchPanel({ isVisible, onDestinationSelect }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "favorites">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchW3W } = useW3W();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

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
    setSearchQuery(result.name);
  };

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
            className="pl-10 pr-10 py-2 w-full border border-[hsl(var(--suzuki-light))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--suzuki-blue))] text-[hsl(var(--suzuki-dark))]"
          />
          {searchQuery && (
            <span 
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
              onClick={handleClearSearch}
            >
              <span className="material-icons text-[hsl(var(--suzuki-gray))]">close</span>
            </span>
          )}
        </div>
      </div>

      {/* Search Filter Tabs */}
      <div className="flex border-b border-[hsl(var(--suzuki-light))]">
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "all" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-gray))]"}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "recent" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-gray))]"}`}
          onClick={() => setActiveTab("recent")}
        >
          Recent
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "favorites" ? "text-[hsl(var(--suzuki-blue))] border-b-2 border-[hsl(var(--suzuki-blue))]" : "text-[hsl(var(--suzuki-gray))]"}`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
      </div>

      {/* Search Suggestions */}
      <div className="max-h-96 overflow-y-auto divide-y divide-[hsl(var(--suzuki-light))]">
        {isLoading ? (
          <div className="p-4 text-center text-[hsl(var(--suzuki-dark-gray))]">Searching...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div 
              key={`${result.id}-${index}`}
              className="search-suggestion px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-[hsl(var(--suzuki-light))]"
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
                <h3 className={`font-medium text-[hsl(var(--suzuki-dark))] ${result.type === "w3w" ? "what3words-address" : ""}`}>
                  {result.name}
                </h3>
                <p className="text-sm text-[hsl(var(--suzuki-gray))]">{result.address}</p>
              </div>
            </div>
          ))
        ) : searchQuery.length > 2 ? (
          <div className="p-4 text-center text-[hsl(var(--suzuki-dark-gray))]">No results found</div>
        ) : null}
      </div>
    </div>
  );
}
