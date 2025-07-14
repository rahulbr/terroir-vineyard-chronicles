
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
  // Check if we need historical data vs forecast data
  const today = new Date().toISOString().split('T')[0]
  const isHistorical = endDate < today
  const isFuture = startDate > today
  
  let url: string
  
  if (isHistorical) {
    // Use historical API for past dates
    url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`
  } else if (isFuture) {
    // Use forecast API for future dates
    url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&start_date=${startDate}&end_date=${endDate}`
  } else {
    // Mixed historical and forecast - combine both
    const historicalEndDate = today
    const forecastStartDate = new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
    
    const historicalData = startDate < today ? 
      await fetchOpenMeteoData(lat, lon, startDate, historicalEndDate) : []
    const forecastData = endDate >= forecastStartDate ? 
      await fetchOpenMeteoData(lat, lon, forecastStartDate, endDate) : []
    
    return [...historicalData, ...forecastData]
  }
  
  console.log('Fetching from Open Meteo:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Open Meteo API error: ${response.status} - ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (!data.daily) {
    throw new Error('No daily weather data received from Open Meteo API')
  }
  
  const weatherData: WeatherDataPoint[] = []
  
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
  
  console.log(`Successfully fetched ${weatherData.length} weather data points`)
  return weatherData
}
