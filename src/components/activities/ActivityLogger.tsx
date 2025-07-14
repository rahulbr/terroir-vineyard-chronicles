import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { useVineyard } from '@/hooks/useVineyard';

interface ActivityLoggerProps {
  onActivityLogged?: () => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onActivityLogged }) => {
  const { user } = useAuth();
  const { currentVineyard, isAuthenticated, hasVineyard } = useVineyard();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date());
  const [taskCategory, setTaskCategory] = useState('');

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('observation');

  // Check if user can log activities
  const canLogActivities = isAuthenticated && hasVineyard && currentVineyard;

  const resetForms = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDate(new Date());
    setTaskCategory('');
    setNoteContent('');
    setNoteType('observation');
  };

  const handleAddTask = async () => {
    if (!canLogActivities) {
      toast({
        title: "Cannot Log Activity",
        description: "Please sign in and select a vineyard first.",
        variant: "destructive"
      });
      return;
    }

    if (!taskTitle || !taskDescription || !taskDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title, description, and date.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createTask({
        vineyard_id: currentVineyard!.id,
        title: taskTitle,
        description: taskDescription,
        due_date: format(taskDate, 'yyyy-MM-dd'),
        priority: taskCategory || 'medium'
      });

      toast({
        title: "Activity Logged",
        description: `${taskTitle} has been saved successfully.`
      });

      resetForms();
      setOpen(false);
      onActivityLogged?.();
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      let errorMessage = "Failed to create task. Please try again.";
      if (error?.message?.includes('not authenticated')) {
        errorMessage = "Authentication failed. Please sign in again.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!canLogActivities) {
      toast({
        title: "Cannot Log Activity",
        description: "Please sign in and select a vineyard first.",
        variant: "destructive"
      });
      return;
    }

    if (!noteContent) {
      toast({
        title: "Missing Content",
        description: "Please enter note content.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await saveObservation({
        vineyard_id: currentVineyard!.id,
        content: noteContent,
        observation_type: noteType,
      });

      toast({
        title: "Note Created",
        description: "Your observation has been saved successfully."
      });

      resetForms();
      setOpen(false);
      onActivityLogged?.();
    } catch (error: any) {
      console.error('Error creating note:', error);
      
      let errorMessage = "Failed to create note. Please try again.";
      if (error?.message?.includes('not authenticated')) {
        errorMessage = "Authentication failed. Please sign in again.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-vineyard-burgundy text-white"
          disabled={!canLogActivities}
        >
          <Plus className="h-4 w-4 mr-1" /> 
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            {!isAuthenticated ? "Please sign in to log activities." :
             !hasVineyard ? "Please create a vineyard first." :
             `Recording activity for ${currentVineyard?.name}`}
          </DialogDescription>
        </DialogHeader>

        {canLogActivities ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="task">Task</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
            </TabsList>
            
            <TabsContent value="task" className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="Summer pruning"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Details about the activity"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-date" className="text-right">
                  Date *
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !taskDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskDate ? format(taskDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                <Label htmlFor="task-category" className="text-right">
                  Priority
                </Label>
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="note" className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note-type" className="text-right">
                  Type
                </Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observation">Observation</SelectItem>
                    <SelectItem value="weather">Weather Note</SelectItem>
                    <SelectItem value="pest">Pest/Disease</SelectItem>
                    <SelectItem value="general">General Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note-content" className="text-right">
                  Content *
                </Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter your observation or note..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            {!isAuthenticated ? (
              <p>Please sign in to log activities.</p>
            ) : (
              <p>Please create a vineyard in Settings before logging activities.</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {canLogActivities && (
            <Button 
              className="bg-vineyard-burgundy text-white" 
              onClick={activeTab === 'task' ? handleAddTask : handleAddNote}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Log Activity'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};