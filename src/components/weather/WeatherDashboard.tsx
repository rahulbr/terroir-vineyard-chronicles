
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
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

interface VineyardSite {
  id: string;
  name: string;
  address: string;
  location: string;
  weatherData: WeatherData[];
}

// Mock weather data for different vineyard sites
const vineyardSites: VineyardSite[] = [
  {
    id: 'clos-de-la-tech',
    name: 'Clos de la Tech',
    address: '1000 Fern Hollow Road, La Honda, CA',
    location: 'La Honda, CA',
    weatherData: generateMockWeatherData('cool-climate')
  },
  {
    id: 'thomas-fogarty',
    name: 'Thomas Fogarty Winery',
    address: '19501 Skyline Blvd, Woodside, CA 94062',
    location: 'Woodside, CA',
    weatherData: generateMockWeatherData('warm-climate')
  }
];

function generateMockWeatherData(climateType: 'cool-climate' | 'warm-climate'): WeatherData[] {
  const data: WeatherData[] = [];
  const startDate = subDays(new Date(), 90);
  const baseTemp = climateType === 'warm-climate' ? 65 : 58;
  const tempVariation = climateType === 'warm-climate' ? 15 : 12;
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const seasonalVariation = Math.sin((i / 90) * Math.PI) * 10;
    const dailyVariation = Math.random() * 10 - 5;
    
    const tempHigh = baseTemp + tempVariation + seasonalVariation + dailyVariation;
    const tempLow = tempHigh - (12 + Math.random() * 8);
    const avgTemp = (tempHigh + tempLow) / 2;
    const gdd = Math.max(0, avgTemp - 50);
    
    const rainfall = Math.random() < 0.2 ? Math.random() * (climateType === 'cool-climate' ? 1.5 : 0.8) : 0;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      temp_high: Math.round(tempHigh * 10) / 10,
      temp_low: Math.round(tempLow * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      gdd: Math.round(gdd * 10) / 10
    });
  }
  
  return data;
}

export const WeatherDashboard: React.FC = () => {
  const [selectedVineyard, setSelectedVineyard] = useState<string>(vineyardSites[0].id);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>(vineyardSites[0].weatherData);
  const [metrics, setMetrics] = useState<WeatherMetrics>({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const [loading, setLoading] = useState(false);

  const currentVineyardSite = vineyardSites.find(site => site.id === selectedVineyard) || vineyardSites[0];

  const handleVineyardChange = (vineyardId: string) => {
    setSelectedVineyard(vineyardId);
    const vineyard = vineyardSites.find(site => site.id === vineyardId);
    if (vineyard) {
      setWeatherData(vineyard.weatherData);
      calculateMetrics(vineyard.weatherData);
    }
  };

  const calculateMetrics = (data: WeatherData[]) => {
    const totalGDD = data.reduce((sum, day) => sum + day.gdd, 0);
    const totalRainfall = data.reduce((sum, day) => sum + day.rainfall, 0);
    const avgHighTemp = data.length > 0 ? data.reduce((sum, day) => sum + day.temp_high, 0) / data.length : 0;
    const avgLowTemp = data.length > 0 ? data.reduce((sum, day) => sum + day.temp_low, 0) / data.length : 0;
    
    setMetrics({
      totalGDD: Math.round(totalGDD),
      totalRainfall: Math.round(totalRainfall * 10) / 10,
      avgHighTemp: Math.round(avgHighTemp * 10) / 10,
      avgLowTemp: Math.round(avgLowTemp * 10) / 10
    });
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use the selected vineyard's data
    const vineyard = vineyardSites.find(site => site.id === selectedVineyard);
    if (vineyard) {
      setWeatherData(vineyard.weatherData);
      calculateMetrics(vineyard.weatherData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    calculateMetrics(weatherData);
  }, [weatherData]);

  useEffect(() => {
    handleVineyardChange(selectedVineyard);
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
      {/* Vineyard Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Vineyard Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="vineyard-select">Select Vineyard Site</Label>
              <Select value={selectedVineyard} onValueChange={handleVineyardChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vineyard site" />
                </SelectTrigger>
                <SelectContent>
                  {vineyardSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{site.name}</span>
                        <span className="text-sm text-muted-foreground">{site.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                'Refresh Data'
              )}
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">{currentVineyardSite.name}</p>
            <p className="text-sm text-muted-foreground">{currentVineyardSite.address}</p>
          </div>
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
