
import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainfall: number;
  gdd: number;
}

export interface CumulativeGDDData {
  date: string;
  dailyGDD: number;
  cumulativeGDD: number;
}

/**
 * Calculate Growing Degree Days using the standard formula
 * GDD = ((Max Temp + Min Temp) / 2) - Base Temp
 * If result is negative, GDD = 0
 */
export const calculateGDD = (tempHigh: number, tempLow: number, baseTemp: number = 50): number => {
  const avgTemp = (tempHigh + tempLow) / 2;
  const gdd = avgTemp - baseTemp;
  return Math.max(0, gdd);
};

/**
 * Fetch weather data from OpenWeatherMap API
 */
export const fetchWeatherData = async (
  lat: number, 
  lon: number, 
  startDate: string, 
  endDate: string
): Promise<WeatherData[]> => {
  try {
    // Get the API key from Supabase secrets
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Call our edge function to fetch weather data
    const { data, error } = await supabase.functions.invoke('fetch-weather', {
      body: { lat, lon, startDate, endDate }
    });

    if (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }

    return data.weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Save weather data to the database
 */
export const saveWeatherData = async (vineyardId: string, weatherData: WeatherData[]): Promise<void> => {
  try {
    const dataToInsert = weatherData.map(data => ({
      vineyard_id: vineyardId,
      date: data.date,
      temp_high: data.tempHigh,
      temp_low: data.tempLow,
      rainfall: data.rainfall,
      gdd: data.gdd
    }));

    const { error } = await supabase
      .from('weather_data')
      .upsert(dataToInsert, { 
        onConflict: 'vineyard_id,date',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }

    console.log(`Saved ${weatherData.length} weather records for vineyard ${vineyardId}`);
  } catch (error) {
    console.error('Error saving weather data:', error);
    throw error;
  }
};

/**
 * Get cumulative GDD data for a vineyard
 */
export const getCumulativeGDD = async (
  vineyardId: string, 
  startDate: string
): Promise<CumulativeGDDData[]> => {
  try {
    const { data, error } = await supabase
      .from('weather_data')
      .select('date, gdd')
      .eq('vineyard_id', vineyardId)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching GDD data:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Calculate cumulative GDD
    let cumulativeGDD = 0;
    const cumulativeData: CumulativeGDDData[] = data.map(record => {
      cumulativeGDD += record.gdd;
      return {
        date: record.date,
        dailyGDD: record.gdd,
        cumulativeGDD: cumulativeGDD
      };
    });

    return cumulativeData;
  } catch (error) {
    console.error('Error getting cumulative GDD:', error);
    throw error;
  }
};

/**
 * Fetch and save weather data for a vineyard
 */
export const updateVineyardWeatherData = async (
  vineyardId: string,
  lat: number,
  lon: number,
  startDate: string,
  endDate?: string
): Promise<CumulativeGDDData[]> => {
  try {
    const endDateToUse = endDate || new Date().toISOString().split('T')[0];
    
    // Fetch weather data from API
    const weatherData = await fetchWeatherData(lat, lon, startDate, endDateToUse);
    
    // Calculate GDD for each day
    const weatherWithGDD = weatherData.map(data => ({
      ...data,
      gdd: calculateGDD(data.tempHigh, data.tempLow)
    }));
    
    // Save to database
    await saveWeatherData(vineyardId, weatherWithGDD);
    
    // Return cumulative GDD data
    return getCumulativeGDD(vineyardId, startDate);
  } catch (error) {
    console.error('Error updating vineyard weather data:', error);
    throw error;
  }
};
