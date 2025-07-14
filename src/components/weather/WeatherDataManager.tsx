
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Loader2, CloudSun, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WeatherDataManagerProps {
  vineyardId: string;
  latitude?: number;
  longitude?: number;
  onDataUpdated?: () => void;
}

export const WeatherDataManager: React.FC<WeatherDataManagerProps> = ({
  vineyardId,
  latitude,
  longitude,
  onDataUpdated
}) => {
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, gddData, fetchWeatherData, loadGDDData } = useWeatherData();
  const { toast } = useToast();

  const handleFetchWeatherData = async () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please set the vineyard location (latitude/longitude) first.",
        variant: "destructive"
      });
      return;
    }

    setError(null);
    
    try {
      console.log('Fetching weather data with params:', { vineyardId, latitude, longitude, startDate, endDate });
      const data = await fetchWeatherData(vineyardId, latitude, longitude, startDate, endDate);
      console.log('Weather data fetched successfully:', data.length, 'days');
      onDataUpdated?.();
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  };

  const handleLoadExistingData = async () => {
    setError(null);
    
    try {
      const data = await loadGDDData(vineyardId, startDate);
      console.log('Existing GDD data loaded:', data.length, 'days');
      onDataUpdated?.();
    } catch (error) {
      console.error('Failed to load existing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load existing data');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="h-5 w-5" />
          Weather Data Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleFetchWeatherData}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CloudSun className="h-4 w-4 mr-2" />
            )}
            Fetch Weather Data
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleLoadExistingData}
            disabled={isLoading}
          >
            Load Existing Data
          </Button>
        </div>

        {latitude && longitude && (
          <div className="text-sm text-muted-foreground">
            <p>Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
            <p className="text-xs mt-1">
              Using Open Meteo API for reliable weather data
            </p>
          </div>
        )}
        
        {gddData.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p>Current GDD data: {gddData.length} days</p>
            <p>Latest cumulative GDD: {gddData[gddData.length - 1]?.cumulativeGDD.toFixed(1) || 0}°F</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
