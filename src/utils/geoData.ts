export interface WeatherData {
  description: string;
  temperature: number;
}

export async function getWeather(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }

    const data = await response.json();
    if (data.weather && data.weather.length > 0 && data.main) {
      return {
        description: data.weather[0].description,
        temperature: data.main.temp,
      };
    } else {
      throw new Error("No results found");
    }
  } catch (error: any) {
    console.error("Failed to fetch weather data", error.message);
  }
}

// Reverse GEO Coding using google maps API
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }

    const data = await response.json();
    if (data.results && data.result.length > 0) {
      return data.results[0].formatted_address;
    } else {
      throw new Error("No results found");
    }
  } catch (error: any) {
    console.error("Failed to fetch reverse geocode data", error.message);
  }
}
