import axios from "axios";
import { SearchResult, Route } from "@/types";

// Get API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_BASE_URL = "https://maps.googleapis.com/maps/api";

/**
 * Search for places (addresses or POIs) using Google Places API
 * @param query The search query
 * @returns Array of search results
 */
export async function searchPlace(query: string): Promise<SearchResult[]> {
  try {
    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY not found in environment variables");
      return [];
    }

    // Make request to Google Places Autocomplete API
    const response = await axios.get(`${GOOGLE_MAPS_API_BASE_URL}/place/autocomplete/json`, {
      params: {
        input: query,
        key: GOOGLE_MAPS_API_KEY,
        components: "country:in", // Limit to India
        language: "en"
      }
    });

    // Check for successful response
    if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", response.data.status, response.data.error_message);
      return [];
    }

    // If no results, return empty array
    if (!response.data.predictions || response.data.predictions.length === 0) {
      return [];
    }

    // For each prediction, get the place details to get coordinates
    const detailedResults = await Promise.all(
      response.data.predictions.slice(0, 5).map(async (prediction: any) => {
        try {
          // Get place details
          const detailsResponse = await axios.get(`${GOOGLE_MAPS_API_BASE_URL}/place/details/json`, {
            params: {
              place_id: prediction.place_id,
              fields: "geometry,name,formatted_address,types",
              key: GOOGLE_MAPS_API_KEY
            }
          });

          if (detailsResponse.data.status === "OK" && detailsResponse.data.result) {
            const result = detailsResponse.data.result;
            const location = result.geometry?.location;

            // Determine if it's a POI or address based on types
            const isPOI = result.types && (
              result.types.includes("establishment") || 
              result.types.includes("point_of_interest") ||
              result.types.includes("tourist_attraction")
            );

            return {
              id: prediction.place_id,
              name: prediction.structured_formatting?.main_text || result.name,
              address: result.formatted_address,
              coordinates: [location.lng, location.lat] as [number, number],
              type: isPOI ? "poi" : "address"
            };
          }
          return null;
        } catch (error) {
          console.error(`Error getting details for place ${prediction.place_id}:`, error);
          return null;
        }
      })
    );

    return detailedResults.filter(Boolean) as SearchResult[];
  } catch (error) {
    console.error("Error searching Google Places:", error);
    return [];
  }
}

/**
 * Get directions between two points using Google Maps Directions API
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
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY not found in environment variables");
      return null;
    }

    // Make request to Google Directions API
    const response = await axios.get(`${GOOGLE_MAPS_API_BASE_URL}/directions/json`, {
      params: {
        origin: `${origin[1]},${origin[0]}`,
        destination: `${destination[1]},${destination[0]}`,
        mode: "driving",
        alternatives: false,
        language: "en",
        key: GOOGLE_MAPS_API_KEY
      }
    });

    // Check for successful response
    if (response.data.status !== "OK") {
      console.error("Google Directions API error:", response.data.status, response.data.error_message);
      return null;
    }

    // If no routes found, return null
    if (!response.data.routes || response.data.routes.length === 0) {
      return null;
    }

    const route = response.data.routes[0];
    const leg = route.legs[0]; // First (and only) leg of the route

    // Process the route to create our Route object
    const steps = leg.steps.map((step: any) => ({
      distance: step.distance.value,
      duration: step.duration.value,
      instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
      maneuver: step.maneuver || "straight",
      name: step.html_instructions.replace(/<[^>]*>/g, '')
    }));

    // Decode the polyline to get coordinates
    const coordinates = decodePolyline(route.overview_polyline.points);

    // Calculate bounds
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    coordinates.forEach(([lng, lat]) => {
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
      distance: leg.distance.value,
      duration: leg.duration.value,
      geometry: {
        type: "LineString",
        coordinates
      },
      bounds,
      steps
    };
  } catch (error) {
    console.error("Error getting Google directions:", error);
    return null;
  }
}

/**
 * Decodes an encoded polyline string into a series of coordinates
 * @param encoded The encoded polyline string
 * @returns Array of [lng, lat] coordinates
 */
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    // Google Maps polyline uses lat,lng pairs, but we'll convert to lng,lat for consistency
    poly.push([lng * 1e-5, lat * 1e-5]);
  }

  return poly;
}