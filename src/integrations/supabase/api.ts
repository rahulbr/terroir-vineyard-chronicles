import { supabase } from './client';
import { 
  updateVineyardWeatherData, 
  getCumulativeGDD, 
  CumulativeGDDData 
} from '@/services/weatherService';

// SIMPLIFIED VINEYARD FUNCTIONS - NO AUTH REQUIREMENTS
export const getUserVineyards = async () => {
  console.log('Fetching all vineyards...');
  
  const { data, error } = await supabase
    .from('vineyards')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('Vineyard fetch result:', { data, error });
  
  if (error) {
    console.error('Error fetching vineyards:', error);
    throw error;
  }
  
  console.log('Successfully fetched vineyards:', data);
  return data || [];
};

export const createVineyard = async (vineyard: {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}) => {
  console.log('Creating vineyard with data:', vineyard);
  
  const { data, error } = await supabase
    .from('vineyards')
    .insert({
      name: vineyard.name,
      location: vineyard.location,
      latitude: vineyard.latitude,
      longitude: vineyard.longitude
    })
    .select()
    .single();

  console.log('Vineyard creation result:', { data, error });

  if (error) {
    console.error('Error creating vineyard:', error);
    throw error;
  }

  console.log('Successfully created vineyard:', data);
  return data;
};

export const saveVineyard = createVineyard;

export const deleteVineyard = async (vineyardId: string) => {
  console.log('Deleting vineyard:', vineyardId);
  
  const { error } = await supabase
    .from('vineyards')
    .delete()
    .eq('id', vineyardId);
    
  console.log('Vineyard deletion result:', { error });
  
  if (error) {
    console.error('Error deleting vineyard:', error);
    throw error;
  }
  
  console.log('Successfully deleted vineyard');
};

// SIMPLIFIED OBSERVATION FUNCTIONS - NO AUTH REQUIREMENTS
export const saveObservation = async (observation: {
  vineyard_id: string;
  content: string;
  observation_type?: string;
  location_notes?: string;
  photos?: string[];
}) => {
  console.log('Saving observation with data:', observation);
  
  const { data, error } = await supabase
    .from('observations')
    .insert({
      vineyard_id: observation.vineyard_id,
      content: observation.content,
      observation_type: observation.observation_type,
      location_notes: observation.location_notes,
      photos: observation.photos,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  console.log('Observation save result:', { data, error });

  if (error) {
    console.error('Error saving observation:', error);
    throw error;
  }

  console.log('Successfully saved observation:', data);
  return data;
};

export const getObservations = async (vineyardId?: string) => {
  console.log('Fetching observations for vineyard:', vineyardId);
  
  let query = supabase
    .from('observations')
    .select('*')
    .order('timestamp', { ascending: false });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  console.log('Observations fetch result:', { data, error });
  
  if (error) {
    console.error('Error fetching observations:', error);
    throw error;
  }
  
  console.log('Successfully fetched observations:', data);
  return data || [];
};

export const updateObservation = async (id: string, updates: {
  content?: string;
  observation_type?: string;
  location_notes?: string;
  photos?: string[];
}) => {
  console.log('Updating observation:', id, updates);
  
  const { data, error } = await supabase
    .from('observations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  console.log('Observation update result:', { data, error });
  
  if (error) {
    console.error('Error updating observation:', error);
    throw error;
  }
  
  console.log('Successfully updated observation:', data);
  return data;
};

export const deleteObservation = async (id: string) => {
  console.log('Deleting observation:', id);
  
  const { error } = await supabase
    .from('observations')
    .delete()
    .eq('id', id);
    
  console.log('Observation deletion result:', { error });
  
  if (error) {
    console.error('Error deleting observation:', error);
    throw error;
  }
  
  console.log('Successfully deleted observation');
};

// SIMPLIFIED TASK FUNCTIONS - NO AUTH REQUIREMENTS
export const getTasks = async (vineyardId?: string) => {
  console.log('Fetching tasks for vineyard:', vineyardId);
  
  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  console.log('Tasks fetch result:', { data, error });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  console.log('Successfully fetched tasks:', data);
  return data || [];
};

export const createTask = async (task: {
  vineyard_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
}) => {
  console.log('Creating task with data:', task);
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      vineyard_id: task.vineyard_id,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority || 'medium'
    })
    .select()
    .single();
      
  console.log('Task creation result:', { data, error });
  
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  console.log('Successfully created task:', data);
  return data;
};

export const saveTask = createTask;

export const updateTask = async (id: string, updates: {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
  completed_at?: string;
}) => {
  console.log('Updating task:', id, updates);
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  console.log('Task update result:', { data, error });
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  
  console.log('Successfully updated task:', data);
  return data;
};

export const deleteTask = async (id: string) => {
  console.log('Deleting task:', id);
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  console.log('Task deletion result:', { error });
  
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
  
  console.log('Successfully deleted task');
};

// SIMPLIFIED PHENOLOGY FUNCTIONS - NO AUTH REQUIREMENTS
export const getPhenologyEvents = async (vineyardId?: string) => {
  console.log('Fetching phenology events for vineyard:', vineyardId);
  
  let query = supabase
    .from('phenology_events')
    .select('*')
    .order('event_date', { ascending: true });
    
  if (vineyardId) {
    query = query.eq('vineyard_id', vineyardId);
  }
  
  const { data, error } = await query;
  
  console.log('Phenology events fetch result:', { data, error });
  
  if (error) {
    console.error('Error fetching phenology events:', error);
    throw error;
  }
  
  console.log('Successfully fetched phenology events:', data);
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
  console.log('Creating phenology event with data:', event);
  
  const { data, error } = await supabase
    .from('phenology_events')
    .insert({
      vineyard_id: event.vineyard_id,
      event_type: event.event_type,
      event_date: event.event_date,
      end_date: event.end_date,
      notes: event.notes,
      harvest_block: event.harvest_block
    })
    .select()
    .single();
      
  console.log('Phenology event creation result:', { data, error });
  
  if (error) {
    console.error('Error creating phenology event:', error);
    throw error;
  }
  
  console.log('Successfully created phenology event:', data);
  return data;
};

export const savePhenologyEvent = createPhenologyEvent;

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