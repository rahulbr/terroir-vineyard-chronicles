
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Loader2, CloudSun } from 'lucide-react';

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
  const { isLoading, fetchWeatherData, loadGDDData } = useWeatherData();
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

    try {
      await fetchWeatherData(vineyardId, latitude, longitude, startDate, endDate);
      onDataUpdated?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleLoadExistingData = async () => {
    try {
      await loadGDDData(vineyardId, startDate);
      onDataUpdated?.();
    } catch (error) {
      // Error handling is done in the hook
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
          <p className="text-sm text-muted-foreground">
            Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
