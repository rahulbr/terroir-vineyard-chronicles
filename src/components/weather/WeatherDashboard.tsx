
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { EnhancedGDDChart } from '@/components/dashboard/EnhancedGDDChart';
import { Season, PhaseEvent } from '@/types';
import { fetchWeatherData, WeatherData } from '@/services/weatherService';
import { getVineyardSettings } from '@/integrations/supabase/api';
import { useToast } from '@/hooks/use-toast';

interface WeatherMetrics {
  totalGDD: number;
  totalRainfall: number;
  avgHighTemp: number;
  avgLowTemp: number;
}

interface VineyardSettings {
  selectedVineyard: string;
  selectedVineyardName: string;
  seasonStartDate: string;
  seasonEndDate: string;
  latitude: number;
  longitude: number;
}

export const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<WeatherMetrics>({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const [vineyardSettings, setVineyardSettings] = useState<VineyardSettings | null>(null);
  const { toast } = useToast();

  const loadVineyardSettings = async () => {
    try {
      const settings = await getVineyardSettings();
      console.log('Loaded vineyard settings:', settings);
      
      // Type guard to ensure we have valid vineyard settings
      if (settings && 
          settings.selectedVineyard && 
          settings.selectedVineyardName && 
          settings.seasonStartDate && 
          settings.seasonEndDate &&
          typeof settings.latitude === 'number' &&
          typeof settings.longitude === 'number') {
        setVineyardSettings(settings);
        await fetchWeatherDataForSettings(settings);
      }
    } catch (error) {
      console.error('Error loading vineyard settings:', error);
    }
  };

  const fetchWeatherDataForSettings = async (settings: VineyardSettings) => {
    setLoading(true);
    try {
      console.log('Fetching weather data for saved settings:', settings.selectedVineyardName, settings.latitude, settings.longitude);
      
      const data = await fetchWeatherData(
        settings.latitude,
        settings.longitude,
        settings.seasonStartDate,
        settings.seasonEndDate
      );
      
      console.log('Weather data received:', data.length, 'days');
      setWeatherData(data);
      calculateMetrics(data);
      
      toast({
        title: "Weather Data Loaded",
        description: `Fetched ${data.length} days of weather data for ${settings.selectedVineyardName}`
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Weather Data Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive"
      });
      // Clear weather data on error
      setWeatherData([]);
      setMetrics({ totalGDD: 0, totalRainfall: 0, avgHighTemp: 0, avgLowTemp: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: WeatherData[]) => {
    if (data.length === 0) {
      setMetrics({ totalGDD: 0, totalRainfall: 0, avgHighTemp: 0, avgLowTemp: 0 });
      return;
    }

    const totalGDD = data.reduce((sum, day) => sum + day.gdd, 0);
    const totalRainfall = data.reduce((sum, day) => sum + day.rainfall, 0);
    const avgHighTemp = data.reduce((sum, day) => sum + day.tempHigh, 0) / data.length;
    const avgLowTemp = data.reduce((sum, day) => sum + day.tempLow, 0) / data.length;
    
    setMetrics({
      totalGDD: Math.round(totalGDD),
      totalRainfall: Math.round(totalRainfall * 10) / 10,
      avgHighTemp: Math.round(avgHighTemp * 10) / 10,
      avgLowTemp: Math.round(avgLowTemp * 10) / 10
    });
  };

  const fetchData = async () => {
    if (vineyardSettings) {
      await fetchWeatherDataForSettings(vineyardSettings);
    }
  };

  useEffect(() => {
    loadVineyardSettings();
  }, []);

  // Convert weather data to Season format for the chart
  const currentSeasonData: Season = {
    year: new Date().getFullYear().toString(),
    gddData: weatherData.map((day, index) => ({
      date: day.date,
      value: weatherData.slice(0, index + 1).reduce((sum, d) => sum + d.gdd, 0) // Cumulative GDD
    })),
    events: [] // No events initially
  };

  const pastSeasonData: Season = {
    year: (new Date().getFullYear() - 1).toString(),
    gddData: [],
    events: []
  };

  const handlePhaseClick = (phase: PhaseEvent) => {
    console.log('Phase clicked:', phase);
  };


  return (
    <div className="space-y-6">
      {/* Header with Vineyard Name and Refresh Button */}
      {vineyardSettings && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{vineyardSettings.selectedVineyardName}</h2>
            <p className="text-muted-foreground">
              Showing data from {format(new Date(vineyardSettings.seasonStartDate), 'MMM d')} to {format(new Date(vineyardSettings.seasonEndDate), 'MMM d, yyyy')}
            </p>
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="bg-vineyard-burgundy hover:bg-vineyard-burgundy/90"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh Data'
            )}
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total GDD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vineyard-burgundy">
              {metrics.totalGDD}°F
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Growing Degree Days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rainfall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalRainfall}" 
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Precipitation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg High Temp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.avgHighTemp}°F
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily Maximum
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Low Temp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {metrics.avgLowTemp}°F
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily Minimum
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced GDD Chart with Real Data */}
      {weatherData.length > 0 && vineyardSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Growing Degree Days</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {weatherData.length} days of actual weather data
            </p>
          </CardHeader>
          <CardContent>
            <EnhancedGDDChart
              currentSeason={currentSeasonData}
              pastSeason={pastSeasonData}
              onPhaseClick={handlePhaseClick}
            />
          </CardContent>
        </Card>
      )}

      {weatherData.length === 0 && !loading && vineyardSettings && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No weather data available. Please configure your vineyard settings in the Vineyard tab and refresh to load data.</p>
          </CardContent>
        </Card>
      )}

      {!vineyardSettings && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please configure your vineyard settings in the Vineyard tab to view weather data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
