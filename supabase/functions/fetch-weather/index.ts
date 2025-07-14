
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
    
    // Try Open Meteo API first (free and reliable)
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&start_date=${startDate}&end_date=${endDate}`
  
  console.log('Fetching from Open Meteo:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Open Meteo API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.daily) {
    throw new Error('No daily weather data received')
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
  
  console.log(`Fetched ${weatherData.length} weather data points`)
  return weatherData
}

async function fetchOpenWeatherMapFallback(lat: number, lon: number, startDate: string, endDate: string): Promise<WeatherDataPoint[]> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key not configured')
  }

  // For current/future dates, use forecast API
  const currentUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  
  try {
    const response = await fetch(currentUrl)
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }
    
    const data = await response.json()
    const weatherData: WeatherDataPoint[] = []
    
    // Group forecast data by date
    const dailyData: { [date: string]: { temps: number[], rain: number } } = {}
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { temps: [], rain: 0 }
      }
      dailyData[date].temps.push(item.main.temp)
      if (item.rain && item.rain['3h']) {
        dailyData[date].rain += item.rain['3h']
      }
    })
    
    // Convert to daily weather data
    Object.entries(dailyData).forEach(([date, dayData]) => {
      const tempHigh = Math.max(...dayData.temps)
      const tempLow = Math.min(...dayData.temps)
      const rainfall = dayData.rain
      const avgTemp = (tempHigh + tempLow) / 2
      const gdd = Math.max(0, avgTemp - 50)
      
      weatherData.push({
        date,
        tempHigh,
        tempLow,
        rainfall,
        gdd
      })
    })
    
    return weatherData.slice(0, 7) // Limit to 7 days for forecast
  } catch (error) {
    console.error('OpenWeatherMap fallback failed:', error)
    throw error
  }
}
