import React from 'react';
import { ActivityLogger } from '@/components/activities/ActivityLogger';
import { TaskItem, NoteItem, VineyardBlock, PhaseEvent } from '@/types';

interface QuickActionsProps {
  blocks: VineyardBlock[];
  vineyardId?: string;
  onAddTask?: (task: TaskItem) => void;
  onAddNote?: (note: NoteItem) => void;
  onRecordPhase?: (phase: PhaseEvent) => void;
  currentPhase?: string;
  nextPhase?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAddTask
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <ActivityLogger onActivityLogged={() => {
        // Refresh activities after logging
        onAddTask?.({
          id: `temp-${Date.now()}`,
          title: 'Activity Logged',
          description: 'New activity has been logged',
          blockId: 'general',
          date: new Date().toISOString().split('T')[0],
          completed: true,
          category: 'other'
        });
      }} />
    </div>
  );
};