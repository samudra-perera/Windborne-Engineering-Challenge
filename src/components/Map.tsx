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
import { useWindborneData, WindborneBalloon } from "../hooks/useWindborneData";
import BalloonDetailModal from "./BalloonDetailModals";
import { WeatherData } from "../utils/geoData";
import {
  generateGradientPolygon,
  GradientPolygon,
} from "../utils/interpolateGrid";
import GradientOverlay from "./GradientOverlay";
import {
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import AverageWeatherModal from "./AverageWeatherModal";

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

  const [selectedTime, setSelectedTime] = useState(0);
  const { balloons, loading, error } = useWindborneData(selectedTime);

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
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  });
  const [showGradientOverlay, setShowGradientOverlay] = useState(true);

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
        // Clear previous state immediately
        setClosestFive([]);
        setGradientPolygons([]);
        setSearchLocation(location);
        console.log("Place changed", location);

        // Proceed with fetching new data and generating overlays
        const closest = await findClosestFive(location, balloons);
        console.log("Closest balloons:", closest);
        setClosestFive(closest);
        const avgWeather = calcuateWeightedAverageWeather(closest);
        console.log("Average weather:", avgWeather);
        setAverageWeather(avgWeather);
        const { polygons, minTemp, maxTemp } = generateGradientPolygon(
          location,
          closest,
          5,
          0.3,
        );
        console.log("Gradient polygons:", polygons);
        setGradientPolygons(polygons);
        setTempRange({ min: minTemp, max: maxTemp });

        //Open average weather modal
        setWeatherModalOpen(true);
      }
    }
  };

  // Handler for time selection
  const handleTimeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTime: number,
  ) => {
    if (newTime !== null) {
      console.log("New time selected:", newTime);
      setClosestFive([]);
      setAverageWeather(null);
      setGradientPolygons([]);
      setSelectedTime(newTime);
    }
  };

  //Handler for the gradient overlay toggle
  const handleGradientToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowGradientOverlay(event.target.checked);
  };

  if (!isLoaded) return <div>Loading Map...</div>;
  if (loading) return <div>Loading Balloon Data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {searchLocation && (
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "20px",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: "8px",
            padding: "8px",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showGradientOverlay}
                onChange={handleGradientToggle}
                color="primary"
              />
            }
            label="Show Gradient Overlay"
            style={{ color: "white" }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 10,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          padding: "8px",
        }}
      >
        <ToggleButtonGroup
          value={selectedTime}
          exclusive
          onChange={handleTimeChange}
          aria-label="Select time"
          sx={{
            color: "white",
          }}
        >
          <ToggleButton
            value={0}
            aria-label="Live"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            Live
          </ToggleButton>
          <ToggleButton
            value={1}
            aria-label="1"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            1h
          </ToggleButton>
          <ToggleButton
            value={3}
            aria-label="3"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            3h
          </ToggleButton>
          <ToggleButton
            value={7}
            aria-label="7"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            7h
          </ToggleButton>
          <ToggleButton
            value={12}
            aria-label="12"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            12h
          </ToggleButton>
          <ToggleButton
            value={16}
            aria-label="16"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            16h
          </ToggleButton>
          <ToggleButton
            value={23}
            aria-label="23"
            sx={{
              color: "white",
              "&.Mui-selected": {
                color: "#1D2C4D",
              },
            }}
          >
            24h
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          width: "90%",
          maxWidth: "500px",
          backgroundColor: "black",
          padding: "10px 10px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Find the five closest balloons..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: "40px",
              fontSize: "16px",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0 10px",
              outline: "none",
              flex: 1,
              backgroundColor: "black",
            }}
          />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        key={`map-${searchLocation ? searchLocation.lat : "default"}-${searchLocation ? searchLocation.lng : "default"}`}
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
            onClick={() => {
              setWeatherModalOpen(true);
            }}
          />
        )}
        {searchLocation &&
          closestFive.map((closest, index) => (
            <React.Fragment
              key={`closest-${searchLocation.lat}-${searchLocation.lng}-${index}`}
            >
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
          ))}
        {searchLocation && showGradientOverlay && (
          <GradientOverlay polygons={gradientPolygons} />
        )}
      </GoogleMap>
      <BalloonDetailModal
        balloon={selectedBalloon}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      {averageWeather && (
        <AverageWeatherModal
          averageWeather={averageWeather}
          open={weatherModalOpen}
          onClose={() => setWeatherModalOpen(false)}
          minTemp={tempRange.min}
          maxTemp={tempRange.max}
        />
      )}
    </>
  );
};

export default Map;
