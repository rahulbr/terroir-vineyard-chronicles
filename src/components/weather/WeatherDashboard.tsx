import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, RefreshCw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { EnhancedGDDChart } from '@/components/dashboard/EnhancedGDDChart';
import { NewVineyardForm } from '@/components/vineyard/NewVineyardForm';
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
  latitude?: number;
  longitude?: number;
}

// Mock weather data generators for different climate types
function generateMockWeatherData(climateType: 'cool-climate' | 'warm-climate' | 'custom', latitude?: number): WeatherData[] {
  const data: WeatherData[] = [];
  const startDate = subDays(new Date(), 90);
  
  // Adjust base temperature based on climate type and latitude
  let baseTemp = 65;
  if (climateType === 'cool-climate') {
    baseTemp = 58;
  } else if (climateType === 'warm-climate') {
    baseTemp = 68;
  } else if (climateType === 'custom' && latitude) {
    // Approximate temperature based on latitude (very simplified)
    baseTemp = 85 - (latitude * 0.7);
  }
  
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
    
    const rainfallChance = climateType === 'cool-climate' ? 0.25 : 0.15;
    const rainfallAmount = climateType === 'cool-climate' ? 1.5 : 0.8;
    const rainfall = Math.random() < rainfallChance ? Math.random() * rainfallAmount : 0;
    
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

// Default vineyard sites
const defaultVineyardSites: VineyardSite[] = [
  {
    id: 'clos-de-la-tech',
    name: 'Clos de la Tech',
    address: '1000 Fern Hollow Road, La Honda, CA',
    location: 'La Honda, CA',
    weatherData: generateMockWeatherData('cool-climate'),
    latitude: 37.3387,
    longitude: -122.0583
  },
  {
    id: 'thomas-fogarty',
    name: 'Thomas Fogarty Winery',
    address: '19501 Skyline Blvd, Woodside, CA 94062',
    location: 'Woodside, CA',
    weatherData: generateMockWeatherData('warm-climate'),
    latitude: 37.4419,
    longitude: -122.2419
  }
];

export const WeatherDashboard: React.FC = () => {
  const [vineyardSites, setVineyardSites] = useState<VineyardSite[]>(defaultVineyardSites);
  const [selectedVineyard, setSelectedVineyard] = useState<string>(vineyardSites[0].id);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>(vineyardSites[0].weatherData);
  const [showNewVineyardForm, setShowNewVineyardForm] = useState(false);
  const [metrics, setMetrics] = useState<WeatherMetrics>({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const [loading, setLoading] = useState(false);

  const currentVineyardSite = vineyardSites.find(site => site.id === selectedVineyard) || vineyardSites[0];

  const handleNewVineyard = async (newVineyard: { name: string; address: string; latitude: number; longitude: number }) => {
    const vineyardSite: VineyardSite = {
      id: `vineyard-${Date.now()}`,
      name: newVineyard.name,
      address: newVineyard.address,
      location: newVineyard.address.split(',').slice(-2).join(',').trim(),
      weatherData: generateMockWeatherData('custom', newVineyard.latitude),
      latitude: newVineyard.latitude,
      longitude: newVineyard.longitude
    };
    
    setVineyardSites(prev => [...prev, vineyardSite]);
    setSelectedVineyard(vineyardSite.id);
    setShowNewVineyardForm(false);
    
    // Update weather data and metrics for the new vineyard
    setWeatherData(vineyardSite.weatherData);
    calculateMetrics(vineyardSite.weatherData);
  };

  const handleVineyardChange = (vineyardId: string) => {
    if (vineyardId === 'new-vineyard') {
      setShowNewVineyardForm(true);
      return;
    }
    
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
    
    // For custom vineyards, we would fetch real weather data here
    // For now, regenerate the mock data
    const vineyard = vineyardSites.find(site => site.id === selectedVineyard);
    if (vineyard) {
      let newWeatherData;
      if (vineyard.id === 'clos-de-la-tech') {
        newWeatherData = generateMockWeatherData('cool-climate');
      } else if (vineyard.id === 'thomas-fogarty') {
        newWeatherData = generateMockWeatherData('warm-climate');
      } else {
        newWeatherData = generateMockWeatherData('custom', vineyard.latitude);
      }
      
      // Update the vineyard's weather data
      setVineyardSites(prev => 
        prev.map(site => 
          site.id === selectedVineyard 
            ? { ...site, weatherData: newWeatherData }
            : site
        )
      );
      
      setWeatherData(newWeatherData);
      calculateMetrics(newWeatherData);
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

  if (showNewVineyardForm) {
    return (
      <div className="space-y-6">
        <NewVineyardForm
          onSave={handleNewVineyard}
          onCancel={() => setShowNewVineyardForm(false)}
        />
      </div>
    );
  }

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
                  <SelectItem value="new-vineyard">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Add New Vineyard</span>
                    </div>
                  </SelectItem>
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
            {currentVineyardSite.latitude && currentVineyardSite.longitude && (
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {currentVineyardSite.latitude.toFixed(4)}, {currentVineyardSite.longitude.toFixed(4)}
              </p>
            )}
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
