
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GddChart } from '@/components/dashboard/GddChart';
import { PhasesCard } from '@/components/dashboard/PhasesCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
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
  const { toast } = useToast();

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Dashboard header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              2025 Growing Season - Domaine Valeta
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

        {/* GDD Chart takes full width at the top */}
        <div>
          <GddChart 
            currentSeason={currentSeason}
            pastSeason={pastSeason}
            onPhaseClick={handlePhaseClick}
          />
        </div>

        {/* Growth Phases in a horizontal section */}
        <div>
          <PhasesCard 
            currentSeason={currentSeason}
            pastSeason={pastSeason}
          />
        </div>

        {/* Weather and Predictions section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <WeatherCard weatherData={weatherData} />
          </div>
          <div className="md:col-span-2">
            <PredictionsCard
              harvestDate={predictions.harvestDate}
              diseaseRisk={predictions.diseaseRisk}
              recommendations={predictions.recommendations}
              nextPredictedPhase="Fruitset"
              nextPredictedDays="June 8-12"
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed activities={activities} />
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
                {currentSeason.gddData.find(point => point.date === selectedPhase?.date)?.value || 0} GDD
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Index;
