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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Season, PhaseEvent, GddPoint } from '@/types';

interface EnhancedGDDChartProps {
  currentSeason: Season;
  pastSeason: Season;
  onPhaseClick: (phase: PhaseEvent) => void;
}

interface PhenologyEvent {
  id: string;
  date: string;
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
  const [phenologyEvents, setPhenologyEvents] = useState<PhenologyEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: new Date(),
    phase: '',
    notes: '',
    block: ''
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

  // Handle chart click to add phenology event
  const handleChartClick = useCallback((event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Calculate which date was clicked
    const clickPosition = (x - padding) / (width - 2 * padding);
    const dataIndex = Math.round(clickPosition * (chartData.length - 1));

    if (dataIndex >= 0 && dataIndex < chartData.length) {
      const clickedDate = new Date(chartData[dataIndex].date);
      setNewEvent({
        date: clickedDate,
        phase: '',
        notes: '',
        block: ''
      });
      setIsDialogOpen(true);
    }
  }, [chartData]);

  // Add phenology event
  const handleAddEvent = () => {
    if (!newEvent.phase) {
      toast({
        title: "Error",
        description: "Please select a phenology phase",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(newEvent.date, 'yyyy-MM-dd');
    const gddAtDate = processedCurrentSeasonData.find(point => point.date === dateStr)?.value || 0;

    const event: PhenologyEvent = {
      id: `event-${Date.now()}`,
      date: dateStr,
      phase: newEvent.phase,
      gdd: gddAtDate,
      notes: newEvent.notes,
      block: newEvent.block
    };

    setPhenologyEvents(prev => [...prev, event]);
    setIsDialogOpen(false);
    setNewEvent({
      date: new Date(),
      phase: '',
      notes: '',
      block: ''
    });

    toast({
      title: "Event Added",
      description: `${newEvent.phase} event recorded for ${format(newEvent.date, 'MMM d')}`
    });
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Phenology Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEvent.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.date ? format(newEvent.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => date && setNewEvent({...newEvent, date})}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="phase">Phenology Phase</Label>
                <Select onValueChange={(value) => setNewEvent({...newEvent, phase: value})}>
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
                  value={newEvent.block}
                  onChange={(e) => setNewEvent({...newEvent, block: e.target.value})}
                  placeholder="e.g., Block A"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                  placeholder="Additional observations..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>
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
              const dataIndex = chartData.findIndex(d => d.date === event.date);
              if (dataIndex === -1) return null;

              const x = padding + (dataIndex / (chartData.length - 1)) * (width - 2 * padding);
              const color = getPhaseColor(event.phase);
              const emoji = getPhaseEmoji(event.phase);

              return (
                <g key={index}>
                  {/* Vertical line */}
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  {/* Event marker */}
                  <circle
                    cx={x}
                    cy={padding - 15}
                    r="8"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onPhaseClick({
                      id: event.id,
                      date: event.date,
                      phase: event.phase as any,
                      notes: event.notes
                    })}
                  />
                  {/* Event emoji */}
                  <text
                    x={x}
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
              {phenologyEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPhaseColor(event.phase) }}
                  />
                  <span className="font-medium">{event.phase}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(event.date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};