
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
 * Fetch weather data from our edge function
 */
export const fetchWeatherData = async (
  lat: number, 
  lon: number, 
  startDate: string, 
  endDate: string
): Promise<WeatherData[]> => {
  try {
    console.log('Fetching weather data:', { lat, lon, startDate, endDate });
    
    // Call our edge function to fetch weather data
    const { data, error } = await supabase.functions.invoke('fetch-weather', {
      body: { lat, lon, startDate, endDate }
    });

    if (error) {
      console.error('Weather API error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }

    if (!data || !data.weatherData) {
      throw new Error('No weather data received from API');
    }

    console.log('Weather data received:', data.weatherData.length, 'days');
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

    console.log('Saving weather data to database:', dataToInsert.length, 'records');

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

    console.log(`Successfully saved ${weatherData.length} weather records for vineyard ${vineyardId}`);
  } catch (error) {
    console.error('Error saving weather data:', error);
    throw error;
  }
};

/**
 * Get cumulative GDD data for a vineyard - this matches the format expected by the GDD chart
 */
export const getCumulativeGDD = async (
  vineyardId: string, 
  startDate: string
): Promise<CumulativeGDDData[]> => {
  try {
    console.log('Fetching GDD data for vineyard:', vineyardId, 'from:', startDate);
    
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
      console.log('No GDD data found for vineyard:', vineyardId);
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

    console.log('Calculated cumulative GDD for', cumulativeData.length, 'days');
    return cumulativeData;
  } catch (error) {
    console.error('Error getting cumulative GDD:', error);
    throw error;
  }
};

/**
 * Get GDD data formatted for the chart component
 */
export const getGDDDataForChart = async (
  vineyardId: string, 
  startDate: string
): Promise<{ date: string; value: number }[]> => {
  try {
    const cumulativeData = await getCumulativeGDD(vineyardId, startDate);
    
    // Transform data to match the format expected by the GDD chart
    return cumulativeData.map(item => ({
      date: item.date,
      value: item.cumulativeGDD
    }));
  } catch (error) {
    console.error('Error getting GDD data for chart:', error);
    throw error;
  }
};

/**
 * Fetch and save weather data for a vineyard, then return cumulative GDD data
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
    
    console.log('Updating vineyard weather data:', { vineyardId, lat, lon, startDate, endDateToUse });
    
    // Fetch weather data from API
    const weatherData = await fetchWeatherData(lat, lon, startDate, endDateToUse);
    
    // GDD is already calculated in the edge function, but let's ensure it's correct
    const weatherWithGDD = weatherData.map(data => ({
      ...data,
      gdd: calculateGDD(data.tempHigh, data.tempLow)
    }));
    
    // Save to database
    await saveWeatherData(vineyardId, weatherWithGDD);
    
    // Return cumulative GDD data for the chart
    return getCumulativeGDD(vineyardId, startDate);
  } catch (error) {
    console.error('Error updating vineyard weather data:', error);
    throw error;
  }
};
