
import React, { useEffect, useRef } from 'react';
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

interface GddChartProps {
  currentSeason: Season;
  pastSeason: Season;
  onPhaseClick: (phase: PhaseEvent) => void;
}

export const GddChart: React.FC<GddChartProps> = ({ currentSeason, pastSeason, onPhaseClick }) => {
  const [showPastSeason, setShowPastSeason] = React.useState(true);
  const [markerPosition, setMarkerPosition] = React.useState<GddPoint | null>(null);
  
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

  // Format data for the chart
  const chartData = currentSeason.gddData.map(point => {
    const pastYearPoint = pastSeason.gddData.find(p => 
      p.date.slice(5) === point.date.slice(5) // Compare month-day only
    );
    
    return {
      date: point.date,
      current: point.value,
      past: pastYearPoint ? pastYearPoint.value : null,
      formattedDate: format(parseISO(point.date), 'MMM d')
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

  // Custom tooltip to show both years
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Safely format the date - first check if it's a valid date string
      let formattedDate = "";
      try {
        const dateObj = parseISO(label);
        if (isValid(dateObj)) {
          formattedDate = format(dateObj, 'MMM d, yyyy');
        } else {
          formattedDate = label; // Fallback to using the label as is
        }
      } catch (error) {
        formattedDate = label; // In case of error, use label as is
      }
      
      return (
        <div className="bg-white p-4 shadow-md rounded-md border">
          <p className="font-medium">{formattedDate}</p>
          <p className="text-vineyard-burgundy">
            {currentSeason.year}: {payload[0].value} GDD
          </p>
          {showPastSeason && payload[1] && payload[1].value && (
            <p className="text-vineyard-soil">
              {pastSeason.year}: {payload[1].value} GDD
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
          <CardTitle>Growing Degree Days</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tracking vine development through heat accumulation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showPastSeason ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPastSeason(!showPastSeason)}
            className={showPastSeason ? "bg-vineyard-soil text-white" : ""}
          >
            Compare with {pastSeason.year}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                stroke="#8B6947"
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
      </CardContent>
    </Card>
  );
};
