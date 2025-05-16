
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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TaskItem, NoteItem, VineyardBlock, PhaseEvent } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuickActionsProps {
  blocks: VineyardBlock[];
  onAddTask?: (task: TaskItem) => void;
  onAddNote?: (note: NoteItem) => void;
  onRecordPhase?: (phase: PhaseEvent) => void;
  currentPhase?: string;
  nextPhase?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  blocks, 
  onAddTask, 
  onAddNote, 
  onRecordPhase,
  currentPhase = 'flowering',
  nextPhase = 'fruitset'
}) => {
  const [taskNoteOpen, setTaskNoteOpen] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState(false);
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

  // Phase form state
  const [phaseAction, setPhaseAction] = useState<'endCurrent' | 'startNext'>('endCurrent');
  const [phaseNotes, setPhaseNotes] = useState('');
  const [phaseDate, setPhaseDate] = useState<Date | undefined>(new Date());

  const handleAddTask = () => {
    if (!taskTitle || !taskDate || !taskCategory || !taskBlock) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      blockId: taskBlock,
      date: format(taskDate, 'yyyy-MM-dd'),
      completed: false,
      category: taskCategory as any,
    };

    if (onAddTask) {
      onAddTask(newTask);
    }

    toast({
      title: "Task Created",
      description: `${taskTitle} has been added to your tasks.`
    });

    // Reset form
    setTaskTitle('');
    setTaskDescription('');
    setTaskDate(new Date());
    setTaskCategory('');
    setTaskBlock('');
    setTaskNoteOpen(false);
  };

  const handleAddNote = () => {
    if (!noteContent || !noteBlock) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const tags = noteTags.split(',').map(tag => tag.trim()).filter(tag => tag);

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
      description: "Your note has been saved."
    });

    // Reset form
    setNoteContent('');
    setNoteTags('');
    setNoteBlock('');
    setTaskNoteOpen(false);
  };

  const handleRecordPhase = () => {
    if (!phaseNotes) {
      toast({
        title: "Missing Fields",
        description: "Please add some notes about the phase change.",
        variant: "destructive"
      });
      return;
    }

    const phase = phaseAction === 'endCurrent' ? currentPhase : nextPhase;
    const action = phaseAction === 'endCurrent' ? 'ended' : 'started';
    
    const newPhase: PhaseEvent = {
      id: `phase-${Date.now()}`,
      phase: phase as any,
      date: phaseDate ? format(phaseDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      notes: phaseNotes
    };

    if (onRecordPhase) {
      onRecordPhase(newPhase);
    }

    toast({
      title: "Phase Recorded",
      description: `${phase.charAt(0).toUpperCase() + phase.slice(1)} ${action} on ${phaseDate ? format(phaseDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy')}.`
    });

    // Reset form
    setPhaseNotes('');
    setPhaseDate(new Date());
    setPhaseOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Add Task/Note Dialog */}
      <Dialog open={taskNoteOpen} onOpenChange={setTaskNoteOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-vineyard-burgundy text-white">
            <Plus className="h-5 w-5 mr-1" /> Add Task or Note
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <Tabs value={actionType} onValueChange={setActionType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="task">Task</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
            </TabsList>
            <TabsContent value="task">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new vineyard task to track your work.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task-title" className="text-right">
                    Title
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
                    Description
                  </Label>
                  <Textarea
                    id="task-description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Details about the task"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task-date" className="text-right">
                    Date
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
                  <Label htmlFor="task-category" className="text-right">
                    Category
                  </Label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task-block" className="text-right">
                    Block
                  </Label>
                  <Select value={taskBlock} onValueChange={setTaskBlock}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select vineyard block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map(block => (
                        <SelectItem key={block.id} value={block.id}>
                          {block.name} - {block.variety}
                        </SelectItem>
                      ))}
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
                  Create Task
                </Button>
              </DialogFooter>
            </TabsContent>
            <TabsContent value="note">
              <DialogHeader>
                <DialogTitle>Add Vineyard Note</DialogTitle>
                <DialogDescription>
                  Record observations, thoughts, or any information about your vineyard.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note-content" className="text-right">
                    Note
                  </Label>
                  <Textarea
                    id="note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="col-span-3"
                    placeholder="Write your observations here..."
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note-tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="note-tags"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="col-span-3"
                    placeholder="irrigation, berries, etc. (comma separated)"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note-block" className="text-right">
                    Block
                  </Label>
                  <Select value={noteBlock} onValueChange={setNoteBlock}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select vineyard block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map(block => (
                        <SelectItem key={block.id} value={block.id}>
                          {block.name} - {block.variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTaskNoteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote}>Create Note</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Record Phase Dialog */}
      <Dialog open={phaseOpen} onOpenChange={setPhaseOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-5 w-5 mr-1" /> Record Phase
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Growth Phase</DialogTitle>
            <DialogDescription>
              Track key vineyard development stages.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-action" className="text-right">
                Action
              </Label>
              <Select value={phaseAction} onValueChange={(value) => setPhaseAction(value as 'endCurrent' | 'startNext')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endCurrent">End Current Phase ({currentPhase})</SelectItem>
                  <SelectItem value="startNext">Start Next Phase ({nextPhase})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !phaseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {phaseDate ? format(phaseDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={phaseDate}
                      onSelect={setPhaseDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phase-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="phase-notes"
                value={phaseNotes}
                onChange={(e) => setPhaseNotes(e.target.value)}
                className="col-span-3"
                placeholder="Describe observations about this phase change..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhaseOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPhase}>Record Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
