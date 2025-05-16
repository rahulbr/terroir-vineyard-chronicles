
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { vineyardBlocks } from '@/data/mockData';

export const VineyardStats: React.FC = () => {
  // Calculate total area
  const totalArea = vineyardBlocks.reduce((sum, block) => sum + block.area, 0);
  
  // Calculate area by variety
  const areaByVariety = vineyardBlocks.reduce<Record<string, number>>((acc, block) => {
    if (!acc[block.variety]) {
      acc[block.variety] = 0;
    }
    acc[block.variety] += block.area;
    return acc;
  }, {});
  
  // Sort varieties by area
  const sortedVarieties = Object.entries(areaByVariety)
    .sort((a, b) => b[1] - a[1])
    .map(([variety, area]) => ({ variety, area }));
  
  // Calculate percentage for each variety
  const varietyPercentages = sortedVarieties.map(({ variety, area }) => ({
    variety,
    area,
    percentage: (area / totalArea) * 100
  }));
  
  // Mock production data
  const totalProduction = Math.round(totalArea * 3.5); // 3.5 tons per hectare on average
  const averageYield = (totalProduction / (totalArea * 2.47)).toFixed(2); // hectares to acres
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vineyard Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Area</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold">{totalArea.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">hectares</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {(totalArea * 2.47).toFixed(1)} acres
              </span>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Blocks</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold">{vineyardBlocks.length}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Across {Object.keys(areaByVariety).length} varieties
              </span>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Harvest</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold">{totalProduction}</span>
                <span className="text-muted-foreground ml-1">tons</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {averageYield} tons per acre
              </span>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg. Vine Age</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold">12</span>
                <span className="text-muted-foreground ml-1">years</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Oldest: 24 years (Block C)
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Variety Distribution</h3>
            <div className="space-y-3">
              {varietyPercentages.map(({ variety, area, percentage }) => (
                <div key={variety}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{variety}</span>
                    <span>{area.toFixed(1)} ha ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-vineyard-burgundy h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Vineyard Details</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Elevation:</span>
                <span>350 - 480m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soil Type:</span>
                <span>Volcanic & Limestone</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Climate Zone:</span>
                <span>Region II (Cool)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farming:</span>
                <span>Organic, Sustainable</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
