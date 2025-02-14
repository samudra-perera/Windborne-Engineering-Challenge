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

      // Use the CORS proxy.
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = `https://a.windbornesystems.com/treasure/${hourString}.json`;
      const url = proxyUrl + targetUrl;

      try {
        setLoading(true);
        const response = await fetch(url);
        console.log("Response", response);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }

        const text = await response.text();
        // Replace literal NaN values with null
        const sanitizedText = text.replace(/\bNaN\b/g, "null");

        const data: number[][] = JSON.parse(sanitizedText);
        console.log("Raw Data", data);

        // Filter out any entry that contains null
        const validData = data.filter(
          (item) => !item.some((value) => value === null),
        );

        // Transform the list into an array of objects
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

    // Always fetch data immediately
    fetchBalloonData();

    // If hourOffset is 0 (live), set up polling every 5 minutes (300,000 ms)
    let intervalId: NodeJS.Timeout | undefined;
    if (hourOffset === 0) {
      intervalId = setInterval(fetchBalloonData, 300000);
    }

    // Clean up interval on unmount or when hourOffset changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hourOffset]);

  return { balloons, loading, error };
};
