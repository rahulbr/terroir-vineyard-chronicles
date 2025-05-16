
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem as ActivityItemType } from '@/types';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListTodo, Filter } from 'lucide-react';
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
    pruning: boolean;
    spraying: boolean;
    leafing: boolean;
    harvesting: boolean;
    planting: boolean;
    other: boolean;
    note: boolean;
  }>({
    pruning: true,
    spraying: true,
    leafing: true,
    harvesting: true,
    planting: true,
    other: true,
    note: true,
  });

  const filteredActivities = activities.filter(activity => {
    if (activity.type === 'note') return filters.note;
    if (activity.type === 'task') {
      return filters[activity.iconType as keyof typeof filters] || false;
    }
    if (activity.type === 'phase') {
      // Always show phase activities as they're now handled separately
      return true;
    }
    return false;
  });

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
                checked={filters.pruning}
                onCheckedChange={() => toggleFilter('pruning')}
              >
                Pruning
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.spraying}
                onCheckedChange={() => toggleFilter('spraying')}
              >
                Spraying
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.leafing}
                onCheckedChange={() => toggleFilter('leafing')}
              >
                Leaf Management
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.harvesting}
                onCheckedChange={() => toggleFilter('harvesting')}
              >
                Harvesting
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.planting}
                onCheckedChange={() => toggleFilter('planting')}
              >
                Planting
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.other}
                onCheckedChange={() => toggleFilter('other')}
              >
                Other Tasks
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.note}
                onCheckedChange={() => toggleFilter('note')}
              >
                Notes
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
