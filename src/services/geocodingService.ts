
import { supabase } from '@/integrations/supabase/client';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { address }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to geocode address');
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for this address');
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check the address and try again.');
  }
};
