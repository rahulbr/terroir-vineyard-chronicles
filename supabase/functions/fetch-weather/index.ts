
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherRequest {
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
}

interface WeatherDataPoint {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainfall: number;
  gdd: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon, startDate, endDate }: WeatherRequest = await req.json()
    
    console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}, from ${startDate} to ${endDate}`)
    
    // Use Open Meteo API (free and reliable)
    const weatherData = await fetchOpenMeteoData(lat, lon, startDate, endDate)
    
    return new Response(
      JSON.stringify({ weatherData }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in fetch-weather function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function fetchOpenMeteoData(lat: number, lon: number, startDate: string, endDate: string): Promise<WeatherDataPoint[]> {
  const today = new Date().toISOString().split('T')[0]
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Split date range into historical and forecast parts
  const todayDate = new Date(today)
  const allData: WeatherDataPoint[] = []
  
  // Handle historical data (past dates)
  if (start < todayDate) {
    const historicalEndDate = end < todayDate ? endDate : today
    console.log(`Fetching historical data from ${startDate} to ${historicalEndDate}`)
    
    const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${historicalEndDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`
    
    const historicalResponse = await fetch(historicalUrl)
    if (!historicalResponse.ok) {
      throw new Error(`Historical weather API error: ${historicalResponse.status} - ${historicalResponse.statusText}`)
    }
    
    const historicalData = await historicalResponse.json()
    if (historicalData.daily) {
      const processedHistorical = processWeatherData(historicalData)
      allData.push(...processedHistorical)
    }
  }
  
  // Handle forecast data (future dates)
  if (end > todayDate) {
    const forecastStartDate = start > todayDate ? startDate : getNextDay(today)
    console.log(`Fetching forecast data from ${forecastStartDate} to ${endDate}`)
    
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&start_date=${forecastStartDate}&end_date=${endDate}`
    
    const forecastResponse = await fetch(forecastUrl)
    if (!forecastResponse.ok) {
      throw new Error(`Forecast weather API error: ${forecastResponse.status} - ${forecastResponse.statusText}`)
    }
    
    const forecastData = await forecastResponse.json()
    if (forecastData.daily) {
      const processedForecast = processWeatherData(forecastData)
      allData.push(...processedForecast)
    }
  }
  
  // Sort by date to ensure proper order
  allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  console.log(`Successfully fetched ${allData.length} weather data points`)
  return allData
}

function processWeatherData(data: any): WeatherDataPoint[] {
  const weatherData: WeatherDataPoint[] = []
  
  if (!data.daily || !data.daily.time) {
    return weatherData
  }
  
  for (let i = 0; i < data.daily.time.length; i++) {
    const date = data.daily.time[i]
    const tempHigh = data.daily.temperature_2m_max[i] || 70 // Fallback temp
    const tempLow = data.daily.temperature_2m_min[i] || 50
    const rainfall = data.daily.precipitation_sum[i] || 0
    
    // Calculate GDD using base temperature of 50°F
    const avgTemp = (tempHigh + tempLow) / 2
    const gdd = Math.max(0, avgTemp - 50)
    
    weatherData.push({
      date,
      tempHigh,
      tempLow,
      rainfall,
      gdd
    })
  }
  
  return weatherData
}

function getNextDay(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}
