import React from "react";
import { Polygon } from "@react-google-maps/api";
import { GradientPolygon } from "../utils/interpolateGrid";

interface GradientOverlayProps {
  polygons: GradientPolygon[];
}

const GradientOverlay: React.FC<GradientOverlayProps> = ({ polygons }) => {
  return (
    <>
      {polygons.map((poly, index) => (
        <Polygon
          key={`poly-${index}`}
          paths={poly.path}
          options={{
            fillColor: poly.fillColor,
            fillOpacity: 0.6,
            strokeColor: poly.fillColor,
            strokeOpacity: 0.8,
            strokeWeight: 1,
          }}
        />
      ))}
    </>
  );
};

export default GradientOverlay;
