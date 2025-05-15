import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchW3W, convertW3WToCoordinates } from "./api/w3w";
import { getDirections as getMapboxDirections, searchPlace as searchMapboxPlace } from "./api/mapbox";
import { getDirections as getGoogleDirections, searchPlace as searchGooglePlace } from "./api/google-maps";

export async function registerRoutes(app: Express): Promise<Server> {
  // W3W API routes
  app.get("/api/w3w/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const results = await searchW3W(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching w3w:", error);
      res.status(500).json({ message: "Error searching what3words" });
    }
  });

  app.get("/api/w3w/convert", async (req, res) => {
    try {
      const words = req.query.words as string;
      if (!words) {
        return res.status(400).json({ message: "Words parameter is required" });
      }

      const result = await convertW3WToCoordinates(words);
      res.json(result);
    } catch (error) {
      console.error("Error converting w3w:", error);
      res.status(500).json({ message: "Error converting what3words" });
    }
  });

  // Search API route (combines w3w, addresses, and POIs)
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      let results = [];

      // Check if the query looks like a what3words address
      const isW3WFormat = query.startsWith("///") || query.includes(".");
      
      // If the query is in what3words format, prioritize w3w search
      if (isW3WFormat) {
        const w3wQuery = query.startsWith("///") ? query.substring(3) : query;
        const w3wResults = await searchW3W(w3wQuery);
        
        // If we got w3w results, return them exclusively
        if (w3wResults.length > 0) {
          results = [...w3wResults];
          return res.json(results.slice(0, 5)); // Limit to 5 results
        }
      }
      
      // For all other searches, use Google Places
      try {
        const placeResults = await searchGooglePlace(query);
        console.log(`Found ${placeResults.length} Google results for "${query}"`);
        
        // Add Google results
        results = [...placeResults];
        
        // If it's potentially a w3w format but still in progress (e.g., only contains one dot),
        // and we didn't get any w3w results above, also check w3w as a secondary search
        if (isW3WFormat) {
          const w3wQuery = query.startsWith("///") ? query.substring(3) : query;
          const w3wResults = await searchW3W(w3wQuery);
          
          // Append any w3w results after place results
          results = [...results, ...w3wResults];
        }
      } catch (error) {
        console.error("Error with Google Places:", error);
        
        // Fallback to Mapbox if Google fails
        const placeResults = await searchMapboxPlace(query);
        console.log(`Fallback: Found ${placeResults.length} Mapbox results for "${query}"`);
        results = [...placeResults];
      }

      res.json(results.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Error searching for locations" });
    }
  });

  // Directions API route
  app.get("/api/directions", async (req, res) => {
    try {
      const origin = req.query.origin as string;
      const destination = req.query.destination as string;
      
      if (!origin || !destination) {
        return res.status(400).json({ message: "Origin and destination parameters are required" });
      }

      const [originLng, originLat] = origin.split(",").map(Number);
      const [destLng, destLat] = destination.split(",").map(Number);

      // Try Google Maps directions first (preferred)
      let route = null;
      
      try {
        route = await getGoogleDirections([originLng, originLat], [destLng, destLat]);
        console.log("Got directions from Google Maps API");
      } catch (error) {
        console.error("Error with Google Directions:", error);
        
        // Fallback to Mapbox if Google fails
        route = await getMapboxDirections([originLng, originLat], [destLng, destLat]);
        console.log("Fallback: Got directions from Mapbox API");
      }
      
      res.json(route);
    } catch (error) {
      console.error("Error getting directions:", error);
      res.status(500).json({ message: "Error getting directions" });
    }
  });

  // Get Google Maps API Key
  app.get("/api/config/maps", (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
