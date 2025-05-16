
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherData } from '@/types';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { Sun, CloudSun } from 'lucide-react';

interface WeatherCardProps {
  weatherData: WeatherData[];
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData }) => {
  // Get weather for today and next few days
  const todayDate = new Date().toISOString().split('T')[0];
  const todayWeather = weatherData.find(data => data.date === todayDate);
  
  const getForecastDays = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 1; i <= 3; i++) {
      const date = addDays(today, i);
      const formattedDate = date.toISOString().split('T')[0];
      const weatherForDay = weatherData.find(data => data.date === formattedDate);
      
      if (weatherForDay) {
        dates.push(weatherForDay);
      }
    }
    
    return dates;
  };
  
  const forecast = getForecastDays();

  if (!todayWeather) {
    return <div>Loading weather data...</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-vineyard-gold" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold">{Math.round(todayWeather.tempHigh)}°C</h3>
            <p className="text-sm text-muted-foreground">High today</p>
            <p className="text-lg mt-2">{Math.round(todayWeather.tempLow)}°C Low</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm">GDD Today:</span>
              <span className="text-sm font-medium">
                {Math.round(((todayWeather.tempHigh + todayWeather.tempLow) / 2) - 10)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-sm">Season Total:</span>
              <span className="text-sm font-medium">{todayWeather.gdd}</span>
            </div>
            <div className="mt-3">
              {todayWeather.rainfall > 0 ? (
                <p className="text-vineyard-sky">
                  {todayWeather.rainfall.toFixed(1)}mm rain
                </p>
              ) : (
                <p>No precipitation</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          {forecast.map((day, index) => (
            <div key={day.date} className="text-center p-2 bg-muted/50 rounded-md">
              <p className="text-xs font-medium">
                {isTomorrow(parseISO(day.date)) ? 'Tomorrow' : format(parseISO(day.date), 'EEE')}
              </p>
              <div className="my-1">
                <CloudSun className="h-4 w-4 mx-auto text-vineyard-sky" />
              </div>
              <p className="text-sm">
                {Math.round(day.tempHigh)}° / {Math.round(day.tempLow)}°
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-sm">
          <p>
            <span className="font-medium">Alert: </span>
            <span className="text-vineyard-burgundy">
              {todayWeather.tempHigh > 30 
                ? 'Heat stress risk' 
                : todayWeather.rainfall > 5 
                  ? 'Heavy rainfall' 
                  : 'No weather alerts'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
