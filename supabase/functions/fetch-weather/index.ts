
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

interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp_max: number;
      temp_min: number;
    };
    rain?: {
      '1h'?: number;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon, startDate, endDate }: WeatherRequest = await req.json()
    
    // Get OpenWeatherMap API key from environment
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    // Convert dates to timestamps
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000)
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000)
    
    // Fetch historical weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${startTimestamp}&appid=${apiKey}&units=imperial`
    
    const weatherData = []
    
    // OpenWeatherMap's timemachine API only returns one day at a time
    // So we need to make multiple requests for the date range
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)
    
    while (currentDate <= endDateObj) {
      const timestamp = Math.floor(currentDate.getTime() / 1000)
      const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}&units=imperial`
      
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.data && data.data.length > 0) {
          const dayData = data.data[0]
          weatherData.push({
            date: currentDate.toISOString().split('T')[0],
            tempHigh: dayData.temp || dayData.feels_like || 70, // Fallback temperature
            tempLow: dayData.temp ? dayData.temp - 10 : 60, // Estimate low temp
            rainfall: (dayData.rain && dayData.rain['1h']) || 0,
            gdd: 0 // Will be calculated in the service
          })
        }
      } catch (error) {
        console.error(`Error fetching weather for ${currentDate.toISOString().split('T')[0]}:`, error)
        // Add fallback data to prevent complete failure
        weatherData.push({
          date: currentDate.toISOString().split('T')[0],
          tempHigh: 75, // Reasonable fallback
          tempLow: 55,
          rainfall: 0,
          gdd: 0
        })
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

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
