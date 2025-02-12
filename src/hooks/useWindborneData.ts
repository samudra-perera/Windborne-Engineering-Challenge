import { useState, useEffect } from "react";

export interface WindborneBalloon {
  latitude: number;
  longitude: number;
  altitude: number;
}

export const useWindborneData = (hourOffset: number = 0) => {
  const [balloons, setBalloons] = useState<WindborneBalloon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalloonData() {
      const validHourOffset = Math.max(0, Math.min(23, hourOffset));
      const hourString = validHourOffset.toString().padStart(2, "0");

      // Use the CORS proxy. Make sure you have access; sometimes you must visit a demo page first.
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = `https://a.windbornesystems.com/treasure/${hourString}.json`;
      const url = proxyUrl + targetUrl;

      try {
        const response = await fetch(url);
        console.log("Response", response);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }

        const text = await response.text();
        //Replace NANs with null
        const santizedText = text.replace(/\bNaN\b/g, "null");

        const data: number[][] = JSON.parse(santizedText);
        console.log("Raw Data", data);

        //Filter out any entry that contains NaN
        const validData = data.filter((item) => {
          return !item.some((value) => value === null);
        });

        //Transform the list in array of objects
        const transformedData = validData.map((item) => ({
          latitude: item[0],
          longitude: item[1],
          altitude: item[2],
        }));

        setBalloons(transformedData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBalloonData();
  }, [hourOffset]);

  return { balloons, loading, error };
};
