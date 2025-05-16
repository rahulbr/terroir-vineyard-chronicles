
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const VineyardMap: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vineyard Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
          {/* Map placeholder - in a real app, this would be an actual map component */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4/5 h-4/5 relative">
                {/* Block A */}
                <div 
                  className="absolute top-[10%] left-[20%] w-[25%] h-[35%] bg-red-200 rounded-md border-2 border-red-500 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  title="Block A - Pinot Noir"
                >
                  <span className="font-bold text-lg">A</span>
                </div>
                
                {/* Block B */}
                <div 
                  className="absolute top-[15%] right-[15%] w-[20%] h-[25%] bg-green-200 rounded-md border-2 border-green-500 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  title="Block B - Chardonnay"
                >
                  <span className="font-bold text-lg">B</span>
                </div>
                
                {/* Block C */}
                <div 
                  className="absolute bottom-[20%] left-[30%] w-[30%] h-[30%] bg-blue-200 rounded-md border-2 border-blue-500 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  title="Block C - Cabernet Sauvignon"
                >
                  <span className="font-bold text-lg">C</span>
                </div>
                
                {/* Block D */}
                <div 
                  className="absolute bottom-[15%] right-[20%] w-[15%] h-[20%] bg-purple-200 rounded-md border-2 border-purple-500 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  title="Block D - Syrah"
                >
                  <span className="font-bold text-lg">D</span>
                </div>
                
                {/* Winery */}
                <div 
                  className="absolute top-[60%] left-[10%] w-[10%] h-[15%] bg-gray-300 rounded-md border-2 border-gray-600 opacity-90 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  title="Winery"
                >
                  <span className="font-bold text-xs">Winery</span>
                </div>
                
                {/* North indicator */}
                <div className="absolute top-4 right-4 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-black"></div>
                  <span className="font-bold">N</span>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-200 border border-red-500"></div>
                    <span>Pinot Noir</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-200 border border-green-500"></div>
                    <span>Chardonnay</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-200 border border-blue-500"></div>
                    <span>Cabernet Sauvignon</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-200 border border-purple-500"></div>
                    <span>Syrah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
