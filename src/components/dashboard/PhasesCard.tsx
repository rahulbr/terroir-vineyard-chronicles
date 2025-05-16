
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhaseEvent, VineyardPhase, Season } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowRight, ArrowUp, ArrowDown, CalendarIcon } from 'lucide-react';

interface PhasesCardProps {
  currentPhase?: VineyardPhase;
  nextPhase?: VineyardPhase;
  phaseProgress?: number;
  phaseHistory?: PhaseEvent[];
  daysInPhase?: number;
  estimatedDaysRemaining?: number;
  trend?: 'earlier' | 'later' | 'on-track';
  trendValue?: number;
  currentSeason?: Season;
  pastSeason?: Season;
}

export const PhasesCard: React.FC<PhasesCardProps> = ({
  currentSeason,
  pastSeason,
  currentPhase: propCurrentPhase,
  nextPhase: propNextPhase,
  phaseProgress: propPhaseProgress,
  phaseHistory: propPhaseHistory,
  daysInPhase: propDaysInPhase,
  estimatedDaysRemaining: propEstimatedDaysRemaining,
  trend: propTrend,
  trendValue: propTrendValue
}) => {
  // Derive props from seasons if not provided directly
  let currentPhase: VineyardPhase = propCurrentPhase || 'budbreak';
  let nextPhase: VineyardPhase = propNextPhase || 'flowering';
  let phaseProgress = propPhaseProgress || 65;
  let daysInPhase = propDaysInPhase || 12;
  let estimatedDaysRemaining = propEstimatedDaysRemaining || 6;
  let trend: 'earlier' | 'later' | 'on-track' = propTrend || 'earlier';
  let trendValue = propTrendValue || 3;
  let phaseHistory: PhaseEvent[] = propPhaseHistory || [];
  
  // If seasons are provided, derive values from them
  if (currentSeason && pastSeason) {
    // Find current phase from currentSeason
    const phases: VineyardPhase[] = ['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'];
    const currentPhaseEvent = currentSeason.events
      .filter(event => phases.includes(event.phase as VineyardPhase))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (currentPhaseEvent) {
      const currentPhaseIndex = phases.indexOf(currentPhaseEvent.phase as VineyardPhase);
      currentPhase = currentPhaseEvent.phase as VineyardPhase;
      nextPhase = phases[currentPhaseIndex + 1] || phases[0];
      
      // Calculate days in phase
      const currentDate = new Date();
      const phaseStartDate = new Date(currentPhaseEvent.date);
      daysInPhase = Math.floor((currentDate.getTime() - phaseStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use past season for comparison
      const pastPhaseEvent = pastSeason.events.find(event => event.phase === currentPhase);
      if (pastPhaseEvent) {
        const pastPhaseDate = new Date(pastPhaseEvent.date);
        const currentPhaseDate = new Date(currentPhaseEvent.date);
        
        const daysDifference = Math.floor((pastPhaseDate.getTime() - currentPhaseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 0) {
          trend = 'earlier';
          trendValue = daysDifference;
        } else if (daysDifference < 0) {
          trend = 'later';
          trendValue = Math.abs(daysDifference);
        } else {
          trend = 'on-track';
          trendValue = 0;
        }
      }
      
      // Get recent phase history
      phaseHistory = currentSeason.events
        .filter(event => phases.includes(event.phase as VineyardPhase))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
    }
  }

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
      case 'budbreak':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
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
              {phaseHistory.map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPhaseColor(event.phase as VineyardPhase)} capitalize`}>
                      {event.phase}
                    </Badge>
                    <span className="text-xs">{event.notes ? event.notes.substring(0, 20) + '...' : 'No notes'}</span>
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
