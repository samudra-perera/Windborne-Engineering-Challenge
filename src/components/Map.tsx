import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import {
  findClosestFive,
  BalloonWithDistance,
  calcuateWeightedAverageWeather,
} from "../utils/findClosestFive";
import React, { useState } from "react";
import { useWindborneData } from "../hooks/useWindborneData";
import BalloonDetailModal from "./BalloonDetailModals";
import { WeatherData } from "../utils/geoData";
import {
  generateGradientPolygon,
  GradientPolygon,
} from "../utils/interpolateGrid";
import GradientOverlay from "./GradientOverlay";

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

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries: ["places", "visualization"],
  });

  // Custom fetch to balloon data
  const { balloons, loading, error } = useWindborneData(0);

  const [searchLocation, setSearchLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [closestFive, setClosestFive] = useState<BalloonWithDistance[]>([]);
  const [autoComplete, setAutoComplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [selectedBalloon, setSelectedBalloon] =
    useState<WindborneBalloon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [averageWeather, setAverageWeather] =
    useState<Partial<WeatherData> | null>(null);
  const [gradientPolygons, setGradientPolygons] = useState<GradientPolygon[]>(
    [],
  );

  const onLoad = (auto: google.maps.places.Autocomplete) => {
    setAutoComplete(auto);
  };

  const onMarkerClick = (balloon: WindborneBalloon) => {
    setSelectedBalloon(balloon);
    setModalOpen(true);
  };

  const onPlaceChanged = async () => {
    if (autoComplete) {
      const place = autoComplete.getPlace();
      if (place?.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        console.log("Place changed", location);
        setSearchLocation(location);
        // Find the 5 closest balloons to the search location
        const closest = await findClosestFive(location, balloons);
        console.log("Closest balloons:", closest);
        setClosestFive(closest);
        // Calculate the weighted average weather
        const avgWeather = calcuateWeightedAverageWeather(closest);
        console.log("Average weather:", avgWeather);
        setAverageWeather(avgWeather);
        // Generate the gradient polygons
        const polygons = generateGradientPolygon(location, closest, 5, 0.3);
        console.log("Gradient polygons:", polygons);
        setGradientPolygons(polygons);
      }
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;
  if (loading) return <div>Loading Balloon Data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div>
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input type="text" placeholder="Enter a location" />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
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
            onClick={() => onMarkerClick(balloon)}
          />
        ))}
        {searchLocation && (
          <Marker
            position={searchLocation}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            onClick={() => onMarkerClick(searchLocation)}
          />
        )}
        {searchLocation &&
          closestFive.map((closest, index) => {
            return (
              <React.Fragment key={`closest-${index}`}>
                {/* Draw the polyline */}
                <Polyline
                  path={[
                    searchLocation,
                    {
                      lat: closest.balloon.latitude,
                      lng: closest.balloon.longitude,
                    },
                  ]}
                  options={{
                    strokeColor: "green",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
                {/* Marker for the closest balloon */}
                <Marker
                  position={{
                    lat: closest.balloon.latitude,
                    lng: closest.balloon.longitude,
                  }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "green",
                    fillOpacity: 1,
                    scale: 7,
                    strokeColor: "green",
                    strokeWeight: 1,
                  }}
                  onClick={() => onMarkerClick(closest.balloon)}
                />
              </React.Fragment>
            );
          })}
        <GradientOverlay polygons={gradientPolygons} />
      </GoogleMap>
      <BalloonDetailModal
        balloon={selectedBalloon}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Map;
