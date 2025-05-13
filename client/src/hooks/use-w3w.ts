import { useState, useCallback } from "react";
import { SearchResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useW3W() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchW3W = useCallback(async (query: string): Promise<SearchResult[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/w3w/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search what3words');
      }
      
      const data = await response.json();
      return data.map((result: any) => ({
        id: result.id || result.words,
        name: result.words,
        address: result.nearestPlace || 'India',
        coordinates: [result.coordinates.lng, result.coordinates.lat],
        type: 'w3w'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertW3WToCoordinates = useCallback(async (words: string): Promise<[number, number] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/w3w/convert?words=${encodeURIComponent(words)}`);
      
      if (!response.ok) {
        throw new Error('Failed to convert what3words address');
      }
      
      const data = await response.json();
      return [data.coordinates.lng, data.coordinates.lat];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchW3W,
    convertW3WToCoordinates,
    isLoading,
    error
  };
}
