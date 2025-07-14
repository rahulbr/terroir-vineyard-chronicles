import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityFeed } from '@/components/activityFeed/ActivityFeed';
import { ActivityItem, TaskItem, NoteItem, VineyardBlock } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTasks, getObservations, getUserVineyards } from '@/integrations/supabase/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Activities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [blocks, setBlocks] = useState<VineyardBlock[]>([]);
  const [vineyardId, setVineyardId] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const vineyards = await getUserVineyards();
      if (vineyards.length > 0) {
        const vineyard = vineyards[0];
        setVineyardId(vineyard.id);
        
        // Fetch tasks and observations
        const [tasks, observations] = await Promise.all([
          getTasks(vineyard.id),
          getObservations(vineyard.id)
        ]);

        // Convert to activity items
        const taskActivities: ActivityItem[] = tasks.map(task => ({
          id: task.id,
          type: 'task',
          date: task.due_date || task.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          title: task.title,
          description: task.description || '',
          blockId: 'general',
          iconType: task.priority || 'other'
        }));

        const observationActivities: ActivityItem[] = observations.map(obs => ({
          id: obs.id,
          type: 'note',
          date: obs.timestamp?.split('T')[0] || obs.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          title: 'Observation',
          description: obs.content,
          blockId: 'general',
          iconType: 'note'
        }));

        const allActivities = [...taskActivities, ...observationActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setActivities(allActivities);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTask = (task: TaskItem) => {
    const newActivity: ActivityItem = {
      id: task.id,
      type: 'task',
      date: task.date,
      title: task.title,
      description: task.description,
      blockId: task.blockId,
      iconType: task.category,
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleAddNote = (note: NoteItem) => {
    const newActivity: ActivityItem = {
      id: note.id,
      type: 'note',
      date: note.date,
      title: 'Note',
      description: note.content,
      blockId: note.blockId,
      iconType: 'note',
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Track and manage all your vineyard activities and observations.
          </p>
        </div>

        <ActivityFeed
          activities={activities}
          onAddTask={handleAddTask}
          onAddNote={handleAddNote}
          blocks={blocks}
          vineyardId={vineyardId}
        />
      </div>
    </AppLayout>
  );
}