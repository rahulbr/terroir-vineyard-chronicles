
export interface VineyardBlock {
  id: string;
  name: string;
  variety: string;
  area: number; // in hectares
  planted: string; // year
  location: string;
  imageUrl?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  blockId: string;
  date: string;
  completed: boolean;
  category: 'pruning' | 'spraying' | 'leafing' | 'harvesting' | 'planting' | 'other';
}

export interface NoteItem {
  id: string;
  content: string;
  date: string;
  blockId: string;
  tags: string[];
  images?: string[];
}

export interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainfall: number;
  humidity: number;
  gdd: number; // Growing Degree Day accumulation
}

export interface GddPoint {
  date: string;
  value: number;
}

export interface Season {
  year: string;
  gddData: GddPoint[];
  events: PhaseEvent[];
}

export interface PhaseEvent {
  id: string;
  phase: 'budbreak' | 'flowering' | 'fruitset' | 'veraison' | 'harvest' | 'other';
  date: string;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'note' | 'phase' | 'weather_alert';
  date: string;
  title: string;
  description: string;
  blockId?: string;
  iconType: string;
}
