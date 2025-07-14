
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { fetchWeatherData } from '@/lib/weather';
import { EnhancedGDDChart } from '@/components/dashboard/EnhancedGDDChart';
import { Season, PhaseEvent } from '@/types';

interface WeatherData {
  date: string;
  temp_high: number;
  temp_low: number;
  rainfall: number;
  gdd: number;
}

interface WeatherMetrics {
  totalGDD: number;
  totalRainfall: number;
  avgHighTemp: number;
  avgLowTemp: number;
}

export const WeatherDashboard: React.FC = () => {
  const [location, setLocation] = useState('Napa Valley CA');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [metrics, setMetrics] = useState<WeatherMetrics>({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(
        location,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      
      // Transform WeatherDataPoint to WeatherData format
      const transformedData: WeatherData[] = data.map(point => ({
        date: point.date,
        temp_high: point.tempHigh,
        temp_low: point.tempLow,
        rainfall: point.rainfall,
        gdd: point.gdd
      }));
      
      setWeatherData(transformedData);
      
      // Calculate metrics using the transformed data
      const totalGDD = transformedData.reduce((sum, day) => sum + day.gdd, 0);
      const totalRainfall = transformedData.reduce((sum, day) => sum + day.rainfall, 0);
      const avgHighTemp = transformedData.length > 0 ? transformedData.reduce((sum, day) => sum + day.temp_high, 0) / transformedData.length : 0;
      const avgLowTemp = transformedData.length > 0 ? transformedData.reduce((sum, day) => sum + day.temp_low, 0) / transformedData.length : 0;
      
      setMetrics({
        totalGDD: Math.round(totalGDD),
        totalRainfall: Math.round(totalRainfall * 10) / 10,
        avgHighTemp: Math.round(avgHighTemp * 10) / 10,
        avgLowTemp: Math.round(avgLowTemp * 10) / 10
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather Data Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                'Fetch Data'
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Enhanced GDD Chart with Phenology Events */}
      {weatherData.length > 0 && (
        <EnhancedGDDChart
          currentSeason={currentSeasonData}
          pastSeason={pastSeasonData}
          onPhaseClick={handlePhaseClick}
        />
      )}
    </div>
  );
};
