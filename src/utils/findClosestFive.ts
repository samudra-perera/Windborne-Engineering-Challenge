import * as turf from "@turf/turf";
import { WindborneBalloon } from "../hooks/useWindborneData";

export const findClosestFive = (
  searchLocation: google.maps.LatLngLiteral,
  balloons: WindborneBalloon[],
) => {
  //Convert the user location to a Turf.js point
  const searchPoint = turf.point([searchLocation.lng, searchLocation.lat]);

  //Map earch ball to an object with Turf.js point
  const balloonsWithDistance = balloons.map((balloon) => {
    const balloonPoint = turf.point([balloon.longitude, balloon.latitude]);
    const distance = turf.distance(searchPoint, balloonPoint);
    return { balloon, distance };
  });

  //Sort the balloons be ascending distance
  balloonsWithDistance.sort((a, b) => a.distance - b.distance);

  return balloonsWithDistance.slice(0, 5).map((item) => item.balloon);
};
