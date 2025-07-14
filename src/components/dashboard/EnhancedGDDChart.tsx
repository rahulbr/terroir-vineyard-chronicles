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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
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

  // Chart data with phenology events
  const chartData = processedCurrentSeasonData.map(point => {
    const dateStr = point.date;
    const eventAtDate = phenologyEvents.find(e => e.date === dateStr);
    
    return {
      date: point.date,
      gdd: point.value,
      formattedDate: format(new Date(point.date), 'MMM d'),
      hasEvent: !!eventAtDate,
      eventPhase: eventAtDate?.phase || null
    };
  });

  // Handle chart click to add phenology event
  const handleChartClick = useCallback((data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      const clickedDate = new Date(clickedData.date);
      const gddValue = clickedData.gdd;
      
      setNewEvent({
        date: clickedDate,
        phase: '',
        notes: '',
        block: ''
      });
      setIsDialogOpen(true);
    }
  }, []);

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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const event = phenologyEvents.find(e => e.date === data.date);
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-medium">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-primary">
            GDD: {payload[0]?.value}
          </p>
          {event && (
            <div className="mt-2 p-2 bg-muted rounded">
              <p className="font-medium text-sm text-primary">{event.phase}</p>
              {event.notes && <p className="text-xs text-muted-foreground">{event.notes}</p>}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Get phase color
  const getPhaseColor = (phase: string) => {
    const colors = {
      'budbreak': '#8fbc8f',
      'flowering': '#ffd700',
      'fruit-set': '#87ceeb',
      'veraison': '#dda0dd',
      'harvest': '#cd853f',
      'dormancy': '#708090'
    };
    return colors[phase as keyof typeof colors] || '#94a3b8';
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
      
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              interval={10}
            />
            <YAxis
              domain={[0, 'dataMax + 100']}
              label={{
                value: 'Growing Degree Days',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Main GDD line */}
            <Line
              type="monotone"
              dataKey="gdd"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Cumulative GDD"
            />

            {/* Phenology event markers */}
            {phenologyEvents.map((event) => {
              const chartPoint = chartData.find(point => point.date === event.date);
              if (!chartPoint) return null;
              
              return (
                <ReferenceDot
                  key={event.id}
                  x={chartPoint.formattedDate}
                  y={event.gdd}
                  r={6}
                  fill={getPhaseColor(event.phase)}
                  stroke="white"
                  strokeWidth={2}
                  onClick={() => onPhaseClick({
                    id: event.id,
                    date: event.date,
                    phase: event.phase as any,
                    notes: event.notes
                  })}
                />
              );
            })}

            {/* Phase labels */}
            {phenologyEvents.map((event) => {
              const chartPoint = chartData.find(point => point.date === event.date);
              if (!chartPoint) return null;
              
              return (
                <ReferenceLine
                  key={`label-${event.id}`}
                  x={chartPoint.formattedDate}
                  stroke="none"
                  label={{
                    value: event.phase,
                    position: 'top',
                    fill: getPhaseColor(event.phase),
                    fontSize: 10
                  }}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
        
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