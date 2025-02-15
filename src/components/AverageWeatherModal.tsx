import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import TemperatureLegend from "./TemperatureLegend";
import { WeatherData } from "../utils/geoData";

interface AverageWeatherModalProps {
  averageWeather: Partial<WeatherData> | null;
  minTemp: number;
  maxTemp: number;
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

const AverageWeatherModal: React.FC<AverageWeatherModalProps> = ({
  averageWeather,
  minTemp,
  maxTemp,
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom color="white" fontSize="14px">
          Regional Average Weather
        </Typography>
        <Typography
          variant="caption"
          color="white"
          display="block"
          gutterBottom
        >
          Note: Weather data may be approximate due to data limitations and the
          interpolation method.
        </Typography>
        {averageWeather ? (
          <>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Temperature:</strong>{" "}
              {averageWeather.temperature?.toFixed(1)}°C
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Wind Speed:</strong>{" "}
              {averageWeather.windSpeed?.toFixed(1)} m/s
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Humidity:</strong> {averageWeather.humidity?.toFixed(1)}%
            </Typography>
            <Typography variant="body1" color="white" fontSize="14px">
              <strong>Pressure:</strong> {averageWeather.pressure?.toFixed(1)}{" "}
              hPa
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TemperatureLegend minTemp={minTemp} maxTemp={maxTemp} />
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="white" fontSize="14px">
            No average weather data available.
          </Typography>
        )}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AverageWeatherModal;
