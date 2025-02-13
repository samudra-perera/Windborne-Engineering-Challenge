import * as turf from "@turf/turf";
import { WindborneBalloon } from "../hooks/useWindborneData";

export interface BalloonWithDistance {
  balloon: WindborneBalloon;
  distance: number;
}

export const findClosestFive = (
  searchLocation: google.maps.LatLngLiteral,
  balloons: WindborneBalloon[],
): BalloonWithDistance[] => {
  // Convert the user location to a Turf.js point
  const searchPoint = turf.point([searchLocation.lng, searchLocation.lat]);

  // Map each balloon to an object with its Turf.js point and calculated distance
  const balloonsWithDistance = balloons.map((balloon) => {
    const balloonPoint = turf.point([balloon.longitude, balloon.latitude]);
    const distance = turf.distance(searchPoint, balloonPoint); // in kilometers by default
    return { balloon, distance };
  });

  // Sort the balloons by ascending distance
  balloonsWithDistance.sort((a, b) => a.distance - b.distance);

  // Return the five closest balloons with their distances
  return balloonsWithDistance.slice(0, 5);
};
