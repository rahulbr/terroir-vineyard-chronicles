
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season, PhaseEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface PhasesCardProps {
  currentSeason: Season;
  pastSeason: Season;
}

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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Growth Phases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allPhases.map((phase) => {
            const observed = observedPhases.includes(phase);
            const phaseEvent = currentSeason.events.find(e => e.phase === phase);
            const dateDiff = getDateDifference(phase);
            
            return (
              <div key={phase} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      observed ? "bg-vineyard-leaf" : "bg-gray-300"
                    )}
                  />
                  <span className="capitalize font-medium">{phase}</span>
                  {observed && (
                    <Badge variant="outline" className="ml-2">
                      {format(parseISO(phaseEvent!.date), 'MMM d, yyyy')}
                    </Badge>
                  )}
                </div>
                
                {dateDiff !== null && (
                  <span
                    className={cn(
                      "text-sm",
                      dateDiff < 0 
                        ? "text-green-600" 
                        : dateDiff > 0 
                          ? "text-red-600" 
                          : "text-gray-600"
                    )}
                  >
                    {dateDiff < 0 
                      ? `${Math.abs(dateDiff)} days earlier` 
                      : dateDiff > 0 
                        ? `${dateDiff} days later` 
                        : 'Same timing'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Next predicted phase: <span className="font-medium">Fruitset</span> around June 8-12</p>
        </div>
      </CardContent>
    </Card>
  );
};
