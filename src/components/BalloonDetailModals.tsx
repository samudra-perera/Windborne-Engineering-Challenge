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
  left: 0,
  top: 0,
  width: "30%",
  height: "100%",
  bgcolor: "background.paper",
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {balloon ? (
          <>
            <Typography variant="h5" gutterBottom>
              Balloon Details
            </Typography>
            <Typography variant="body1">
              <strong>Latitude:</strong> {balloon.latitude.toFixed(4)}
            </Typography>
            <Typography variant="body1">
              <strong>Longitude:</strong> {balloon.longitude.toFixed(4)}
            </Typography>
            <Typography variant="body1">
              <strong>Altitude:</strong> {balloon.altitude} m
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {address && (
                  <Typography variant="body1">
                    <strong>Address:</strong> {address}
                  </Typography>
                )}
                {weather && (
                  <>
                    <Typography variant="body1">
                      <strong>Weather:</strong> {weather.description}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Temperature:</strong> {weather.temperature}°C
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
