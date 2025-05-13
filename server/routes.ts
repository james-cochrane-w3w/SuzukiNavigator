import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchW3W, convertW3WToCoordinates } from "./api/w3w";
import { getDirections, searchPlace } from "./api/mapbox";

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

      // If query looks like a what3words address, prioritize w3w search
      if (query.startsWith("///") || query.match(/^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/)) {
        const w3wQuery = query.startsWith("///") ? query.substring(3) : query;
        const w3wResults = await searchW3W(w3wQuery);
        results = [...w3wResults];
      } else {
        // Otherwise search for places using Mapbox
        const placeResults = await searchPlace(query);
        
        // Also check w3w for any matching results
        const w3wResults = await searchW3W(query);
        
        // Combine results with place results first, then w3w
        results = [...placeResults, ...w3wResults];
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

      const route = await getDirections([originLng, originLat], [destLng, destLat]);
      res.json(route);
    } catch (error) {
      console.error("Error getting directions:", error);
      res.status(500).json({ message: "Error getting directions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
