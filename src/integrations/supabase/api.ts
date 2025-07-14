import { supabase } from './client';
import { 
  updateVineyardWeatherData, 
  getCumulativeGDD, 
  CumulativeGDDData 
} from '@/services/weatherService';

// Vineyard functions
export const getUserVineyards = async () => {
  const { data, error } = await supabase
    .from('vineyards')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching vineyards:', error);
    throw error;
  }
  
  return data || [];
};

export const createVineyard = async (vineyard: {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}) => {
  const { data, error } = await supabase
    .from('vineyards')
    .insert([vineyard])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating vineyard:', error);
    throw error;
  }
  
  return data;
};

// Observation functions
export const saveObservation = async (observation: {
  vineyard_id: string;
  content: string;
  observation_type?: string;
  location_notes?: string;
  photos?: string[];
}) => {
  const { data, error } = await supabase
    .from('observations')
    .insert([{
      ...observation,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error saving observation:', error);
    throw error;
  }
  
  return data;
};

// Task functions
export const getTasks = async (vineyardId?: string) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  return data || [];
};

export const createTask = async (task: {
  vineyard_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
}) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  return data;
};

// Phenology Events functions
export const getPhenologyEvents = async (vineyardId?: string) => {
  let query = supabase
    .from('phenology_events')
    .select('*')
    .order('event_date', { ascending: true });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching phenology events:', error);
    throw error;
  }
  
  return data || [];
};

export const createPhenologyEvent = async (event: {
  vineyard_id: string;
  event_type: string;
  event_date: string;
  end_date?: string;
  notes?: string;
  harvest_block?: string;
}) => {
  const { data, error } = await supabase
    .from('phenology_events')
    .insert([event])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating phenology event:', error);
    throw error;
  }
  
  return data;
};

// Weather data functions
export const fetchVineyardWeatherData = async (
  vineyardId: string,
  lat: number,
  lon: number,
  startDate: string,
  endDate?: string
): Promise<CumulativeGDDData[]> => {
  return updateVineyardWeatherData(vineyardId, lat, lon, startDate, endDate);
};

export const getVineyardGDDData = async (
  vineyardId: string,
  startDate: string
): Promise<CumulativeGDDData[]> => {
  return getCumulativeGDD(vineyardId, startDate);
};

export const getWeatherDataForChart = async (vineyardId: string, startDate: string) => {
  try {
    const { getGDDDataForChart } = await import('@/services/weatherService');
    return getGDDDataForChart(vineyardId, startDate);
  } catch (error) {
    console.error('Error getting weather data for chart:', error);
    throw error;
  }
};
