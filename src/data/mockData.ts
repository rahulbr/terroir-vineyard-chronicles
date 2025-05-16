
import { VineyardBlock, TaskItem, NoteItem, WeatherData, Season, ActivityItem, PhaseEvent } from '../types';

export const vineyardBlocks: VineyardBlock[] = [
  {
    id: 'block-1',
    name: 'North Hill',
    variety: 'Cabernet Sauvignon',
    area: 2.4,
    planted: '2015',
    location: 'Northern slope',
    imageUrl: '/placeholder.svg'
  },
  {
    id: 'block-2',
    name: 'East Valley',
    variety: 'Chardonnay',
    area: 1.8,
    planted: '2018',
    location: 'Eastern flat land',
    imageUrl: '/placeholder.svg'
  },
  {
    id: 'block-3',
    name: 'West Ridge',
    variety: 'Pinot Noir',
    area: 3.1,
    planted: '2012',
    location: 'Western hillside',
    imageUrl: '/placeholder.svg'
  }
];

export const tasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Summer pruning',
    description: 'Remove excessive leaf growth to improve air circulation',
    blockId: 'block-1',
    date: '2025-05-18',
    completed: false,
    category: 'pruning'
  },
  {
    id: 'task-2',
    title: 'Fungicide application',
    description: 'Apply organic fungicide to prevent powdery mildew',
    blockId: 'block-2',
    date: '2025-05-20',
    completed: false,
    category: 'spraying'
  },
  {
    id: 'task-3',
    title: 'Shoot thinning',
    description: 'Remove non-fruiting shoots to focus plant energy',
    blockId: 'block-3',
    date: '2025-05-15',
    completed: true,
    category: 'pruning'
  },
  {
    id: 'task-4',
    title: 'Soil analysis',
    description: 'Collect soil samples for nutrient analysis',
    blockId: 'block-1',
    date: '2025-05-10',
    completed: true,
    category: 'other'
  }
];

export const notes: NoteItem[] = [
  {
    id: 'note-1',
    content: 'Noticed some early signs of water stress in the eastern rows. Consider adjusting irrigation schedule.',
    date: '2025-05-14',
    blockId: 'block-1',
    tags: ['irrigation', 'stress']
  },
  {
    id: 'note-2',
    content: 'Berry size looking good across all vines. Slightly smaller than last year, which should increase concentration.',
    date: '2025-05-12',
    blockId: 'block-3',
    tags: ['berries', 'quality']
  },
  {
    id: 'note-3',
    content: 'New assistant vineyard manager started today. Trained on equipment safety and block identification.',
    date: '2025-05-08',
    blockId: 'block-2',
    tags: ['staff', 'training']
  }
];

// Generate weather data with GDD accumulation
const generateWeatherData = (): WeatherData[] => {
  const weatherData: WeatherData[] = [];
  const startDate = new Date('2025-03-01');
  let gddAccumulation = 0;
  
  for (let i = 0; i < 77; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Simple weather generation logic
    const baseTemp = 10 + (i / 5);
    const tempHigh = baseTemp + Math.random() * 8 + 10;
    const tempLow = baseTemp - Math.random() * 5;
    
    // Calculate GDD - assuming base temp of 10°C (50°F)
    const dailyGdd = Math.max(0, ((tempHigh + tempLow) / 2) - 10);
    gddAccumulation += dailyGdd;
    
    weatherData.push({
      date: currentDate.toISOString().split('T')[0],
      tempHigh: Math.round(tempHigh * 10) / 10,
      tempLow: Math.round(tempLow * 10) / 10,
      rainfall: i % 7 === 0 ? Math.random() * 10 : 0,
      humidity: 50 + Math.random() * 30,
      gdd: Math.round(gddAccumulation)
    });
  }
  
  return weatherData;
};

export const weatherData = generateWeatherData();

// Create current and past season data
export const currentSeason: Season = {
  year: '2025',
  gddData: weatherData.map(day => ({ date: day.date, value: day.gdd })),
  events: [
    {
      id: 'event-1',
      phase: 'budbreak',
      date: '2025-03-28',
      notes: 'Early budbreak in block 1, others following within days'
    },
    {
      id: 'event-2',
      phase: 'flowering',
      date: '2025-05-10',
      notes: 'Good uniform flowering across all blocks'
    }
  ]
};

export const pastSeason: Season = {
  year: '2024',
  gddData: weatherData.map(day => {
    const date = day.date.replace('2025', '2024');
    // Add some variation for the previous year
    const variance = (Math.random() - 0.5) * 50;
    return { 
      date, 
      value: Math.max(0, Math.round(day.gdd + variance)) 
    };
  }),
  events: [
    {
      id: 'past-event-1',
      phase: 'budbreak',
      date: '2024-04-05',
      notes: 'Late budbreak due to cool spring'
    },
    {
      id: 'past-event-2',
      phase: 'flowering',
      date: '2024-05-18',
      notes: 'Uneven flowering due to spring frost event'
    },
    {
      id: 'past-event-3',
      phase: 'fruitset',
      date: '2024-06-10',
      notes: 'Good fruitset despite earlier challenges'
    },
    {
      id: 'past-event-4',
      phase: 'veraison',
      date: '2024-07-25',
      notes: 'Early veraison in Pinot Noir block'
    },
    {
      id: 'past-event-5',
      phase: 'harvest',
      date: '2024-09-12',
      notes: 'Started harvest with Chardonnay, excellent quality'
    }
  ]
};

// Generate activity feed by combining tasks, notes and events
export const activityItems: ActivityItem[] = [
  ...tasks.map(task => ({
    id: task.id,
    type: 'task' as const,
    date: task.date,
    title: task.title,
    description: task.description,
    blockId: task.blockId,
    iconType: task.category
  })),
  ...notes.map(note => ({
    id: note.id,
    type: 'note' as const,
    date: note.date,
    title: `Note: ${note.tags.join(', ')}`,
    description: note.content,
    blockId: note.blockId,
    iconType: 'note'
  })),
  ...currentSeason.events.map(event => ({
    id: event.id,
    type: 'phase' as const,
    date: event.date,
    title: `${event.phase.charAt(0).toUpperCase() + event.phase.slice(1)} observed`,
    description: event.notes || '',
    iconType: event.phase
  })),
  {
    id: 'weather-1',
    type: 'weather_alert' as const,
    date: '2025-05-19',
    title: 'Frost Risk Alert',
    description: 'Temperatures expected to drop below 2°C overnight. Consider frost protection measures.',
    iconType: 'weather'
  },
  {
    id: 'weather-2',
    type: 'weather_alert' as const,
    date: '2025-05-11',
    title: 'Heat Spike Warning',
    description: 'Temperatures forecasted to reach 35°C in the next 3 days. Ensure irrigation is adequate.',
    iconType: 'weather'
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Predictions and recommendations
export const predictions = {
  harvestDate: '2025-09-15',
  diseaseRisk: {
    powderyMildew: 'High',
    downyMildew: 'Low',
    botrytis: 'Medium'
  },
  recommendations: [
    'Consider preventative fungicide application in the next 5 days due to forecasted humidity',
    'East Valley block is showing signs of water stress - increase irrigation by 15%',
    'Based on GDD accumulation, veraison is expected to begin in approximately 38 days',
    'Your Pinot Noir block is tracking 5 days ahead of regional average for phenological development'
  ]
};
