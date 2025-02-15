import { useState, useEffect } from "react";

export interface WindborneBalloon {
  latitude: number;
  longitude: number;
  altitude: number;
}

//Dealing with weird data format and unformatted data
//Just extracting arrays from the text
function extractTopLevelArrays(text: string): string[] {
  const arrays: string[] = [];
  let level = 0;
  let startIndex = -1;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "[") {
      if (level === 0) {
        startIndex = i;
      }
      level++;
    } else if (char === "]") {
      level--;
      if (level === 0 && startIndex !== -1) {
        arrays.push(text.substring(startIndex, i + 1));
        startIndex = -1;
      }
    }
  }
  return arrays;
}

export const useWindborneData = (hourOffset: number = 0) => {
  const [balloons, setBalloons] = useState<WindborneBalloon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalloonData(offsetOverride?: number) {
      const effectiveOffset =
        offsetOverride !== undefined ? offsetOverride : hourOffset;
      const validOffset = Math.max(0, Math.min(23, effectiveOffset));
      const hourString = validOffset.toString().padStart(2, "0");

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

        let text = await response.text();
        text = text.trim();

        // Use our custom function to extract top-level arrays
        const arrayStrings = extractTopLevelArrays(text);
        console.log("Extracted array strings:", arrayStrings);

        // Process each extracted array:
        const dataArrays: number[][] = [];
        arrayStrings.forEach((arrayStr) => {
          // Replace literal NaN values with null
          const sanitized = arrayStr.replace(/\bNaN\b/g, "null");
          try {
            const parsed = JSON.parse(sanitized);
            if (Array.isArray(parsed)) {
              dataArrays.push(parsed);
            }
          } catch (parseError: any) {
            console.error("Error parsing array:", arrayStr, parseError.message);
          }
        });

        console.log("Raw Data arrays:", dataArrays);

        // Assume dataArrays is the array of arrays extracted from the raw text.
        let rawData: number[][] = [];
        if (
          dataArrays.length === 1 &&
          Array.isArray(dataArrays[0]) &&
          dataArrays[0].length > 0 &&
          Array.isArray(dataArrays[0][0])
        ) {
          // The response is wrapped in an extra array (i.e. dataArrays[0] contains the actual data)
          rawData = dataArrays[0];
        } else {
          // The response is already an array of data arrays.
          rawData = dataArrays;
        }

        // Filter out any entry that contains null
        const validData = rawData.filter(
          (item) => !item.some((value) => value === null),
        );

        // Transform the list into an array of objects
        const transformedData = validData.map((item) => ({
          latitude: item[0],
          longitude: item[1],
          altitude: item[2],
        }));

        setBalloons(transformedData);
      } catch (err: any) {
        if (hourOffset !== 0 && offsetOverride === undefined) {
          alert("Corrupted data received. Reverting to live data.");
          // await fetchBalloonData(0);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    // Always fetch data immediately
    fetchBalloonData();

    let intervalId: NodeJS.Timeout | undefined;
    if (hourOffset === 0) {
      intervalId = setInterval(fetchBalloonData, 300000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hourOffset]);

  return { balloons, loading, error, hourOffset };
};
