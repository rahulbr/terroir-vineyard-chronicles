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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Activities page loading, fetching data...');
    fetchData();
  }, []);

  // Debug vineyardId
  useEffect(() => {
    console.log('Activities page vineyardId changed to:', vineyardId);
  }, [vineyardId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching user vineyards...');
      const vineyards = await getUserVineyards();
      console.log('Retrieved vineyards:', vineyards);
      
      if (vineyards.length > 0) {
        const vineyard = vineyards[0];
        console.log('Setting vineyard ID to:', vineyard.id);
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
      } else {
        // If no vineyards exist, show a message
        toast({
          title: "No Vineyard Found",
          description: "Please create a vineyard first before logging activities.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: TaskItem) => {
    try {
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
      
      // Refetch data to get the latest from database
      await fetchData();
      
      toast({
        title: "Task Added",
        description: "Task has been successfully added and saved."
      });
    } catch (error) {
      console.error('Error handling add task:', error);
      toast({
        title: "Error",
        description: "Failed to refresh activity list.",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async (note: NoteItem) => {
    try {
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
      
      // Refetch data to get the latest from database
      await fetchData();
      
      toast({
        title: "Note Added",
        description: "Observation has been successfully added and saved."
      });
    } catch (error) {
      console.error('Error handling add note:', error);
      toast({
        title: "Error",
        description: "Failed to refresh activity list.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Activities</h1>
            <p className="text-muted-foreground">
              Loading your vineyard activities...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

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