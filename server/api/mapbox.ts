import axios from "axios";
import { SearchResult, Route } from "@/types";

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY || "";
const MAPBOX_API_URL = "https://api.mapbox.com";

/**
 * Search for places (addresses or POIs) using Mapbox
 * @param query The search query
 * @returns Array of search results
 */
export async function searchPlace(query: string): Promise<SearchResult[]> {
  try {
    // Check if API key is available
    if (!MAPBOX_API_KEY) {
      console.warn("MAPBOX_API_KEY not found in environment variables");
      return [];
    }

    // Search for places using Mapbox Geocoding API
    const response = await axios.get(
      `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: MAPBOX_API_KEY,
          country: "in", // Limit to India
          limit: 5,
          types: "place,address,poi",
          language: "en"
        }
      }
    );

    // Format the results
    return response.data.features.map((feature: any) => {
      // Determine if it's a POI or regular address
      const isPOI = feature.properties && feature.properties.category;
      
      return {
        id: feature.id,
        name: feature.text,
        address: feature.place_name.replace(`${feature.text}, `, ""),
        coordinates: feature.center,
        type: isPOI ? "poi" : "address"
      };
    });
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}

/**
 * Get directions between two points using Mapbox
 * @param origin The origin coordinates [lng, lat]
 * @param destination The destination coordinates [lng, lat]
 * @returns Route object with geometry and other details
 */
export async function getDirections(
  origin: [number, number],
  destination: [number, number]
): Promise<Route | null> {
  try {
    // Check if API key is available
    if (!MAPBOX_API_KEY) {
      console.warn("MAPBOX_API_KEY not found in environment variables");
      return null;
    }

    // Get directions using Mapbox Directions API
    const response = await axios.get(
      `${MAPBOX_API_URL}/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`,
      {
        params: {
          access_token: MAPBOX_API_KEY,
          geometries: "geojson",
          overview: "full",
          steps: true,
          language: "en"
        }
      }
    );

    const route = response.data.routes[0];
    
    // Format the steps
    const steps = route.legs[0].steps.map((step: any) => ({
      distance: step.distance,
      duration: step.duration,
      instruction: step.maneuver.instruction,
      maneuver: step.maneuver.type,
      name: step.name
    }));

    // Calculate bounds from the geometry
    const coordinates = route.geometry.coordinates;
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    
    coordinates.forEach(([lng, lat]: [number, number]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });

    const bounds: [[number, number], [number, number]] = [
      [minLng, minLat],
      [maxLng, maxLat]
    ];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      bounds,
      steps
    };
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
}
