import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import * as turf from "@turf/turf";
import { useWindborneData } from "../hooks/useWindborneData";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const mapOptions: google.maps.MapOptions = {
  minZoom: 3,
  maxZoom: 17,
  disableDefaultUI: true, // Removes Google Maps default controls
  zoomControl: true, // Allows zooming manually
  restriction: {
    latLngBounds: {
      north: 85, // Maximum north latitude (near the North Pole)
      south: -85, // Maximum south latitude (near the South Pole)
      west: -180, // Western boundary
      east: 180, // Eastern boundary
    },
    strictBounds: true, // Prevents dragging beyond bounds
  },
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#1d2c4d" }], // Dark blue map background
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ec3b9" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a3646" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#304a7d" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

const center = { lat: 0, lng: 0 }; // Default center

// Example balloon locations
const balloonLocations = [
  { lat: -75.777, lng: -179.658 },
  { lat: 19.768, lng: 139.528 },
  { lat: 48.8566, lng: 2.3522 }, // Paris
];

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  // Custom fetch to balloon data
  const { balloons, loading, error } = useWindborneData(0);

  const [userPosition, setUserPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [closestBalloon, setClosestBalloon] =
    useState<google.maps.LatLngLiteral | null>(null);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const userLatLng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setUserPosition(userLatLng);
    findClosestBalloon(userLatLng);
  }, []);

  const findClosestBalloon = (userLatLng: google.maps.LatLngLiteral) => {
    const userPoint = turf.point([userLatLng.lng, userLatLng.lat]);
    const balloonPoints = balloonLocations.map((loc) =>
      turf.point([loc.lng, loc.lat]),
    );
    const balloonCollection = turf.featureCollection(balloonPoints);
    const nearestBalloon = turf.nearestPoint(userPoint, balloonCollection);

    setClosestBalloon({
      lat: nearestBalloon.geometry.coordinates[1],
      lng: nearestBalloon.geometry.coordinates[0],
    });
  };

  if (!isLoaded) return <div>Loading Map...</div>;
  if (loading) return <div>Loading Balloon Data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={2}
      onClick={handleMapClick}
      options={mapOptions}
    >
      {balloons.map((balloon, index) => (
        <Marker
          key={index}
          position={{ lat: balloon.latitude, lng: balloon.longitude }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "red",
            fillOpacity: 1,
            scale: 2.5, // Adjust size as needed
            strokeColor: "red",
            strokeWeight: 0.5,
          }}
        />
      ))}
      {userPosition && (
        <Marker
          position={userPosition}
          icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        />
      )}
      {closestBalloon && (
        <Marker
          position={closestBalloon}
          icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        />
      )}
    </GoogleMap>
  );
};

export default Map;
