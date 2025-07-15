
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Season, PhaseEvent, GddPoint } from '@/types';
import { createPhenologyEvent, createTask } from '@/integrations/supabase/api';
import { useVineyard } from '@/hooks/useVineyard';

interface EnhancedGDDChartProps {
  currentSeason: Season;
  pastSeason: Season;
  onPhaseClick: (phase: PhaseEvent) => void;
}

interface PhenologyEvent {
  id: string;
  startDate: string;
  endDate: string;
  phase: string;
  gdd: number;
  notes: string;
  block?: string;
}

export const EnhancedGDDChart: React.FC<EnhancedGDDChartProps> = ({ 
  currentSeason, 
  pastSeason, 
  onPhaseClick 
}) => {
  const { currentVineyard } = useVineyard();
  const [phenologyEvents, setPhenologyEvents] = useState<PhenologyEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventType, setEventType] = useState<'phenology' | 'task'>('phenology');
  const [loading, setLoading] = useState(false);
  
  // Phenology event state
  const [phenologyData, setPhenologyData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    phase: '',
    notes: '',
    block: ''
  });
  
  // Task state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    category: ''
  });
  
  const { toast } = useToast();

  // Process GDD data to ensure monotonic increase
  const processedCurrentSeasonData = React.useMemo(() => {
    let maxValue = 0;
    return currentSeason.gddData.map(point => {
      if (point.value < maxValue) {
        return { ...point, value: maxValue };
      } else {
        maxValue = point.value;
        return point;
      }
    });
  }, [currentSeason]);

  // Chart dimensions
  const width = 800;
  const height = 350;
  const padding = 60;

  // Create chart data
  const chartData = processedCurrentSeasonData.map(point => ({
    date: point.date,
    cumulativeGDD: point.value,
    formattedDate: format(new Date(point.date), 'MMM d')
  }));

  const maxGDD = Math.max(...chartData.map(d => d.cumulativeGDD));
  const minGDD = Math.min(...chartData.map(d => d.cumulativeGDD));

  // Create SVG path for GDD line
  const pathData = chartData
    .map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.cumulativeGDD - minGDD) / (maxGDD - minGDD)) * (height - 2 * padding);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Handle chart click to add event
  const handleChartClick = useCallback((event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Calculate which date was clicked
    const clickPosition = (x - padding) / (width - 2 * padding);
    const dataIndex = Math.round(clickPosition * (chartData.length - 1));

    if (dataIndex >= 0 && dataIndex < chartData.length) {
      const clickedDate = new Date(chartData[dataIndex].date);
      setPhenologyData({
        startDate: clickedDate,
        endDate: clickedDate,
        phase: '',
        notes: '',
        block: ''
      });
      setTaskData({
        title: '',
        description: '',
        dueDate: clickedDate,
        category: ''
      });
      setIsDialogOpen(true);
    }
  }, [chartData]);

  // Add phenology event
  const handleAddPhenologyEvent = async () => {
    if (!currentVineyard) {
      toast({
        title: "Error",
        description: "Please select a vineyard first",
        variant: "destructive"
      });
      return;
    }

    if (!phenologyData.phase) {
      toast({
        title: "Error",
        description: "Please select a phenology phase",
        variant: "destructive"
      });
      return;
    }

    if (!phenologyData.startDate || !phenologyData.endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const startDateStr = format(phenologyData.startDate, 'yyyy-MM-dd');
      const endDateStr = format(phenologyData.endDate, 'yyyy-MM-dd');
      
      await createPhenologyEvent({
        vineyard_id: currentVineyard.id,
        event_type: phenologyData.phase,
        event_date: startDateStr,
        end_date: endDateStr,
        notes: phenologyData.notes,
        harvest_block: phenologyData.block
      });

      const gddAtDate = processedCurrentSeasonData.find(point => point.date === startDateStr)?.value || 0;
      const event: PhenologyEvent = {
        id: `event-${Date.now()}`,
        startDate: startDateStr,
        endDate: endDateStr,
        phase: phenologyData.phase,
        gdd: gddAtDate,
        notes: phenologyData.notes,
        block: phenologyData.block
      };

      setPhenologyEvents(prev => [...prev, event]);
      setIsDialogOpen(false);
      
      const dateRange = startDateStr === endDateStr 
        ? format(phenologyData.startDate, 'MMM d')
        : `${format(phenologyData.startDate, 'MMM d')} - ${format(phenologyData.endDate, 'MMM d')}`;

      toast({
        title: "Phenology Event Added",
        description: `${phenologyData.phase} event recorded for ${dateRange}`
      });
    } catch (error) {
      console.error('Error creating phenology event:', error);
      toast({
        title: "Error",
        description: "Failed to save phenology event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add task
  const handleAddTask = async () => {
    if (!currentVineyard) {
      toast({
        title: "Error",
        description: "Please select a vineyard first",
        variant: "destructive"
      });
      return;
    }

    if (!taskData.title || !taskData.description) {
      toast({
        title: "Error",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createTask({
        vineyard_id: currentVineyard.id,
        title: taskData.title,
        description: taskData.description,
        due_date: format(taskData.dueDate, 'yyyy-MM-dd'),
        priority: taskData.category || 'medium'
      });

      setIsDialogOpen(false);
      
      toast({
        title: "Task Added",
        description: `${taskData.title} scheduled for ${format(taskData.dueDate, 'MMM d')}`
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get phase color
  const getPhaseColor = (phase: string) => {
    const colors = {
      'budbreak': '#22c55e',
      'flowering': '#f59e0b',
      'fruit-set': '#87ceeb',
      'veraison': '#8b5cf6',
      'harvest': '#ef4444',
      'dormancy': '#708090'
    };
    return colors[phase as keyof typeof colors] || '#94a3b8';
  };

  // Get phase emoji
  const getPhaseEmoji = (phase: string) => {
    const emojis = {
      'budbreak': '🌱',
      'flowering': '🌸',
      'fruit-set': '🌿',
      'veraison': '🍇',
      'harvest': '🍷',
      'dormancy': '🌙'
    };
    return emojis[phase as keyof typeof emojis] || '📍';
  };

  // Handle start date change and update end date
  const handlePhenologyStartDateChange = (date: Date | undefined) => {
    if (date) {
      setPhenologyData(prev => ({
        ...prev,
        startDate: date,
        endDate: date // Default end date to same as start date
      }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Growth Curve</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on the chart to add phenology events
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            
            <Tabs value={eventType} onValueChange={(value) => setEventType(value as 'phenology' | 'task')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phenology">Phenology Event</TabsTrigger>
                <TabsTrigger value="task">Vineyard Task</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phenology" className="space-y-4">
                <div>
                  <Label htmlFor="pheno-start-date">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !phenologyData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {phenologyData.startDate ? format(phenologyData.startDate, "PPP") : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={phenologyData.startDate}
                        onSelect={handlePhenologyStartDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="pheno-end-date">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !phenologyData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {phenologyData.endDate ? format(phenologyData.endDate, "PPP") : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={phenologyData.endDate}
                        onSelect={(date) => date && setPhenologyData({...phenologyData, endDate: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="phase">Phenology Phase *</Label>
                  <Select onValueChange={(value) => setPhenologyData({...phenologyData, phase: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budbreak">Budbreak</SelectItem>
                      <SelectItem value="flowering">Flowering</SelectItem>
                      <SelectItem value="fruit-set">Fruit Set</SelectItem>
                      <SelectItem value="veraison">Veraison</SelectItem>
                      <SelectItem value="harvest">Harvest</SelectItem>
                      <SelectItem value="dormancy">Dormancy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="block">Block (Optional)</Label>
                  <Input
                    id="block"
                    value={phenologyData.block}
                    onChange={(e) => setPhenologyData({...phenologyData, block: e.target.value})}
                    placeholder="e.g., Block A"
                  />
                </div>

                <div>
                  <Label htmlFor="pheno-notes">Notes</Label>
                  <Textarea
                    id="pheno-notes"
                    value={phenologyData.notes}
                    onChange={(e) => setPhenologyData({...phenologyData, notes: e.target.value})}
                    placeholder="Additional observations..."
                    rows={3}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="task" className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={taskData.title}
                    onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                    placeholder="Summer pruning"
                  />
                </div>

                <div>
                  <Label htmlFor="task-description">Description *</Label>
                  <Textarea
                    id="task-description"
                    value={taskData.description}
                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                    placeholder="Detailed task description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="task-date">Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !taskData.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskData.dueDate ? format(taskData.dueDate, "PPP") : <span>Pick due date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={taskData.dueDate}
                        onSelect={(date) => date && setTaskData({...taskData, dueDate: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="task-category">Category</Label>
                  <Select onValueChange={(value) => setTaskData({...taskData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pruning">Pruning</SelectItem>
                      <SelectItem value="spraying">Spraying/Treatment</SelectItem>
                      <SelectItem value="canopy">Canopy Management</SelectItem>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="harvesting">Harvesting</SelectItem>
                      <SelectItem value="soil">Soil Management</SelectItem>
                      <SelectItem value="equipment">Equipment Maintenance</SelectItem>
                      <SelectItem value="pest">Pest Control</SelectItem>
                      <SelectItem value="fertilizing">Fertilizing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={eventType === 'phenology' ? handleAddPhenologyEvent : handleAddTask}
                disabled={loading}
              >
                {loading ? 'Saving...' : `Add ${eventType === 'phenology' ? 'Event' : 'Task'}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="bg-white rounded-lg border overflow-auto">
          <svg
            width={width}
            height={height}
            style={{ maxWidth: "100%", cursor: "crosshair" }}
            onClick={handleChartClick}
          >
            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 30"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#333"
              strokeWidth="2"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#333"
              strokeWidth="2"
            />

            {/* Y-axis labels */}
            <text
              x={padding - 10}
              y={padding + 5}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {Math.round(maxGDD)}°F
            </text>
            <text
              x={padding - 10}
              y={height - padding + 5}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {Math.round(minGDD)}°F
            </text>

            {/* X-axis date labels */}
            {chartData
              .filter((_, index) => index % 30 === 0)
              .map((point, index) => {
                const dataIndex = chartData.indexOf(point);
                const x = padding + (dataIndex / (chartData.length - 1)) * (width - 2 * padding);
                return (
                  <text
                    key={index}
                    x={x}
                    y={height - padding + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                  >
                    {point.formattedDate}
                  </text>
                );
              })}

            {/* Phenology Events */}
            {phenologyEvents.map((event, index) => {
              const startDataIndex = chartData.findIndex(d => d.date === event.startDate);
              const endDataIndex = chartData.findIndex(d => d.date === event.endDate);
              
              if (startDataIndex === -1) return null;

              const startX = padding + (startDataIndex / (chartData.length - 1)) * (width - 2 * padding);
              const endX = endDataIndex !== -1 ? padding + (endDataIndex / (chartData.length - 1)) * (width - 2 * padding) : startX;
              const color = getPhaseColor(event.phase);
              const emoji = getPhaseEmoji(event.phase);

              return (
                <g key={index}>
                  {/* Date range background (if multi-day event) */}
                  {startX !== endX && (
                    <rect
                      x={startX}
                      y={padding}
                      width={endX - startX}
                      height={height - 2 * padding}
                      fill={color}
                      opacity="0.1"
                    />
                  )}
                  
                  {/* Vertical line at start */}
                  <line
                    x1={startX}
                    y1={padding}
                    x2={startX}
                    y2={height - padding}
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Vertical line at end (if different from start) */}
                  {startX !== endX && (
                    <line
                      x1={endX}
                      y1={padding}
                      x2={endX}
                      y2={height - padding}
                      stroke={color}
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                  )}
                  
                  {/* Event marker */}
                  <circle
                    cx={startX}
                    cy={padding - 15}
                    r="8"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onPhaseClick({
                      id: event.id,
                      date: event.startDate,
                      phase: event.phase as any,
                      notes: event.notes
                    })}
                  />
                  {/* Event emoji */}
                  <text
                    x={startX}
                    y={padding - 10}
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {emoji}
                  </text>
                </g>
              );
            })}

            {/* GDD Line */}
            <path d={pathData} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />

            {/* Recent data points */}
            {chartData.slice(-6).map((point, index) => {
              const dataIndex = chartData.indexOf(point);
              const x = padding + (dataIndex / (chartData.length - 1)) * (width - 2 * padding);
              const y = height - padding - ((point.cumulativeGDD - minGDD) / (maxGDD - minGDD)) * (height - 2 * padding);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

            {/* Chart Title */}
            <text
              x={width / 2}
              y={25}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#333"
            >
              Cumulative Growing Degree Days
            </text>
          </svg>
        </div>
        
        {/* Event summary */}
        {phenologyEvents.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Recorded Events ({phenologyEvents.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {phenologyEvents.map((event) => {
                const dateRange = event.startDate === event.endDate 
                  ? format(new Date(event.startDate), 'MMM d')
                  : `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d')}`;
                
                return (
                  <div key={event.id} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPhaseColor(event.phase) }}
                    />
                    <span className="font-medium">{event.phase}</span>
                    <span className="text-muted-foreground">
                      {dateRange}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
