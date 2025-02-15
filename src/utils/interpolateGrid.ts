import * as turf from "@turf/turf";
import { scaleLinear } from "d3-scale";
import { BalloonWithDistance } from "./findClosestFive";

export interface GradientPolygon {
  path: google.maps.LatLngLiteral[];
  fillColor: string;
}

export interface GradientResult {
  polygons: GradientPolygon[];
  minTemp: number;
  maxTemp: number;
}

export const generateGradientPolygon = (
  center: google.maps.LatLngLiteral,
  points: BalloonWithDistance[],
  delta: number,
  cellSize: number = 1,
): GradientResult => {
  // Create a bounding box around the center: [minLng, minLat, maxLng, maxLat]
  const bbox = [
    center.lng - delta,
    center.lat - delta,
    center.lng + delta,
    center.lat + delta,
  ];

  // Create a square grid over the bounding box (cellSize in degrees)
  const grid = turf.squareGrid(bbox, cellSize, { units: "degrees" });

  // Function to interpolate temperature at a given (lat, lng) using inverse-distance weighting
  const interpolateWeather = (lat: number, lng: number): number => {
    let totalWeight = 0;
    let weightedSum = 0;
    points.forEach((point) => {
      const distance = turf.distance(
        turf.point([lng, lat]),
        turf.point([point.balloon.longitude, point.balloon.latitude]),
        { units: "degrees" },
      );
      const weight = 1 / (distance + 0.001); // add a small epsilon to avoid division by zero
      totalWeight += weight;
      weightedSum += weight * (point.weather?.temperature ?? 0);
    });
    return weightedSum / totalWeight;
  };

  // For each grid cell, compute the interpolated temperature using the cell's centroid
  grid.features.forEach((feature) => {
    const centroid = turf.centroid(feature);
    const [lng, lat] = centroid.geometry.coordinates;
    const temp = interpolateWeather(lat, lng);
    feature.properties = { temperature: temp };
  });

  // Extract min and max temperature from the grid for scaling
  const temps = grid.features.map((f) => f.properties.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  // Create a color scale mapping temperature values to colors (blue for cold, red for hot)
  const colorScale = scaleLinear<string>()
    .domain([minTemp, maxTemp])
    .range(["blue", "red"]);

  // Convert each grid cell into a GradientPolygon object
  const polygons: GradientPolygon[] = grid.features.map((feature) => {
    // For squareGrid, each cell's geometry is a Polygon (an array of rings). We use the first ring.
    const coords = (feature.geometry.coordinates as number[][][])[0];
    const path: google.maps.LatLngLiteral[] = coords.map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));
    const cellTemp = feature.properties.temperature;
    const fillColor = colorScale(cellTemp);
    return { path, fillColor };
  });

  return { polygons, minTemp, maxTemp };
};
