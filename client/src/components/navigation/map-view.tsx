import React, { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route } from "@/types";

interface MapViewProps {
  origin?: [number, number];
  destination?: [number, number];
  route?: Route;
  onMapLoaded?: () => void;
}

export function MapView({ origin, destination, route, onMapLoaded }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);

  // Fetch route if origin and destination are provided
  const { data: routeData } = useQuery<Route>({
    queryKey: ['/api/directions', origin, destination],
    enabled: !!origin && !!destination,
  });

  // Initialize Google Maps
  const initMap = useCallback(() => {
    if (!mapRef.current) return;

    // Default center (New Delhi, India)
    const defaultCenter = { lat: 28.6139, lng: 77.2090 };

    // Calculate center based on available points
    const center = origin 
      ? { lat: origin[1], lng: origin[0] } 
      : destination 
        ? { lat: destination[1], lng: destination[0] } 
        : defaultCenter;

    // Create a new map instance
    const mapOptions: google.maps.MapOptions = {
      center,
      zoom: 12,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    };

    // Initialize the map
    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Add custom controls
    addCustomControls();

    // Call onMapLoaded when the map is ready
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [onMapLoaded]);

  // Add custom controls to the map
  const addCustomControls = useCallback(() => {
    if (!googleMapRef.current) return;

    // Create current location button control
    const locationControlDiv = document.createElement("div");
    locationControlDiv.className = "custom-map-control";
    locationControlDiv.style.marginBottom = "10px";
    
    const locationControl = document.createElement("button");
    locationControl.className = "bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer";
    locationControl.innerHTML = '<span class="material-icons">my_location</span>';
    locationControl.style.backgroundColor = "white";
    locationControl.style.width = "40px";
    locationControl.style.height = "40px";
    locationControl.style.borderRadius = "50%";
    locationControl.style.border = "none";
    locationControl.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    locationControl.style.cursor = "pointer";
    locationControl.style.display = "flex";
    locationControl.style.alignItems = "center";
    locationControl.style.justifyContent = "center";
    locationControl.title = "Get your current location";
    
    locationControlDiv.appendChild(locationControl);
    
    // Get current location when clicked
    locationControl.addEventListener("click", () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(pos);
            googleMapRef.current.setZoom(15);
          }
        },
        (err) => {
          console.error("Error getting current location:", err);
        }
      );
    });
    
    // Add the control to the map
    googleMapRef.current.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationControlDiv);
  }, []);

  // Update markers when origin or destination change
  const updateMarkers = useCallback(() => {
    if (!googleMapRef.current) return;
    
    // Clear existing markers
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
      originMarkerRef.current = null;
    }
    
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }
    
    // Add origin marker if available
    if (origin) {
      originMarkerRef.current = new google.maps.Marker({
        position: { lat: origin[1], lng: origin[0] },
        map: googleMapRef.current,
        title: "Current Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#0C2E67", // Suzuki blue
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 8
        }
      });
    }
    
    // Add destination marker if available
    if (destination) {
      destinationMarkerRef.current = new google.maps.Marker({
        position: { lat: destination[1], lng: destination[0] },
        map: googleMapRef.current,
        title: "Destination",
        icon: {
          path: google.maps.SymbolPath.MARKER,
          fillColor: "#D50000", // Suzuki red
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 8
        }
      });
    }
    
    // Set appropriate view based on markers
    if (origin && destination && googleMapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: origin[1], lng: origin[0] });
      bounds.extend({ lat: destination[1], lng: destination[0] });
      googleMapRef.current.fitBounds(bounds, 50); // 50px padding
    } else if (origin && googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: origin[1], lng: origin[0] });
      googleMapRef.current.setZoom(15);
    } else if (destination && googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: destination[1], lng: destination[0] });
      googleMapRef.current.setZoom(15);
    }
  }, [origin, destination]);

  // Update route polyline when route data changes
  const updateRoute = useCallback(() => {
    if (!googleMapRef.current) return;
    
    const displayRoute = route || routeData;
    
    // Clear existing route
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    
    // Add new route if available
    if (displayRoute && displayRoute.geometry && displayRoute.geometry.coordinates.length > 0) {
      const path = displayRoute.geometry.coordinates.map(([lng, lat]) => ({
        lat, lng
      }));
      
      routePolylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#0C2E67", // Suzuki blue
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: googleMapRef.current
      });
      
      // Fit bounds to route
      if (displayRoute.bounds) {
        const bounds = new google.maps.LatLngBounds(
          { lat: displayRoute.bounds[0][1], lng: displayRoute.bounds[0][0] }, // SW
          { lat: displayRoute.bounds[1][1], lng: displayRoute.bounds[1][0] }  // NE
        );
        googleMapRef.current.fitBounds(bounds, 50); // 50px padding
      } else if (path.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        googleMapRef.current.fitBounds(bounds, 50);
      }
    }
  }, [route, routeData]);

  // Initialize the Google Maps script
  useEffect(() => {
    // Only load the Google Maps script once
    if (!window.google || !window.google.maps) {
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // Initialize map when script loads
      script.onload = initMap;
      
      // Add script to document
      document.head.appendChild(script);
      
      // Clean up
      return () => {
        document.head.removeChild(script);
      };
    } else {
      // Google Maps already loaded, initialize map directly
      initMap();
    }
  }, [initMap]);

  // Update markers and route when data changes
  useEffect(() => {
    if (googleMapRef.current) {
      updateMarkers();
      updateRoute();
    }
  }, [updateMarkers, updateRoute]);

  return (
    <div className="relative h-[calc(100vh-190px)] bg-gray-200">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
