import axios from "axios";
import { W3WResult } from "@/types";

const W3W_API_KEY = process.env.W3W_API_KEY || "";
const W3W_API_URL = "https://api.what3words.com/v3";

/**
 * Search for what3words addresses based on user input
 * @param query The search query
 * @returns Array of search results
 */
export async function searchW3W(query: string): Promise<any[]> {
  try {
    // Check if API key is available
    if (!W3W_API_KEY) {
      console.warn("W3W_API_KEY not found in environment variables");
      return [];
    }

    // If the query is a valid 3 word address format
    if (query.match(/^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/) || query.match(/^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/)) {
      const words = query.startsWith("///") ? query.substring(3) : query;
      
      // Get coordinates for the 3 word address
      const response = await axios.get(`${W3W_API_URL}/convert-to-coordinates`, {
        params: {
          words,
          key: W3W_API_KEY
        }
      });

      if (response.data && response.data.coordinates) {
        return [response.data];
      }
    } 
    
    // Otherwise, do an autosuggest search
    const response = await axios.get(`${W3W_API_URL}/autosuggest`, {
      params: {
        input: query,
        key: W3W_API_KEY,
        clip_to_country: "IN", // Limit to India only
        n_results: 5
      }
    });

    if (response.data && response.data.suggestions) {
      // For each suggestion, get more details
      const suggestions = response.data.suggestions;
      const detailedResults = await Promise.all(
        suggestions.map(async (suggestion: any) => {
          try {
            const detailResponse = await axios.get(`${W3W_API_URL}/convert-to-coordinates`, {
              params: {
                words: suggestion.words,
                key: W3W_API_KEY
              }
            });
            
            return {
              ...suggestion,
              ...detailResponse.data
            };
          } catch (error) {
            console.error(`Error getting details for ${suggestion.words}:`, error);
            return suggestion;
          }
        })
      );
      
      return detailedResults;
    }

    return [];
  } catch (error) {
    console.error("Error searching what3words:", error);
    return [];
  }
}

/**
 * Convert a what3words address to coordinates
 * @param words The what3words address
 * @returns Object with coordinates
 */
export async function convertW3WToCoordinates(words: string): Promise<W3WResult | null> {
  try {
    // Check if API key is available
    if (!W3W_API_KEY) {
      console.warn("W3W_API_KEY not found in environment variables");
      return null;
    }

    // Clean up words if they include the /// prefix
    const cleanWords = words.startsWith("///") ? words.substring(3) : words;

    const response = await axios.get(`${W3W_API_URL}/convert-to-coordinates`, {
      params: {
        words: cleanWords,
        key: W3W_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error converting what3words:", error);
    return null;
  }
}
