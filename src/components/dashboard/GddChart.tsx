
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season, PhaseEvent, GddPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  ReferenceArea,
  Scatter,
  Area
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
  const [showBudbreakMarkers, setShowBudbreakMarkers] = React.useState(true);
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

  // Create modified past season data to fit the requested pattern
  // Slower increase until April, then sharper increase above current season
  const processedPastSeasonData = React.useMemo(() => {
    let maxValue = 0;
    const aprilCutoff = '2024-04-01';
    
    // First pass to ensure monotonically increasing values
    const baseData = pastSeason.gddData.map(point => {
      // Ensure values only increase
      if (point.value < maxValue) {
        return { ...point, value: maxValue };
      } else {
        maxValue = point.value;
        return point;
      }
    });
    
    // Second pass to modify the curve pattern
    return baseData.map(point => {
      const isBeforeApril = point.date < aprilCutoff;
      
      if (isBeforeApril) {
        // Reduce values before April to stay below current season
        const currentSeasonPoint = currentSeason.gddData.find(
          p => p.date.slice(5) === point.date.slice(5) // Compare month-day
        );
        
        if (currentSeasonPoint) {
          // Make sure it's below current season (about 80% of current value)
          return { ...point, value: Math.min(point.value, currentSeasonPoint.value * 0.8) };
        }
        return point;
      } else {
        // After April 1, increase values more sharply
        const daysSinceApril = Math.max(
          0, 
          (new Date(point.date).getTime() - new Date(aprilCutoff).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Boost factor that increases with days since April 1
        const boostFactor = 1 + (daysSinceApril * 0.01);
        
        // Find corresponding current season point
        const currentSeasonPoint = currentSeason.gddData.find(
          p => p.date.slice(5) === point.date.slice(5) // Compare month-day
        );
        
        if (currentSeasonPoint) {
          // Make past season overtake current season after April
          return { 
            ...point, 
            value: Math.max(point.value, currentSeasonPoint.value * boostFactor) 
          };
        }
        return point;
      }
    });
  }, [pastSeason, currentSeason]);

  // Process current season data to ensure monotonically increasing values
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

  // Generate budbreak markers data (March 21 to April 12)
  const budbreakMarkers = React.useMemo(() => {
    const startDate = '2025-03-21';
    const endDate = '2025-04-12';
    
    return currentSeason.gddData
      .filter(point => point.date >= startDate && point.date <= endDate)
      .map(point => ({
        date: point.date,
        value: point.value,
        budbreak: point.value // Add this property for the budbreak area chart
      }));
  }, [currentSeason]);

  // Format data for the chart
  const chartData = processedCurrentSeasonData.map(point => {
    const pastYearPoint = processedPastSeasonData.find(p => 
      p.date.slice(5) === point.date.slice(5) // Compare month-day
    );
    
    // Check if this point is in the budbreak period
    const isBudbreak = budbreakMarkers.some(bm => bm.date === point.date);
    
    return {
      date: point.date,
      current: point.value,
      past: pastYearPoint ? pastYearPoint.value : null,
      // Add budbreak value only for points in the budbreak period
      budbreak: isBudbreak ? point.value : null,
      formattedDate: format(new Date(point.date), 'MMM d')  // Using new Date() for safer parsing
    };
  });

  // Process phenology events for visualization
  const phaseMarkers = currentSeason.events.map(event => {
    const gddPoint = currentSeason.gddData.find(point => point.date === event.date);
    return {
      x: event.date,
      y: gddPoint?.value || 0,
      event
    };
  });
  
  // Process past season phenology events for comparison
  const pastPhaseMarkers = pastSeason.events.map(event => {
    const gddPoint = pastSeason.gddData.find(point => point.date === event.date);
    return {
      x: event.date,
      y: gddPoint?.value || 0,
      event
    };
  });

  // Create phenology stage areas
  const phenologyStages = React.useMemo(() => {
    const phases = ['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'];
    const currentPhases: {phase: string, start: string, end: string | null, gddStart: number, gddEnd: number | null}[] = [];
    const pastPhases: {phase: string, start: string, end: string | null, gddStart: number, gddEnd: number | null}[] = [];
    
    // Process current season phases
    phases.forEach((phase, index) => {
      const phaseEvent = currentSeason.events.find(e => e.phase === phase);
      if (phaseEvent) {
        const nextPhase = phases[index + 1];
        const nextPhaseEvent = nextPhase ? currentSeason.events.find(e => e.phase === nextPhase) : null;
        
        const gddAtPhase = currentSeason.gddData.find(point => point.date === phaseEvent.date)?.value || 0;
        const gddAtNextPhase = nextPhaseEvent 
          ? currentSeason.gddData.find(point => point.date === nextPhaseEvent.date)?.value || null
          : null;
          
        currentPhases.push({
          phase,
          start: phaseEvent.date,
          end: nextPhaseEvent?.date || null,
          gddStart: gddAtPhase,
          gddEnd: gddAtNextPhase
        });
      }
    });
    
    // Process past season phases
    phases.forEach((phase, index) => {
      const phaseEvent = pastSeason.events.find(e => e.phase === phase);
      if (phaseEvent) {
        const nextPhase = phases[index + 1];
        const nextPhaseEvent = nextPhase ? pastSeason.events.find(e => e.phase === nextPhase) : null;
        
        const gddAtPhase = pastSeason.gddData.find(point => point.date === phaseEvent.date)?.value || 0;
        const gddAtNextPhase = nextPhaseEvent 
          ? pastSeason.gddData.find(point => point.date === nextPhaseEvent.date)?.value || null
          : null;
          
        pastPhases.push({
          phase,
          start: phaseEvent.date,
          end: nextPhaseEvent?.date || null,
          gddStart: gddAtPhase,
          gddEnd: gddAtNextPhase
        });
      }
    });
    
    return { currentPhases, pastPhases };
  }, [currentSeason, pastSeason]);

  // Get phase colors for visualization
  const getPhaseColor = (phase: string, isCurrentSeason: boolean) => {
    const baseColors = {
      budbreak: '#F0E68C',  // Light yellow
      flowering: '#98FB98',  // Pale green
      fruitset: '#87CEFA',  // Light sky blue
      veraison: '#DDA0DD',  // Plum
      harvest: '#F4A460',   // Sandy brown
    };
    
    const color = baseColors[phase as keyof typeof baseColors] || '#E0E0E0';
    
    // Make past season colors more transparent/muted
    return isCurrentSeason ? color : `${color}80`;  // Adding 80 for 50% opacity
  };

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
      // Format the date without the year as requested
      let formattedDate = "";
      try {
        // Ensure we're parsing a valid date
        const dateObj = new Date(label);
        if (isValid(dateObj)) {
          formattedDate = format(dateObj, 'MMM d'); // Removed the year as requested
        } else {
          formattedDate = label; // Fallback to using the label as is
        }
      } catch (error) {
        console.error("Date formatting error:", error);
        formattedDate = label; // In case of error, use label as is
      }

      // Get phenology stage if available
      const phenologyStage = getPhenologyStage(label);
      
      // Compare with past season
      const currentDateValue = payload[0]?.value;
      const pastDateValue = payload[1]?.value;
      
      let comparisonText = "";
      if (showPastSeason && currentDateValue && pastDateValue) {
        const diff = currentDateValue - pastDateValue;
        if (Math.abs(diff) > 5) {
          comparisonText = diff > 0 
            ? `${Math.round(diff)} GDD ahead of ${pastSeason.year}`
            : `${Math.round(Math.abs(diff))} GDD behind ${pastSeason.year}`;
        }
      }
      
      // Check if this is a budbreak point
      const isBudbreak = showBudbreakMarkers && budbreakMarkers.some(marker => marker.date === label);
      
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
          {isBudbreak && (
            <p className="text-emerald-600 font-bold">
              Budbreak period
            </p>
          )}
          {phenologyStage && (
            <p className="mt-2 text-vineyard-leaf font-medium capitalize">
              {phenologyStage} phase
            </p>
          )}
          {comparisonText && (
            <p className="mt-1 text-sm font-medium">
              {comparisonText}
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
            Tracking vine development to harvest
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="show-budbreak" 
              checked={showBudbreakMarkers} 
              onCheckedChange={setShowBudbreakMarkers}
            />
            <label htmlFor="show-budbreak" className="text-sm cursor-pointer flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full"></span>
              Budbreak
            </label>
          </div>
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
            
            {/* Phase reference areas for current season */}
            {phenologyStages.currentPhases.map((phase, index) => (
              phase.end && (
                <ReferenceArea
                  key={`current-phase-${index}`}
                  x1={phase.start}
                  x2={phase.end}
                  y1={0}
                  y2={phase.gddEnd || 'dataMax'}
                  fill={getPhaseColor(phase.phase, true)}
                  fillOpacity={0.15}
                  strokeOpacity={0.3}
                  stroke="#000"
                  strokeDasharray="3 3"
                />
              )
            ))}
            
            {/* Phase markers for current season */}
            {phaseMarkers.map((marker, index) => (
              <ReferenceArea
                key={`current-phase-marker-${index}`}
                x1={marker.x}
                x2={marker.x}
                y1={0}
                y2={marker.y}
                fillOpacity={0}
                stroke="#5A7247"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            ))}
            
            {/* Phase labels for current season */}
            {phaseMarkers.map((marker, index) => (
              <ReferenceLine
                key={`current-phase-label-${index}`}
                x={marker.x}
                stroke="none"
                label={{
                  value: `${marker.event.phase} (2025)`,
                  position: 'top',
                  fill: '#5A7247',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* Add past season phase markers if showing comparison */}
            {showPastSeason && pastPhaseMarkers.map((marker, index) => (
              <ReferenceArea
                key={`past-phase-marker-${index}`}
                x1={marker.x}
                x2={marker.x}
                y1={0}
                y2={marker.y}
                fillOpacity={0}
                stroke="#9b87f5"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ))}
            
            {/* Phase labels for past season */}
            {showPastSeason && pastPhaseMarkers.map((marker, index) => (
              <ReferenceLine
                key={`past-phase-label-${index}`}
                x={marker.x}
                stroke="none"
                label={{
                  value: `${marker.event.phase} (2024)`,
                  position: 'insideBottomLeft',
                  fill: '#9b87f5',
                  fontSize: 10
                }}
              />
            ))}
            
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
                strokeDasharray="0" 
                dot={false}
              />
            )}
            
            {/* Budbreak highlight area */}
            {showBudbreakMarkers && (
              <Area
                type="monotone"
                dataKey="budbreak"
                name="Budbreak Period"
                stroke="#4CAF50"
                fill="#4CAF5033"
                fillOpacity={0.5}
                activeDot={false}
                legendType="none"
              />
            )}
            
            {/* Improved Budbreak markers (green circles) */}
            {showBudbreakMarkers && budbreakMarkers.map((entry, index) => (
              <ReferenceDot
                key={`budbreak-${index}`}
                x={entry.date}
                y={entry.value}
                r={8}
                fill="#4CAF50"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
            
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
            
            {/* Past season phase event markers */}
            {showPastSeason && pastPhaseMarkers.map((marker, index) => (
              <ReferenceDot
                key={`past-${index}`}
                x={marker.x}
                y={marker.y}
                r={4}
                fill="#9b87f5"
                stroke="#ffffff"
                strokeWidth={1}
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
