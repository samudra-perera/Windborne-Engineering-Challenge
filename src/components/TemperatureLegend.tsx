import React from "react";

interface TemperatureLegendProps {
  minTemp: number;
  maxTemp: number;
}

const TemperatureLegend: React.FC<TemperatureLegendProps> = ({
  minTemp,
  maxTemp,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        zIndex: 10,
        width: "200px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ marginBottom: "8px", textAlign: "center", fontWeight: "bold" }}
      >
        Temperature (°C)
      </div>
      <div
        style={{
          height: "20px",
          background: "linear-gradient(to right, blue, red)",
          borderRadius: "4px",
          marginBottom: "4px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
        }}
      >
        <span>{minTemp.toFixed(1)}</span>
        <span>{maxTemp.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default TemperatureLegend;
