
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeatherDashboard } from '@/components/weather/WeatherDashboard';
import { PredictionsCard } from '@/components/dashboard/PredictionsCard';
import { ActivityFeed } from '@/components/activityFeed/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { 
  currentSeason, 
  pastSeason, 
  weatherData, 
  predictions, 
  activityItems,
  vineyardBlocks,
  tasks,
  notes
} from '@/data/mockData';
import { 
  PhaseEvent, 
  TaskItem, 
  NoteItem, 
  ActivityItem as ActivityItemType
} from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activities, setActivities] = useState<ActivityItemType[]>(activityItems);
  const [selectedPhase, setSelectedPhase] = useState<PhaseEvent | null>(null);
  const [weatherDataRefreshKey, setWeatherDataRefreshKey] = useState(0);
  const [currentSeasonData, setCurrentSeasonData] = useState(currentSeason);
  const { toast } = useToast();

  // Mock vineyard data - in production this would come from the database
  const currentVineyard = {
    id: 'vineyard-1',
    name: 'Domaine Valeta',
    latitude: 38.2975,
    longitude: -122.4581
  };

  // Find current and next phase
  const phases: Array<PhaseEvent['phase']> = ['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'];
  const currentPhaseEvent = currentSeason.events
    .filter(event => phases.includes(event.phase))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const currentPhaseIndex = phases.indexOf(currentPhaseEvent?.phase || 'budbreak');
  const nextPhase = phases[currentPhaseIndex + 1] || phases[0];

  const handlePhaseClick = (phase: PhaseEvent) => {
    setSelectedPhase(phase);
  };

  const handleAddTask = (task: TaskItem) => {
    const newActivity: ActivityItemType = {
      id: task.id,
      type: 'task',
      date: task.date,
      title: task.title,
      description: task.description,
      blockId: task.blockId,
      iconType: task.category
    };
    
    setActivities([newActivity, ...activities]);
    
    toast({
      title: "Task Added",
      description: `${task.title} has been added to your tasks.`
    });
  };

  const handleAddNote = (note: NoteItem) => {
    const newActivity: ActivityItemType = {
      id: note.id,
      type: 'note',
      date: note.date,
      title: `Note: ${note.tags.join(', ')}`,
      description: note.content,
      blockId: note.blockId,
      iconType: 'note'
    };
    
    setActivities([newActivity, ...activities]);
    
    toast({
      title: "Note Added",
      description: "Your vineyard note has been recorded."
    });
  };
  
  const handleRecordPhase = (phase: PhaseEvent) => {
    const newActivity: ActivityItemType = {
      id: `phase-${Date.now()}`,
      type: 'phase',
      date: phase.date,
      title: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)} phase ${
        phase.phase === currentPhaseEvent?.phase ? 'ended' : 'started'
      }`,
      description: phase.notes,
      iconType: 'phase'
    };
    
    setActivities([newActivity, ...activities]);
    
    toast({
      title: "Phase Recorded",
      description: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)} phase has been recorded.`
    });
  };

  const handleWeatherDataUpdate = async () => {
    try {
      // Import the weather service functions
      const { getGDDDataForChart } = await import('@/services/weatherService');
      
      // Fetch updated GDD data from the database
      const gddChartData = await getGDDDataForChart(currentVineyard.id, '2025-03-01');
      
      // Update the current season data with real weather data
      const updatedCurrentSeason = {
        ...currentSeason,
        gddData: gddChartData
      };
      
      setCurrentSeasonData(updatedCurrentSeason);
      setWeatherDataRefreshKey(prev => prev + 1);
      
      toast({
        title: "Weather Data Updated",
        description: "GDD calculations have been refreshed with latest weather data."
      });
    } catch (error) {
      console.error('Error updating weather data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh weather data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Dashboard header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Vineyard Weather Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track growing degree days and weather conditions for your vineyard
            </p>
          </div>
          <QuickActions 
            blocks={vineyardBlocks} 
            onAddTask={handleAddTask}
            onAddNote={handleAddNote}
            onRecordPhase={handleRecordPhase}
            currentPhase={currentPhaseEvent?.phase}
            nextPhase={nextPhase}
          />
        </div>

        {/* Weather Dashboard - Main Feature */}
        <WeatherDashboard />

        {/* Insights and Recommendations section */}
        <div>
          <PredictionsCard
            harvestDate={predictions.harvestDate}
            diseaseRisk={predictions.diseaseRisk}
            recommendations={predictions.recommendations}
            nextPredictedPhase="Fruitset"
            nextPredictedDays="June 8-12"
          />
        </div>

        {/* Activity Feed takes full width */}
        <div>
          <ActivityFeed 
            activities={activities}
            onAddTask={handleAddTask}
            onAddNote={handleAddNote}
            blocks={vineyardBlocks}
          />
        </div>
      </div>

      {/* Phase detail dialog */}
      <Dialog 
        open={!!selectedPhase} 
        onOpenChange={(open) => !open && setSelectedPhase(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedPhase?.phase} Phase
            </DialogTitle>
            <DialogDescription>
              Recorded on {selectedPhase && format(parseISO(selectedPhase.date), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{selectedPhase?.notes}</p>
            <div className="mt-4 bg-muted p-4 rounded-md">
              <p className="text-sm font-medium">Growing Degree Days at this phase:</p>
              <p className="text-xl font-bold text-vineyard-burgundy">
                {currentSeasonData.gddData.find(point => point.date === selectedPhase?.date)?.value || 0} GDD
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Index;
