
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem as ActivityItemType, TaskItem, NoteItem, VineyardBlock } from '@/types';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListTodo, Filter, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createTask, saveObservation } from '@/integrations/supabase/api';

interface ActivityFeedProps {
  activities: ActivityItemType[];
  onAddTask?: (task: TaskItem) => void;
  onAddNote?: (note: NoteItem) => void;
  blocks?: VineyardBlock[];
  vineyardId?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  onAddTask, 
  onAddNote, 
  blocks = [],
  vineyardId
}) => {
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

  const [taskNoteOpen, setTaskNoteOpen] = useState(false);
  const [actionType, setActionType] = useState('task');
  const { toast } = useToast();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date());
  const [taskCategory, setTaskCategory] = useState('');
  const [taskBlock, setTaskBlock] = useState('');

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteBlock, setNoteBlock] = useState('');

  const filteredActivities = activities.filter(activity => {
    if (activity.type === 'note') return filters.note;
    if (activity.type === 'task') {
      return filters[activity.iconType as keyof typeof filters] || false;
    }
    if (activity.type === 'phase') {
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

  const handleAddTask = async () => {
    if (!taskTitle || !taskDescription || !taskDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title, description, and date.",
        variant: "destructive"
      });
      return;
    }

    if (!vineyardId) {
      toast({
        title: "Error",
        description: "No vineyard selected. Please select a vineyard first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTask({
        vineyard_id: vineyardId,
        title: taskTitle,
        description: taskDescription,
        due_date: format(taskDate, 'yyyy-MM-dd'),
        priority: 'medium'
      });

      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: taskTitle,
        description: taskDescription,
        blockId: 'general',
        date: format(taskDate, 'yyyy-MM-dd'),
        completed: true,
        category: (taskCategory || 'other') as any,
      };

      if (onAddTask) {
        onAddTask(newTask);
      }

      toast({
        title: "Activity Logged",
        description: `${taskTitle} has been saved to the database.`
      });

      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskDate(new Date());
      setTaskCategory('');
      setTaskNoteOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async () => {
    if (!noteContent || !noteBlock) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!vineyardId) {
      toast({
        title: "Error",
        description: "No vineyard selected. Please select a vineyard first.",
        variant: "destructive"
      });
      return;
    }

    const tags = noteTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      await saveObservation({
        vineyard_id: vineyardId,
        content: noteContent,
        observation_type: 'note',
        location_notes: `Block: ${noteBlock}`,
      });

      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        content: noteContent,
        date: new Date().toISOString().split('T')[0],
        blockId: noteBlock,
        tags: tags.length > 0 ? tags : ['general'],
      };

      if (onAddNote) {
        onAddNote(newNote);
      }

      toast({
        title: "Note Created",
        description: "Your note has been saved to the database."
      });

      // Reset form
      setNoteContent('');
      setNoteTags('');
      setNoteBlock('');
      setTaskNoteOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <div className="flex gap-2">
            {/* Add Task/Note Dialog */}
            <Dialog open={taskNoteOpen} onOpenChange={setTaskNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-vineyard-burgundy text-white">
                  <Plus className="h-4 w-4 mr-1" /> Log Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Log Activity</DialogTitle>
                  <DialogDescription>
                    Record a completed vineyard activity.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-title" className="text-right">
                      Title *
                    </Label>
                    <Input
                      id="activity-title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="col-span-3"
                      placeholder="Summer pruning"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-description" className="text-right">
                      Description *
                    </Label>
                    <Textarea
                      id="activity-description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Details about the activity"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-date" className="text-right">
                      Date *
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !taskDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {taskDate ? format(taskDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto">
                          <Calendar
                            mode="single"
                            selected={taskDate}
                            onSelect={setTaskDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-category" className="text-right">
                      Category
                    </Label>
                    <Select value={taskCategory} onValueChange={setTaskCategory}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pruning">Pruning</SelectItem>
                        <SelectItem value="spraying">Spraying</SelectItem>
                        <SelectItem value="leafing">Leaf Management</SelectItem>
                        <SelectItem value="harvesting">Harvesting</SelectItem>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTaskNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-vineyard-burgundy text-white" 
                    onClick={handleAddTask}
                  >
                    Log Activity
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
