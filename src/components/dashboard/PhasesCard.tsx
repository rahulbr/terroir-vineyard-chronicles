
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season, PhaseEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface PhasesCardProps {
  currentSeason: Season;
  pastSeason: Season;
}

// Helper function to get expected end date based on phase type
const getExpectedEndDate = (startDate: string, phase: PhaseEvent['phase']): string => {
  // Different phases have different typical durations
  const phaseDurations: Record<PhaseEvent['phase'], number> = {
    'budbreak': 14, // 2 weeks
    'flowering': 10, // 10 days
    'fruitset': 7, // 1 week
    'veraison': 21, // 3 weeks
    'harvest': 30, // variable but using 30 days as placeholder
    'other': 7 // default 1 week
  };
  
  const duration = phaseDurations[phase] || 7;
  const endDate = addDays(parseISO(startDate), duration);
  return format(endDate, 'MMM d, yyyy');
};

// Helper to get the phase comparison text
const getPhaseComparisonText = (currentDate: string, pastDate: string): string => {
  const currentDateObj = parseISO(currentDate);
  const pastDateObj = parseISO(pastDate);
  
  // Get current day/month and past day/month
  const currentDayMonth = new Date(2000, currentDateObj.getMonth(), currentDateObj.getDate());
  const pastDayMonth = new Date(2000, pastDateObj.getMonth(), pastDateObj.getDate());
  
  // Calculate difference in days, ignoring year
  const diffDays = differenceInDays(currentDayMonth, pastDayMonth);
  
  if (diffDays === 0) {
    return `Same timing as ${pastDateObj.getFullYear()}`;
  } else if (diffDays < 0) {
    return `${Math.abs(diffDays)} days later than ${pastDateObj.getFullYear()}`;
  } else {
    return `${diffDays} days earlier than ${pastDateObj.getFullYear()}`;
  }
};

export const PhasesCard: React.FC<PhasesCardProps> = ({ currentSeason, pastSeason }) => {
  // All growth phases in order
  const allPhases: Array<PhaseEvent['phase']> = ['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'];
  
  // Current observed phases
  const observedPhases = currentSeason.events
    .filter(event => allPhases.includes(event.phase))
    .map(event => event.phase);
  
  // Get date difference between years for the same phase
  const getDateDifference = (phase: PhaseEvent['phase']): string | null => {
    const currentPhaseEvent = currentSeason.events.find(e => e.phase === phase);
    const pastPhaseEvent = pastSeason.events.find(e => e.phase === phase);
    
    if (!currentPhaseEvent || !pastPhaseEvent) return null;
    
    return getPhaseComparisonText(currentPhaseEvent.date, pastPhaseEvent.date);
  };

  // Check if a phase is currently in progress (has started but not ended)
  const isPhaseInProgress = (phase: PhaseEvent['phase']): boolean => {
    return observedPhases.includes(phase);
  };

  // Check if a date is in the past
  const isInPast = (dateStr: string): boolean => {
    const date = parseISO(dateStr);
    return date < new Date(2025, 4, 16); // May 16, 2025
  };

  // Function to get the end date for a phase
  const getPhaseEndDate = (phase: PhaseEvent['phase']): string | null => {
    const phaseEvent = currentSeason.events.find(e => e.phase === phase);
    if (!phaseEvent) return null;
    
    // For completed phases, use actual end date if available
    if (phase === 'budbreak') {
      return '2025-04-11'; // hardcoded end date for bud break
    }
    
    return getExpectedEndDate(phaseEvent.date, phase);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Growth Phases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {allPhases.map((phase) => {
            const observed = observedPhases.includes(phase);
            const phaseEvent = currentSeason.events.find(e => e.phase === phase);
            const comparisonText = getDateDifference(phase);
            const inProgress = isPhaseInProgress(phase);
            const endDate = getPhaseEndDate(phase);
            
            if (!observed) {
              // Don't show anything for phases that haven't started yet
              return (
                <div key={phase} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="capitalize font-medium text-gray-400">{phase}</span>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={phase} className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        observed ? "bg-vineyard-leaf" : "bg-gray-300"
                      )}
                    />
                    <span className="capitalize font-medium">{phase}</span>
                  </div>
                </div>
                
                {/* Date information for observed phases */}
                {observed && (
                  <div className="pl-6 space-y-1">
                    {phase === 'budbreak' ? (
                      <>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-1">
                            Mar 28 - Apr 11 2025
                          </Badge>
                        </div>
                        {comparisonText && (
                          <div>
                            <span className="text-sm font-medium text-vineyard-leaf">
                              {comparisonText}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Start:</span>
                          <Badge variant="outline">
                            {format(parseISO(phaseEvent!.date), 'MMM d, yyyy')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">End:</span>
                          <Badge variant="outline" className="text-vineyard-burgundy">
                            {inProgress 
                              ? (isInPast(endDate!) || phase === 'budbreak')
                                ? format(parseISO(endDate!), 'MMM d, yyyy')
                                : `Expected: ${format(parseISO(endDate!), 'MMM d, yyyy')}`
                              : "Completed"}
                          </Badge>
                        </div>
                        
                        {comparisonText && (
                          <div className="mt-1">
                            <span className="text-sm font-medium text-vineyard-leaf">
                              {comparisonText}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
