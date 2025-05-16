
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem as ActivityItemType } from '@/types';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ListTodo, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ActivityFeedProps {
  activities: ActivityItemType[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [filters, setFilters] = useState<{
    task: boolean;
    note: boolean;
    phase: boolean;
  }>({
    task: true,
    note: true,
    phase: true,
  });

  const filteredActivities = activities.filter(
    activity => 
      (activity.type === 'task' && filters.task) || 
      (activity.type === 'note' && filters.note) ||
      (activity.type === 'phase' && filters.phase)
  );

  const toggleFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Activity Log
          </CardTitle>
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
                checked={filters.note}
                onCheckedChange={() => toggleFilter('note')}
              >
                Notes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.phase}
                onCheckedChange={() => toggleFilter('phase')}
              >
                Phases
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
