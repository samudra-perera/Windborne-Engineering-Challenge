import * as turf from "@turf/turf";
import { WindborneBalloon } from "../hooks/useWindborneData";
import { WeatherData, getWeather } from "./geoData";

export interface BalloonWithDistance {
  balloon: WindborneBalloon;
  distance: number;
  weather: WeatherData;
}

export const findClosestFive = async (
  searchLocation: google.maps.LatLngLiteral,
  balloons: WindborneBalloon[],
): Promise<BalloonWithDistance[]> => {
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
  const closestFive = balloonsWithDistance.slice(0, 5);

  ///Now fetch the weather for each of the closest balloons
  const closestFiveWithWeather = await Promise.all(
    closestFive.map(async (balloon) => {
      const weather = await getWeather(
        balloon.balloon.latitude,
        balloon.balloon.longitude,
      );
      return { ...balloon, weather };
    }),
  );
  return closestFiveWithWeather;
};

export const calcuateWeightedAverageWeather = (
  closest: BalloonWithDistance[],
): Partial<WeatherData> => {
  let totalWeight = 0;
  let temperatureSum = 0;
  let windSpeedSum = 0;
  let humiditySum = 0;
  let pressureSum = 0;

  closest.forEach((balloon) => {
    const weight = 1 / (balloon.distance + 0.0001);
    totalWeight += weight;
    temperatureSum += weight * (balloon.weather?.temperature ?? 0);
    windSpeedSum += weight * (balloon.weather?.windSpeed ?? 0);
    humiditySum += weight * (balloon.weather?.humidity ?? 0);
    pressureSum += weight * (balloon.weather?.pressure ?? 0);
  });

  return {
    temperature: temperatureSum / totalWeight,
    windSpeed: windSpeedSum / totalWeight,
    humidity: humiditySum / totalWeight,
    pressure: pressureSum / totalWeight,
  };
};
