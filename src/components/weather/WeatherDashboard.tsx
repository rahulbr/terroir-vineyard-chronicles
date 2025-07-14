
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CloudSun, MapPin, Calendar, Thermometer, CloudRain, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainfall: number;
  gdd: number;
}

interface ChartData {
  date: string;
  cumulativeGDD: number;
  formattedDate: string;
}

export const WeatherDashboard: React.FC = () => {
  const [location, setLocation] = useState('Napa Valley, CA');
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalGDD: 0,
    totalRainfall: 0,
    avgHighTemp: 0,
    avgLowTemp: 0
  });
  const { toast } = useToast();

  const fetchWeatherData = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, get coordinates from location name (geocoding)
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=demo&limit=1`
      );
      
      let lat = 38.2975; // Default Napa Valley coordinates
      let lon = -122.4581;
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.results && geocodeData.results.length > 0) {
          lat = geocodeData.results[0].geometry.lat;
          lon = geocodeData.results[0].geometry.lng;
        }
      }

      // Fetch weather data from Open Meteo API
      const weatherResponse = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherResult = await weatherResponse.json();
      
      if (!weatherResult.daily) {
        throw new Error('No weather data available for this date range');
      }

      // Process weather data
      const processedData: WeatherData[] = [];
      for (let i = 0; i < weatherResult.daily.time.length; i++) {
        const date = weatherResult.daily.time[i];
        const tempHigh = weatherResult.daily.temperature_2m_max[i] || 70;
        const tempLow = weatherResult.daily.temperature_2m_min[i] || 50;
        const rainfall = weatherResult.daily.precipitation_sum[i] || 0;
        
        // Calculate GDD using base temperature of 50°F
        const avgTemp = (tempHigh + tempLow) / 2;
        const gdd = Math.max(0, avgTemp - 50);
        
        processedData.push({
          date,
          tempHigh,
          tempLow,
          rainfall,
          gdd
        });
      }

      setWeatherData(processedData);
      
      // Calculate metrics
      const totalGDD = processedData.reduce((sum, day) => sum + day.gdd, 0);
      const totalRainfall = processedData.reduce((sum, day) => sum + day.rainfall, 0);
      const avgHighTemp = processedData.reduce((sum, day) => sum + day.tempHigh, 0) / processedData.length;
      const avgLowTemp = processedData.reduce((sum, day) => sum + day.tempLow, 0) / processedData.length;

      setMetrics({
        totalGDD: Math.round(totalGDD),
        totalRainfall: Math.round(totalRainfall * 100) / 100,
        avgHighTemp: Math.round(avgHighTemp),
        avgLowTemp: Math.round(avgLowTemp)
      });

      // Calculate cumulative GDD for chart
      let cumulativeGDD = 0;
      const chartData: ChartData[] = processedData.map(day => {
        cumulativeGDD += day.gdd;
        return {
          date: day.date,
          cumulativeGDD,
          formattedDate: format(new Date(day.date), 'MMM d')
        };
      });

      setChartData(chartData);

      toast({
        title: "Weather Data Updated",
        description: `Loaded ${processedData.length} days of weather data`
      });

    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Location and Date Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Vineyard Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (e.g., Napa Valley, CA)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range Settings
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
            <Button 
              onClick={fetchWeatherData}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Update Weather Data'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total GDD</p>
                <p className="text-2xl font-bold">{metrics.totalGDD}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-vineyard-burgundy" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rainfall</p>
                <p className="text-2xl font-bold">{metrics.totalRainfall}"</p>
              </div>
              <CloudRain className="h-8 w-8 text-vineyard-sky" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg High Temp</p>
                <p className="text-2xl font-bold">{metrics.avgHighTemp}°F</p>
              </div>
              <Thermometer className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Low Temp</p>
                <p className="text-2xl font-bold">{metrics.avgLowTemp}°F</p>
              </div>
              <Thermometer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Curve Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun className="h-5 w-5" />
            Growth Curve - Cumulative Growing Degree Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis
                  label={{
                    value: 'Cumulative GDD (°F)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [`${Math.round(value)} GDD`, 'Cumulative GDD']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeGDD"
                  stroke="#7D2933"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
