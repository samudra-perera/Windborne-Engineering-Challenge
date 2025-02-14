export interface WeatherData {
  location: string;
  description: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  icon: string;
  sunrise: number;
  sunset: number;
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
    console.log(data);
    if (
      data.weather &&
      data.weather.length > 0 &&
      data.main &&
      data.wind &&
      data.name &&
      data.name &&
      data.sys
    ) {
      const description = data.weather[0].description;
      const temperature = data.main.temp;
      const windSpeed = data.wind.speed;
      const humidity = data.main.humidity;
      const pressure = data.main.pressure;
      const location = `${data.name}, ${data.sys.country}`;
      const iconCode = data.weather[0].icon;
      const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
      const sunrise = data.sys.sunrise;
      const sunset = data.sys.sunset;

      return {
        location,
        description,
        temperature,
        windSpeed,
        humidity,
        pressure,
        icon: iconUrl,
        sunrise,
        sunset,
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
    console.log(data);
    if (data.results) {
      return data.results[0].formatted_address;
    } else {
      throw new Error("No results found");
    }
  } catch (error: any) {
    console.error("Failed to fetch reverse geocode data", error.message);
  }
}
