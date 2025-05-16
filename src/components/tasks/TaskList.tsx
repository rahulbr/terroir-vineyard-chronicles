
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TaskItem, VineyardBlock } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Circle,
  Scissors,
  Droplets,
  Leaf,
  Tractor,
  Shovel,
  FileText
} from 'lucide-react';

interface TaskListProps {
  tasks: TaskItem[];
  blocks: VineyardBlock[];
}

// Mock data for assignees
const assignees = {
  '1': { name: 'David Goldfarb', avatar: '/images/david.jpg', initials: 'DG' },
  '2': { name: 'Abel Martinez', avatar: '/placeholder.svg', initials: 'AM' },
  '3': { name: 'Rahul Patel', avatar: '/placeholder.svg', initials: 'RP' },
  '4': { name: 'Julio Rodriguez', avatar: '/placeholder.svg', initials: 'JR' }
};

// Function to assign tasks to people deterministically based on task ID
const getAssigneeForTask = (taskId: string) => {
  const assigneeIds = Object.keys(assignees);
  const idSum = taskId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const assigneeIndex = idSum % assigneeIds.length;
  const assigneeId = assigneeIds[assigneeIndex];
  return assignees[assigneeId as keyof typeof assignees];
};

// Function to get GPS coordinates based on blockId
const getGpsForBlock = (blockId: string) => {
  // Generate deterministic but randomized coordinates for each block
  const blockIdSum = blockId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const baseLat = 38.5 + (blockIdSum % 10) / 100;
  const baseLng = -122.8 - (blockIdSum % 15) / 100;
  return `${baseLat.toFixed(6)}, ${baseLng.toFixed(6)}`;
};

// Function to get task category icon
const getCategoryIcon = (category: TaskItem['category']) => {
  switch (category) {
    case 'pruning':
      return <Scissors className="h-4 w-4" />;
    case 'spraying':
      return <Droplets className="h-4 w-4" />;
    case 'leafing':
      return <Leaf className="h-4 w-4" />;
    case 'harvesting':
      return <Tractor className="h-4 w-4" />;
    case 'planting':
      return <Shovel className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, blocks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vineyard Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found with the selected filters.
            </div>
          ) : (
            tasks.map((task) => {
              const block = blocks.find(b => b.id === task.blockId);
              const assignee = getAssigneeForTask(task.id);
              const gpsCoordinates = getGpsForBlock(task.blockId);
              
              return (
                <div key={task.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <Badge 
                      className="capitalize flex items-center gap-1"
                      variant={task.completed ? "outline" : "default"}
                    >
                      {getCategoryIcon(task.category)}
                      {task.category}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {format(parseISO(task.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {block?.name || 'Unknown Block'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-xs">{gpsCoordinates}</span>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        <AvatarFallback>{assignee.initials}</AvatarFallback>
                      </Avatar>
                      {assignee.name}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
