
export interface WeatherDataPoint {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainfall: number;
  gdd: number;
}

export interface WeatherMetrics {
  totalGDD: number;
  totalRainfall: number;
  avgHighTemp: number;
  avgLowTemp: number;
}

export const calculateGDD = (tempHigh: number, tempLow: number, baseTemp: number = 50): number => {
  const avgTemp = (tempHigh + tempLow) / 2;
  return Math.max(0, avgTemp - baseTemp);
};

export const calculateMetrics = (weatherData: WeatherDataPoint[]): WeatherMetrics => {
  if (weatherData.length === 0) {
    return { totalGDD: 0, totalRainfall: 0, avgHighTemp: 0, avgLowTemp: 0 };
  }

  const totalGDD = weatherData.reduce((sum, day) => sum + day.gdd, 0);
  const totalRainfall = weatherData.reduce((sum, day) => sum + day.rainfall, 0);
  const avgHighTemp = weatherData.reduce((sum, day) => sum + day.tempHigh, 0) / weatherData.length;
  const avgLowTemp = weatherData.reduce((sum, day) => sum + day.tempLow, 0) / weatherData.length;

  return {
    totalGDD: Math.round(totalGDD),
    totalRainfall: Math.round(totalRainfall * 100) / 100,
    avgHighTemp: Math.round(avgHighTemp),
    avgLowTemp: Math.round(avgLowTemp)
  };
};

export const fetchWeatherData = async (
  location: string,
  startDate: string,
  endDate: string
): Promise<WeatherDataPoint[]> => {
  // Get coordinates from location (simplified - using default Napa Valley coordinates)
  let lat = 38.2975;
  let lon = -122.4581;

  try {
    // Try to geocode the location if it's not the default
    if (location.toLowerCase() !== 'napa valley, ca') {
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=demo&limit=1`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.results && geocodeData.results.length > 0) {
          lat = geocodeData.results[0].geometry.lat;
          lon = geocodeData.results[0].geometry.lng;
        }
      }
    }
  } catch (error) {
    console.warn('Geocoding failed, using default coordinates:', error);
  }

  // Fetch weather data from Open Meteo
  const weatherResponse = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error(`Weather API error: ${weatherResponse.status}`);
  }

  const weatherResult = await weatherResponse.json();
  
  if (!weatherResult.daily || !weatherResult.daily.time) {
    throw new Error('No weather data available for this date range');
  }

  // Process the weather data
  const weatherData: WeatherDataPoint[] = [];
  for (let i = 0; i < weatherResult.daily.time.length; i++) {
    const date = weatherResult.daily.time[i];
    const tempHigh = weatherResult.daily.temperature_2m_max[i] || 70;
    const tempLow = weatherResult.daily.temperature_2m_min[i] || 50;
    const rainfall = weatherResult.daily.precipitation_sum[i] || 0;
    const gdd = calculateGDD(tempHigh, tempLow);
    
    weatherData.push({
      date,
      tempHigh,
      tempLow,
      rainfall,
      gdd
    });
  }

  return weatherData;
};
