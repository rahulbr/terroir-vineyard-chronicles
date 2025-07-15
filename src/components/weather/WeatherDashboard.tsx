
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
import { fetchWeatherData, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

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
  latitude: number;
  longitude: number;
}

// Default vineyard sites with coordinates
const defaultVineyardSites: VineyardSite[] = [
  {
    id: 'clos-de-la-tech',
    name: 'Clos de la Tech',
    address: '1000 Fern Hollow Road, La Honda, CA',
    location: 'La Honda, CA',
    latitude: 37.3387,
    longitude: -122.0583
  },
  {
    id: 'thomas-fogarty',
    name: 'Thomas Fogarty Winery',
    address: '19501 Skyline Blvd, Woodside, CA 94062',
    location: 'Woodside, CA',
    latitude: 37.4419,
    longitude: -122.2419
  }
];

interface WeatherDashboardProps {
  onActivitiesChange?: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ onActivitiesChange }) => {
  const [vineyardSites, setVineyardSites] = useState<VineyardSite[]>(defaultVineyardSites);
  const [selectedVineyard, setSelectedVineyard] = useState<string>(vineyardSites[0].id);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [showNewVineyardForm, setShowNewVineyardForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<WeatherMetrics>({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const { toast } = useToast();

  const currentVineyardSite = vineyardSites.find(site => site.id === selectedVineyard) || vineyardSites[0];

  const handleNewVineyard = async (newVineyard: { name: string; address: string; latitude: number; longitude: number }) => {
    const vineyardSite: VineyardSite = {
      id: `vineyard-${Date.now()}`,
      name: newVineyard.name,
      address: newVineyard.address,
      location: newVineyard.address.split(',').slice(-2).join(',').trim(),
      latitude: newVineyard.latitude,
      longitude: newVineyard.longitude
    };
    
    setVineyardSites(prev => [...prev, vineyardSite]);
    setSelectedVineyard(vineyardSite.id);
    setShowNewVineyardForm(false);
    
    // Fetch real weather data for the new vineyard
    await fetchWeatherDataForVineyard(vineyardSite);
  };

  const handleVineyardChange = async (vineyardId: string) => {
    if (vineyardId === 'new-vineyard') {
      setShowNewVineyardForm(true);
      return;
    }
    
    setSelectedVineyard(vineyardId);
    const vineyard = vineyardSites.find(site => site.id === vineyardId);
    if (vineyard) {
      await fetchWeatherDataForVineyard(vineyard);
    }
  };

  const fetchWeatherDataForVineyard = async (vineyard: VineyardSite) => {
    setLoading(true);
    try {
      console.log('Fetching weather data for:', vineyard.name, vineyard.latitude, vineyard.longitude);
      
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      const data = await fetchWeatherData(
        vineyard.latitude,
        vineyard.longitude,
        startDateStr,
        endDateStr
      );
      
      console.log('Weather data received:', data.length, 'days');
      setWeatherData(data);
      calculateMetrics(data);
      
      toast({
        title: "Weather Data Loaded",
        description: `Fetched ${data.length} days of weather data for ${vineyard.name}`
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
    const vineyard = vineyardSites.find(site => site.id === selectedVineyard);
    if (vineyard) {
      await fetchWeatherDataForVineyard(vineyard);
    }
  };

  useEffect(() => {
    // Load initial data for the first vineyard
    const initialVineyard = vineyardSites.find(site => site.id === selectedVineyard);
    if (initialVineyard) {
      fetchWeatherDataForVineyard(initialVineyard);
    }
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
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {currentVineyardSite.latitude.toFixed(4)}, {currentVineyardSite.longitude.toFixed(4)}
            </p>
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

      {/* Enhanced GDD Chart with Real Data */}
      {weatherData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Growing Degree Days - Real Weather Data</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {weatherData.length} days of actual weather data from {format(startDate, 'MMM d')} to {format(endDate, 'MMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent>
            <EnhancedGDDChart
              currentSeason={currentSeasonData}
              pastSeason={pastSeasonData}
              onPhaseClick={handlePhaseClick}
              onActivitiesChange={onActivitiesChange}
            />
          </CardContent>
        </Card>
      )}

      {weatherData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No weather data available. Please select a vineyard and refresh to load data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
