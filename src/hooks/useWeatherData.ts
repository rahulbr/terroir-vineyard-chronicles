
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  updateVineyardWeatherData, 
  getCumulativeGDD, 
  CumulativeGDDData 
} from '@/services/weatherService';

export const useWeatherData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [gddData, setGddData] = useState<CumulativeGDDData[]>([]);
  const { toast } = useToast();

  const fetchWeatherData = useCallback(async (
    vineyardId: string,
    lat: number,
    lon: number,
    startDate: string,
    endDate?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await updateVineyardWeatherData(vineyardId, lat, lon, startDate, endDate);
      setGddData(data);
      
      toast({
        title: "Weather Data Updated",
        description: `Fetched weather data and calculated GDD for ${data.length} days`
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Weather Data Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadGDDData = useCallback(async (vineyardId: string, startDate: string) => {
    setIsLoading(true);
    try {
      const data = await getCumulativeGDD(vineyardId, startDate);
      setGddData(data);
      return data;
    } catch (error) {
      console.error('Error loading GDD data:', error);
      toast({
        title: "GDD Data Error",
        description: "Failed to load GDD data from database",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    gddData,
    fetchWeatherData,
    loadGDDData
  };
};
