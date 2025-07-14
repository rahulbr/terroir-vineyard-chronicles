import { supabase } from './client';
import { 
  updateVineyardWeatherData, 
  getCumulativeGDD, 
  CumulativeGDDData 
} from '@/services/weatherService';

// Vineyard functions
export const getUserVineyards = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('vineyards')
    .select('*')
    .eq('user_id', user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('vineyards')
    .insert([{ ...vineyard, user_id: user.id }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating vineyard:', error);
    throw error;
  }
  
  return data;
};

export const saveVineyard = createVineyard; // Alias for consistency

export const deleteVineyard = async (vineyardId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('vineyards')
    .delete()
    .eq('id', vineyardId)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error deleting vineyard:', error);
    throw error;
  }
};

// Observation functions
export const saveObservation = async (observation: {
  vineyard_id: string;
  content: string;
  observation_type?: string;
  location_notes?: string;
  photos?: string[];
}) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('User authentication error:', userError);
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('observations')
    .insert([{
      ...observation,
      user_id: userData.user.id,
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

export const getObservations = async (vineyardId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('observations')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching observations:', error);
    throw error;
  }
  
  return data || [];
};

export const updateObservation = async (id: string, updates: {
  content?: string;
  observation_type?: string;
  location_notes?: string;
  photos?: string[];
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('observations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating observation:', error);
    throw error;
  }
  
  return data;
};

export const deleteObservation = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('observations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error deleting observation:', error);
    throw error;
  }
};

// Task functions
export const getTasks = async (vineyardId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: user.id }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  return data;
};

export const saveTask = createTask; // Alias for consistency

export const updateTask = async (id: string, updates: {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
  completed_at?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  
  return data;
};

export const deleteTask = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Phenology Events functions
export const getPhenologyEvents = async (vineyardId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('phenology_events')
    .select('*')
    .eq('user_id', user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('phenology_events')
    .insert([{ ...event, user_id: user.id }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating phenology event:', error);
    throw error;
  }
  
  return data;
};

export const savePhenologyEvent = createPhenologyEvent; // Alias for consistency

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
