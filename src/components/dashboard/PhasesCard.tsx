import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhaseEvent, VineyardPhase } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowRight, ArrowUp, ArrowDown, CalendarIcon } from 'lucide-react';

interface PhasesCardProps {
  currentPhase: VineyardPhase;
  nextPhase: VineyardPhase;
  phaseProgress: number;
  phaseHistory: PhaseEvent[];
  daysInPhase: number;
  estimatedDaysRemaining: number;
  trend: 'earlier' | 'later' | 'on-track';
  trendValue: number;
}

export const PhasesCard: React.FC<PhasesCardProps> = ({
  currentPhase,
  nextPhase,
  phaseProgress,
  phaseHistory,
  daysInPhase,
  estimatedDaysRemaining,
  trend,
  trendValue
}) => {
  // Function to get color for phase badge
  const getPhaseColor = (phase: VineyardPhase) => {
    switch (phase) {
      case 'flowering':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'fruitset':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'veraison':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'harvest':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Function to get trend icon and color
  const getTrendInfo = () => {
    if (trend === 'earlier') {
      return {
        icon: <ArrowUp className="h-4 w-4 text-green-600" />,
        text: 'text-green-600',
        description: `${trendValue} days earlier than average`
      };
    } else if (trend === 'later') {
      return {
        icon: <ArrowDown className="h-4 w-4 text-amber-600" />,
        text: 'text-amber-600',
        description: `${trendValue} days later than average`
      };
    } else {
      return {
        icon: <ArrowRight className="h-4 w-4 text-blue-600" />,
        text: 'text-blue-600',
        description: 'On track with average timing'
      };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Growth Phases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Phase */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Phase:</span>
                <Badge className={`${getPhaseColor(currentPhase)} capitalize`}>
                  {currentPhase}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {daysInPhase} days in phase
              </span>
            </div>
            <Progress value={phaseProgress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{phaseProgress}%</span>
            </div>
          </div>

          {/* Next Phase */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Next Phase:</span>
              <Badge variant="outline" className="capitalize">
                {nextPhase}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Est. {estimatedDaysRemaining} days remaining
            </span>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-1 pt-2">
            {trendInfo.icon}
            <span className={`text-xs ${trendInfo.text} font-medium`}>
              {trendInfo.description}
            </span>
          </div>

          {/* Phase History */}
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-medium mb-2">Recent Phase Changes</h4>
            <div className="space-y-2">
              {phaseHistory.slice(0, 3).map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPhaseColor(event.phase as VineyardPhase)} capitalize`}>
                      {event.phase}
                    </Badge>
                    <span className="text-xs">{event.notes.substring(0, 20)}...</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(parseISO(event.date), 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction */}
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-medium mb-1">Harvest Prediction</h4>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {currentPhase === 'flowering' ? 'Oct 5 - Oct 15 (estimated)' : 'Oct 10 (estimated)'}
              </span>
            </div>
            {trendValue > 0 && currentPhase === "flowering" && (
              <p className="text-xs text-muted-foreground mt-1">
                Trending earlier than last year by {trendValue} days
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
