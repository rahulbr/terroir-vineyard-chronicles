
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season, PhaseEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarX } from 'lucide-react';

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

export const PhasesCard: React.FC<PhasesCardProps> = ({ currentSeason, pastSeason }) => {
  // All growth phases in order
  const allPhases: Array<PhaseEvent['phase']> = ['budbreak', 'flowering', 'fruitset', 'veraison', 'harvest'];
  
  // Current observed phases
  const observedPhases = currentSeason.events
    .filter(event => allPhases.includes(event.phase))
    .map(event => event.phase);
  
  // Get date difference between years for the same phase
  const getDateDifference = (phase: PhaseEvent['phase']): number | null => {
    const currentPhaseEvent = currentSeason.events.find(e => e.phase === phase);
    const pastPhaseEvent = pastSeason.events.find(e => e.phase === phase);
    
    if (!currentPhaseEvent || !pastPhaseEvent) return null;
    
    const currentDate = parseISO(currentPhaseEvent.date);
    const pastDate = parseISO(pastPhaseEvent.date);
    
    // Calculate days difference
    const diffTime = currentDate.getTime() - pastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Check if a phase is currently in progress (has started but not ended)
  const isPhaseInProgress = (phase: PhaseEvent['phase']): boolean => {
    return observedPhases.includes(phase);
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
            const dateDiff = getDateDifference(phase);
            const inProgress = isPhaseInProgress(phase);
            
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
                          ? `Expected: ${getExpectedEndDate(phaseEvent!.date, phase)}` 
                          : "Completed"}
                      </Badge>
                    </div>
                    
                    {dateDiff !== null && (
                      <div className="mt-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            dateDiff < 0 
                              ? "text-green-600" 
                              : dateDiff > 0 
                                ? "text-red-600" 
                                : "text-gray-600"
                          )}
                        >
                          {dateDiff < 0 
                            ? `${Math.abs(dateDiff)} days earlier than ${pastSeason.year}` 
                            : dateDiff > 0 
                              ? `${dateDiff} days later than ${pastSeason.year}` 
                              : `Same timing as ${pastSeason.year}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
          <CalendarX className="h-4 w-4 text-vineyard-burgundy" />
          <p>Next predicted phase: <span className="font-medium">Fruitset</span> around June 8-12</p>
        </div>
      </CardContent>
    </Card>
  );
};
