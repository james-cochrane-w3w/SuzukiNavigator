import axios from "axios";
import { SearchResult, Route } from "@/types";

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY || "";
const MAPBOX_API_URL = "https://api.mapbox.com";

// Mock place data for India (fallbacks if API key is missing)
const mockPlaces: SearchResult[] = [
  {
    id: "place.1",
    name: "Taj Mahal",
    address: "Agra, Uttar Pradesh, India",
    coordinates: [78.0421, 27.1751] as [number, number],
    type: "poi" 
  },
  {
    id: "place.2",
    name: "India Gate",
    address: "Rajpath, New Delhi, India",
    coordinates: [77.2293, 28.6129] as [number, number],
    type: "poi"
  },
  {
    id: "place.3",
    name: "Gateway of India",
    address: "Apollo Bandar, Mumbai, India",
    coordinates: [72.8347, 18.9220] as [number, number],
    type: "poi"
  },
  {
    id: "place.4",
    name: "Lotus Temple",
    address: "Lotus Temple Rd, New Delhi, India",
    coordinates: [77.2588, 28.5535] as [number, number],
    type: "poi"
  },
  {
    id: "place.5",
    name: "Connaught Place",
    address: "New Delhi, India",
    coordinates: [77.2177, 28.6304] as [number, number],
    type: "address"
  }
];

/**
 * Search for places (addresses or POIs) using Mapbox
 * @param query The search query
 * @returns Array of search results
 */
export async function searchPlace(query: string): Promise<SearchResult[]> {
  try {
    // Try to use real Mapbox API if key is available
    if (MAPBOX_API_KEY) {
      try {
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

        if (response.data && response.data.features && response.data.features.length > 0) {
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
        }
      } catch (error) {
        console.error("Error with real Mapbox API:", error);
      }
    } else {
      console.warn("MAPBOX_API_KEY not found in environment variables");
    }

    // Fallback to mock data
    const lowerQuery = query.toLowerCase();
    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(lowerQuery) || 
      place.address.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Error searching places:", error);
    return mockPlaces.slice(0, 3); // Return top 3 mock places on error
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
    // Try to use real Mapbox API if key is available
    if (MAPBOX_API_KEY) {
      try {
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

        if (response.data && response.data.routes && response.data.routes.length > 0) {
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
        }
      } catch (error) {
        console.error("Error with real Mapbox directions API:", error);
      }
    } else {
      console.warn("MAPBOX_API_KEY not found in environment variables");
    }

    // Generate mock route (simple straight line between origin and destination)
    // This is for demo purposes only
    const createLineString = (start: [number, number], end: [number, number], numPoints = 10) => {
      const coordinates: [number, number][] = [];
      
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lng = start[0] + t * (end[0] - start[0]);
        const lat = start[1] + t * (end[1] - start[1]);
        coordinates.push([lng, lat]);
      }
      
      return coordinates;
    };

    // Create mock route data
    const coordinatesArray = createLineString(origin, destination);
    const bounds: [[number, number], [number, number]] = [
      [
        Math.min(origin[0], destination[0]),
        Math.min(origin[1], destination[1])
      ],
      [
        Math.max(origin[0], destination[0]),
        Math.max(origin[1], destination[1])
      ]
    ];

    // Calculate distance (simplified for mock)
    const latDiff = destination[1] - origin[1];
    const lngDiff = destination[0] - origin[0];
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // rough m conversion
    
    // Mock steps for turn-by-turn navigation
    const mockSteps = [
      {
        distance: distance * 0.2,
        duration: (distance * 0.2) / 10, // assume 10 m/s
        instruction: "Start driving east",
        maneuver: "depart",
        name: "Local Road"
      },
      {
        distance: distance * 0.3,
        duration: (distance * 0.3) / 10,
        instruction: "Continue straight",
        maneuver: "straight",
        name: "Main Road"
      },
      {
        distance: distance * 0.5,
        duration: (distance * 0.5) / 10,
        instruction: "You have arrived at your destination",
        maneuver: "arrive",
        name: "Destination"
      }
    ];

    return {
      distance: distance,
      duration: distance / 10, // rough seconds estimate
      geometry: {
        type: "LineString",
        coordinates: coordinatesArray
      },
      bounds,
      steps: mockSteps
    };
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
}
