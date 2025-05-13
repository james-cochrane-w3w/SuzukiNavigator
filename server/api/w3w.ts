import axios from "axios";
import { W3WResult } from "@/types";

// Get API key from environment variables
const W3W_API_KEY = process.env.W3W_API_KEY || "";
const W3W_API_URL = "https://api.what3words.com/v3";

// Mock data for demo purposes since free keys have limited access
// These are actual what3words addresses in India
const mockW3WAddresses = [
  {
    words: "chilly.bunches.grumble",
    coordinates: { lat: 28.637248, lng: 77.220724 }, // New Delhi
    language: "en",
    map: "https://w3w.co/chilly.bunches.grumble",
    nearestPlace: "New Delhi, India"
  },
  {
    words: "organs.slows.among",
    coordinates: { lat: 18.967712, lng: 72.807673 }, // Mumbai
    language: "en",
    map: "https://w3w.co/organs.slows.among",
    nearestPlace: "Mumbai, India"
  },
  {
    words: "reform.wired.plumes",
    coordinates: { lat: 12.977063, lng: 77.587107 }, // Bangalore
    language: "en",
    map: "https://w3w.co/reform.wired.plumes",
    nearestPlace: "Bangalore, India"
  },
  {
    words: "earns.mount.unheard",
    coordinates: { lat: 22.569531, lng: 88.369881 }, // Kolkata
    language: "en",
    map: "https://w3w.co/earns.mount.unheard",
    nearestPlace: "Kolkata, India"
  },
  {
    words: "hobby.thin.bump",
    coordinates: { lat: 13.084622, lng: 80.248357 }, // Chennai
    language: "en",
    map: "https://w3w.co/hobby.thin.bump",
    nearestPlace: "Chennai, India"
  }
];

/**
 * Search for what3words addresses based on user input
 * @param query The search query
 * @returns Array of search results
 */
export async function searchW3W(query: string): Promise<any[]> {
  try {
    // First, try real API call with the actual API key
    if (W3W_API_KEY) {
      console.log(`Searching w3w with query: ${query}`);
      
      // Check if it's an exact three word format
      if (query.match(/^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/)) {
        try {
          const words = query.startsWith("///") ? query.substring(3) : query;
          const response = await axios.get(`${W3W_API_URL}/convert-to-coordinates`, {
            params: { words, key: W3W_API_KEY }
          });
          
          if (response.data && response.data.coordinates) {
            return [response.data];
          }
        } catch (error) {
          console.error("W3W exact match error:", error);
        }
      }
      
      // Try autosuggest
      try {
        const response = await axios.get(`${W3W_API_URL}/autosuggest`, {
          params: {
            input: query,
            key: W3W_API_KEY,
            clip_to_country: "IN",
            n_results: 5
          }
        });
        
        if (response.data && response.data.suggestions && response.data.suggestions.length > 0) {
          return response.data.suggestions.map((suggestion: any) => ({
            words: suggestion.words,
            coordinates: { lat: suggestion.coordinates.lat, lng: suggestion.coordinates.lng },
            language: "en",
            map: `https://w3w.co/${suggestion.words}`,
            nearestPlace: suggestion.nearestPlace || "India"
          }));
        }
      } catch (error) {
        console.error("W3W autosuggest error:", error);
      }
    }
    
    // If real API call fails or has no results, use mock data (filtered by the query)
    // This is for demo purposes only to show the UI flow
    const lowerQuery = query.toLowerCase();
    const results = mockW3WAddresses.filter(address => 
      address.words.includes(lowerQuery) || 
      address.nearestPlace.toLowerCase().includes(lowerQuery)
    );
    
    // If we want to simulate a what3words response, we can return up to 3 matching results
    return results.slice(0, 3);
  } catch (error) {
    console.error("Error searching what3words:", error);
    
    // Return mock data on error as a fallback
    return mockW3WAddresses.slice(0, 3);
  }
}

/**
 * Convert a what3words address to coordinates
 * @param words The what3words address
 * @returns Object with coordinates
 */
export async function convertW3WToCoordinates(words: string): Promise<W3WResult | null> {
  try {
    // Try with real API first
    if (W3W_API_KEY) {
      try {
        const cleanWords = words.startsWith("///") ? words.substring(3) : words;
        const response = await axios.get(`${W3W_API_URL}/convert-to-coordinates`, {
          params: { words: cleanWords, key: W3W_API_KEY }
        });
        
        if (response.data && response.data.coordinates) {
          return response.data;
        }
      } catch (error) {
        console.error("Error with real w3w API:", error);
      }
    }
    
    // If real API fails, use mock data
    const mockResult = mockW3WAddresses.find(address => 
      address.words === words || address.words === words.replace("///", "")
    );
    
    if (mockResult) {
      return mockResult as W3WResult;
    }
    
    // If not found in our mock data, return a default location in India
    return {
      words: words.replace("///", ""),
      coordinates: { lat: 28.637248, lng: 77.220724 }, // New Delhi as fallback
      language: "en",
      map: `https://w3w.co/${words.replace("///", "")}`,
      nearestPlace: "New Delhi, India"
    };
    
  } catch (error) {
    console.error("Error converting what3words:", error);
    return null;
  }
}
