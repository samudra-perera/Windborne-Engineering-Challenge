import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { WindborneBalloon } from "../hooks/useWindborneData";
import { WeatherData, getWeather, reverseGeocode } from "../utils/geoData";

interface BalloonDetailModalProps {
  balloon: WindborneBalloon | null;
  open: boolean;
  onClose: () => void;
}

const modalStyle = {
  position: "fixed" as const,
  left: "10%",
  top: "50%",
  transform: "translateY(-70%)",
  maxWidth: "200px",
  width: "30%",
  height: "40%",
  maxHeight: "350px",
  bgcolor: "#11213E",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};

const BalloonDetailModal = ({
  balloon,
  open,
  onClose,
}: BalloonDetailModalProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (balloon) {
      const fetchGeoData = async () => {
        setLoading(true);
        try {
          const addy = await reverseGeocode(
            balloon.latitude,
            balloon.longitude,
          );
          const weatherData = await getWeather(
            balloon.latitude,
            balloon.longitude,
          );
          setAddress(addy);
          setWeather(weatherData);
        } catch (error) {
          console.error("Failed to fetch geo data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGeoData();
    }
  }, [balloon]);

  // Helper: Convert Unix time to local time string
  const formatTime = (unixTime: number) => {
    return new Date(unixTime * 1000).toLocaleTimeString();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {balloon ? (
          <>
            <Typography variant="h6" gutterBottom color="white" fontSize="14px">
              Balloon Details
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Latitude:</strong> {balloon.latitude.toFixed(4)}
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Longitude:</strong> {balloon.longitude.toFixed(4)}
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Altitude:</strong> {balloon.altitude} km
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {address && (
                  <Typography variant="body1" color="white" fontSize="14px">
                    <strong>Address (as Plus Code):</strong> {address}
                  </Typography>
                )}
                {weather && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                      <img
                        src={weather.icon}
                        alt="Weather icon"
                        style={{ width: 50, height: 50, marginRight: 8 }}
                      />
                      <Typography variant="body1" fontSize="14px" color="white">
                        {weather.description}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontSize="14px" color="white">
                      <strong>Temperature:</strong> {weather.temperature}°C
                    </Typography>
                    <Typography variant="body1" color="white" fontSize="14px">
                      <strong>Wind Speed:</strong> {weather.windSpeed} m/s
                    </Typography>
                    <Typography variant="body1" color="white" fontSize="14px">
                      <strong>Humidity:</strong> {weather.humidity}%
                    </Typography>
                    <Typography fontSize="14px" variant="body1" color="white">
                      <strong>Pressure:</strong> {weather.pressure} hPa
                    </Typography>
                    <Typography variant="body1" fontSize="14px" color="white">
                      <strong>Sunrise:</strong> {formatTime(weather.sunrise)}
                    </Typography>
                    <Typography variant="body1" color="white" fontSize="14px">
                      <strong>Sunset:</strong> {formatTime(weather.sunset)}
                    </Typography>
                  </>
                )}
              </>
            )}
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onClose}>
                Close
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1">No data available.</Typography>
        )}
      </Box>
    </Modal>
  );
};

export default BalloonDetailModal;
