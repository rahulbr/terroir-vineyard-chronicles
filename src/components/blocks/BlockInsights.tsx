
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VineyardBlock, ActivityItem } from '@/types';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, subDays } from 'date-fns';

interface BlockInsightsProps {
  blocks: VineyardBlock[];
  activities: ActivityItem[];
}

export const BlockInsights: React.FC<BlockInsightsProps> = ({ blocks, activities }) => {
  // Calculate block statistics
  const blockStats = blocks.map(block => {
    // Convert hectares to acres
    const areaInAcres = (block.area * 2.47).toFixed(1);
    
    // Get activities for this block in the last 30 days
    const recentActivities = activities.filter(activity => 
      activity.blockId === block.id && 
      parseISO(activity.date) >= subDays(new Date(), 30)
    );

    // Calculate flowering percentage (mock data)
    let floweringPercent = 0;
    
    // For demonstration, we'll assign percentages based on variety
    if (block.variety === 'Pinot Noir') {
      floweringPercent = 85;
    } else if (block.variety === 'Chardonnay') {
      floweringPercent = 70;
    } else if (block.variety === 'Cabernet Sauvignon') {
      floweringPercent = 60;
    } else {
      floweringPercent = Math.floor(Math.random() * 40) + 50; // Random between 50-90%
    }

    // Recent tasks and notes count
    const taskCount = recentActivities.filter(a => a.type === 'task').length;
    const noteCount = recentActivities.filter(a => a.type === 'note').length;
    
    // Last year yield data (mock)
    const lastYieldTons = (block.area * 3.5 + Math.random()).toFixed(1);
    const tonsPerAcre = (Number(lastYieldTons) / Number(areaInAcres)).toFixed(2);
    
    return {
      id: block.id,
      name: block.name,
      variety: block.variety,
      floweringPercent,
      taskCount,
      noteCount,
      lastYieldTons,
      tonsPerAcre,
      areaInAcres
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Block Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {blockStats.map((stat) => (
            <div key={stat.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{stat.name}</h3>
                <span className="text-sm text-muted-foreground">{stat.variety}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Flowering Progress</span>
                    <span className="text-sm font-medium">{stat.floweringPercent}%</span>
                  </div>
                  <Progress value={stat.floweringPercent} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last Yield:</span> {stat.lastYieldTons} tons
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tons/Acre:</span> {stat.tonsPerAcre}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {stat.taskCount} Tasks
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs">
                    {stat.noteCount} Notes
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
