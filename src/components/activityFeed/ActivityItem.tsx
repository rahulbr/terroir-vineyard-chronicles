
import React from 'react';
import { ActivityItem as ActivityItemType } from '@/types';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Book, TreeDeciduous, CloudSun, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityItemProps {
  activity: ActivityItemType;
  onDelete?: (activityId: string, activityType: string) => Promise<void>;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const getIcon = () => {
    switch (activity.iconType) {
      case 'pruning':
      case 'leafing':
        return <TreeDeciduous className="h-5 w-5 text-vineyard-leaf" />;
      case 'spraying':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vineyard-sky">
            <path d="M3 3v18h18" />
            <path d="M14 13v3c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-3" />
            <path d="M13 7.4v1.6c0 .6-.4 1-1 1H8c-.6 0-1-.4-1-1V7.4" />
            <path d="M15.4 15h2.8" />
            <path d="M16.8 10h1.4" />
            <path d="M15.4 5h2.8" />
            <path d="M10 7V3" />
          </svg>
        );
      case 'harvesting':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vineyard-gold">
            <path d="M17 3.34a10 10 0 1 1-14.83 8.32" />
            <path d="M4 15h8" />
            <path d="M13 7a2 2 0 0 0-2 2v12" />
            <path d="M13 19h8.5a2.5 2.5 0 0 0 0-5H13v2" />
          </svg>
        );
      case 'note':
        return <Book className="h-5 w-5 text-vineyard-soil" />;
      case 'weather':
        return <CloudSun className="h-5 w-5 text-vineyard-sky" />;
      case 'budbreak':
      case 'flowering':
      case 'fruitset': 
      case 'veraison':
      case 'harvest':
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vineyard-leaf/20 text-vineyard-leaf">
            <TreeDeciduous className="h-5 w-5" />
          </span>
        );
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActivityBg = () => {
    switch (activity.type) {
      case 'task':
        return 'bg-vineyard-leaf/10 border-vineyard-leaf/20';
      case 'note':
        return 'bg-vineyard-soil/10 border-vineyard-soil/20';
      case 'phase':
        return 'bg-vineyard-burgundy/10 border-vineyard-burgundy/20';
      case 'weather_alert':
        return 'bg-vineyard-sky/10 border-vineyard-sky/20';
      default:
        return 'bg-muted border-border';
    }
  };

  // Removed task actions as activities are logged as completed

  const getTypeBadge = () => {
    switch (activity.type) {
      case 'task':
        return <Badge variant="outline" className="bg-vineyard-leaf/30">Task</Badge>;
      case 'note':
        return <Badge variant="outline" className="bg-vineyard-soil/30">Note</Badge>;
      case 'phase':
        return <Badge variant="outline" className="bg-vineyard-burgundy/30">Growth Phase</Badge>;
      case 'weather_alert':
        return <Badge variant="outline" className="bg-vineyard-sky/30">Weather Alert</Badge>;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border flex gap-3", 
        getActivityBg()
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-foreground">{activity.title}</h4>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getTypeBadge()}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(activity.id, activity.type)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-muted-foreground">
            {format(parseISO(activity.date), 'MMM d, yyyy')}
            {activity.blockId && activity.blockId !== 'general' && (
              <span className="ml-2">• Block: {activity.blockId}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
