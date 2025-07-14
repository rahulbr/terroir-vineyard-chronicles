
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem as ActivityItemType } from '@/types';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListTodo, Filter, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ActivityLogger } from '@/components/activities/ActivityLogger';
import { getTasks, getObservations } from '@/integrations/supabase/api';
import { useAuth } from '@/hooks/useAuth';
import { useVineyard } from '@/hooks/useVineyard';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ className }) => {
  const { user } = useAuth();
  const { currentVineyard, isAuthenticated, hasVineyard } = useVineyard();
  const { toast } = useToast();
  
  const [activities, setActivities] = useState<ActivityItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<{
    task: boolean;
    note: boolean;
    observation: boolean;
    weather: boolean;
    pest: boolean;
    general: boolean;
  }>({
    task: true,
    note: true,
    observation: true,
    weather: true,
    pest: true,
    general: true,
  });

  // Fetch activities when component mounts or vineyard changes
  useEffect(() => {
    if (isAuthenticated && hasVineyard && currentVineyard) {
      fetchActivities();
    } else {
      setActivities([]);
    }
  }, [isAuthenticated, hasVineyard, currentVineyard]);

  const fetchActivities = async () => {
    if (!currentVineyard) return;
    
    setLoading(true);
    try {
      const [tasks, observations] = await Promise.all([
        getTasks(currentVineyard.id),
        getObservations(currentVineyard.id)
      ]);

      // Convert tasks to activity items
      const taskActivities: ActivityItemType[] = tasks.map(task => ({
        id: task.id,
        type: 'task',
        date: task.due_date || task.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        title: task.title,
        description: task.description || '',
        blockId: 'general',
        iconType: task.priority || 'other'
      }));

      // Convert observations to activity items
      const observationActivities: ActivityItemType[] = observations.map(obs => ({
        id: obs.id,
        type: 'note',
        date: obs.timestamp?.split('T')[0] || obs.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        title: `${obs.observation_type || 'Note'}`,
        description: obs.content,
        blockId: 'general',
        iconType: obs.observation_type || 'general'
      }));

      const allActivities = [...taskActivities, ...observationActivities]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(allActivities);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Activities have been updated."
    });
  };

  const handleActivityLogged = () => {
    fetchActivities();
  };

  const filteredActivities = activities.filter(activity => {
    if (activity.type === 'task') return filters.task;
    if (activity.type === 'note') {
      const iconType = activity.iconType as keyof typeof filters;
      return filters[iconType] !== undefined ? filters[iconType] : filters.general;
    }
    return true;
  });

  const toggleFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  if (!isAuthenticated) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Please sign in to view activities.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasVineyard) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Please create a vineyard in Settings to start logging activities.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Activity Log
            {currentVineyard && (
              <span className="text-sm font-normal text-muted-foreground">
                - {currentVineyard.name}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <ActivityLogger onActivityLogged={handleActivityLogged} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={cn("h-4 w-4", (refreshing || loading) && "animate-spin")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={filters.task}
                  onCheckedChange={() => toggleFilter('task')}
                >
                  Tasks
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.observation}
                  onCheckedChange={() => toggleFilter('observation')}
                >
                  Observations
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.weather}
                  onCheckedChange={() => toggleFilter('weather')}
                >
                  Weather Notes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.pest}
                  onCheckedChange={() => toggleFilter('pest')}
                >
                  Pest/Disease
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.general}
                  onCheckedChange={() => toggleFilter('general')}
                >
                  General Notes
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading activities...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activities found. Start by logging your first activity!</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
