
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season, PhaseEvent, GddPoint } from '@/types';
import { Button } from '@/components/ui/button';
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
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { Info } from 'lucide-react';

interface GddChartProps {
  currentSeason: Season;
  pastSeason: Season;
  onPhaseClick: (phase: PhaseEvent) => void;
}

export const GddChart: React.FC<GddChartProps> = ({ currentSeason, pastSeason, onPhaseClick }) => {
  const [showPastSeason, setShowPastSeason] = React.useState(true);
  const [markerPosition, setMarkerPosition] = React.useState<GddPoint | null>(null);
  const [lastUpdated] = useState<string>(new Date().toISOString());
  
  // Find the most recent GDD point for the current marker
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const mostRecentGdd = currentSeason.gddData
      .filter(point => point.date <= today)
      .pop();
    
    if (mostRecentGdd) {
      setMarkerPosition(mostRecentGdd);
    }
  }, [currentSeason]);

  // Pre-process past season data to ensure monotonically increasing values
  const processedPastSeasonData = React.useMemo(() => {
    let maxValue = 0;
    return pastSeason.gddData.map(point => {
      // Ensure values only increase
      if (point.value < maxValue) {
        return { ...point, value: maxValue };
      } else {
        maxValue = point.value;
        return point;
      }
    });
  }, [pastSeason]);

  // Pre-process current season data to ensure monotonically increasing values
  const processedCurrentSeasonData = React.useMemo(() => {
    let maxValue = 0;
    return currentSeason.gddData.map(point => {
      // Ensure values only increase
      if (point.value < maxValue) {
        return { ...point, value: maxValue };
      } else {
        maxValue = point.value;
        return point;
      }
    });
  }, [currentSeason]);

  // Format data for the chart
  const chartData = processedCurrentSeasonData.map(point => {
    const pastYearPoint = processedPastSeasonData.find(p => 
      p.date.slice(5) === point.date.slice(5) // Compare month-day only
    );
    
    return {
      date: point.date,
      current: point.value,
      past: pastYearPoint ? pastYearPoint.value : null,
      formattedDate: format(new Date(point.date), 'MMM d')  // Using new Date() for safer parsing
    };
  });

  // Find events to display on the chart
  const phaseMarkers = currentSeason.events.map(event => {
    const gddPoint = currentSeason.gddData.find(point => point.date === event.date);
    return {
      x: event.date,
      y: gddPoint?.value || 0,
      event
    };
  });

  // Function to find phenology stage for a specific date
  const getPhenologyStage = (date: string): string | null => {
    // Map dates to phases based on the events data
    const phaseStarts: Record<string, { phase: string, end: string | null }> = {};
    
    // First pass: set all phase start dates
    currentSeason.events.forEach(event => {
      if (['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'].includes(event.phase)) {
        phaseStarts[event.date] = { phase: event.phase, end: null };
      }
    });
    
    // Set phase end dates
    // We know that bud break ended on April 11
    const budbreakEvent = currentSeason.events.find(e => e.phase === 'budbreak');
    if (budbreakEvent) {
      phaseStarts[budbreakEvent.date].end = '2025-04-11';
    }
    
    // The rest are either still ongoing or haven't started
    const floweringEvent = currentSeason.events.find(e => e.phase === 'flowering');
    if (floweringEvent) {
      phaseStarts[floweringEvent.date].end = null; // Still ongoing
    }
    
    // Now determine which phase a given date belongs to
    try {
      const dateObj = new Date(date);
      if (!isValid(dateObj)) return null;
      
      // Sort events by date
      const sortedDates = Object.keys(phaseStarts).sort();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const startDate = sortedDates[i];
        const endDate = phaseStarts[startDate].end;
        const nextStartDate = sortedDates[i + 1];
        
        const isAfterStart = dateObj >= new Date(startDate);
        const isBeforeEnd = !endDate || dateObj <= new Date(endDate);
        const isBeforeNextPhase = !nextStartDate || dateObj < new Date(nextStartDate);
        
        if (isAfterStart && isBeforeEnd && isBeforeNextPhase) {
          return phaseStarts[startDate].phase;
        }
      }
    } catch (error) {
      console.error("Error determining phenology stage:", error);
      return null;
    }
    
    return null;
  };

  // Custom tooltip to show both years and phenology stage if applicable
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Safely format the date - first check if it's a valid date string
      let formattedDate = "";
      try {
        // Ensure we're parsing a valid date
        const dateObj = new Date(label);
        if (isValid(dateObj)) {
          formattedDate = format(dateObj, 'MMM d, yyyy');
        } else {
          formattedDate = label; // Fallback to using the label as is
        }
      } catch (error) {
        console.error("Date formatting error:", error);
        formattedDate = label; // In case of error, use label as is
      }

      // Get phenology stage if available
      const phenologyStage = getPhenologyStage(label);
      
      return (
        <div className="bg-white p-4 shadow-md rounded-md border">
          <p className="font-medium">{formattedDate}</p>
          <p className="text-vineyard-burgundy">
            {currentSeason.year}: {payload[0]?.value} GDD
          </p>
          {showPastSeason && payload[1] && payload[1].value && (
            <p className="text-purple-600">
              {pastSeason.year}: {payload[1].value} GDD
            </p>
          )}
          {phenologyStage && (
            <p className="mt-2 text-vineyard-leaf font-medium capitalize">
              {phenologyStage} phase
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Growth Curve</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tracking vine development through heat accumulation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showPastSeason ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPastSeason(!showPastSeason)}
            className={showPastSeason ? "bg-purple-600 text-white" : ""}
          >
            Compare with {pastSeason.year}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="formattedDate"
              tickFormatter={(value) => value}
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
            <Legend align="right" verticalAlign="top" />
            <Line
              type="monotone"
              dataKey="current"
              name={`${currentSeason.year} Season`}
              stroke="#7D2933"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8 }}
            />
            {showPastSeason && (
              <Line
                type="monotone"
                dataKey="past"
                name={`${pastSeason.year} Season`}
                stroke="#9b87f5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            
            {/* Current position marker */}
            {markerPosition && (
              <ReferenceDot
                x={markerPosition.date}
                y={markerPosition.value}
                r={8}
                fill="#D0A640"
                stroke="#7D2933"
                strokeWidth={2}
                className="gdd-marker"
              />
            )}
            
            {/* Phase events markers */}
            {phaseMarkers.map((marker, index) => (
              <ReferenceDot
                key={index}
                x={marker.x}
                y={marker.y}
                r={6}
                fill="#5A7247"
                stroke="#ffffff"
                strokeWidth={2}
                onClick={() => onPhaseClick(marker.event)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-muted-foreground flex items-center justify-end absolute bottom-4 right-6">
          <Info className="h-3 w-3 mr-1" />
          Weather data last updated at {format(parseISO(lastUpdated), 'MMM d, yyyy h:mm a')}
        </div>
      </CardContent>
    </Card>
  );
};
