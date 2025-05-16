
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export const VineyardMap: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vineyard Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
          {/* Google Maps style background */}
          <div className="absolute inset-0 bg-[#e8eaed] overflow-hidden">
            
            {/* Road grid pattern */}
            <div className="absolute inset-0">
              {/* Horizontal roads */}
              <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-gray-300"></div>
              <div className="absolute top-[50%] left-0 right-0 h-[4px] bg-gray-400"></div>
              <div className="absolute top-[75%] left-0 right-0 h-[2px] bg-gray-300"></div>
              
              {/* Vertical roads */}
              <div className="absolute left-[30%] top-0 bottom-0 w-[2px] bg-gray-300"></div>
              <div className="absolute left-[60%] top-0 bottom-0 w-[2px] bg-gray-300"></div>
            </div>
            
            {/* Land parcels */}
            <div className="absolute inset-0">
              {/* Background terrain colors */}
              <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#c5e0b4] rounded-sm"></div>
              <div className="absolute top-[15%] right-[15%] w-[25%] h-[40%] bg-[#c5e0b4] rounded-sm"></div>
              <div className="absolute bottom-[15%] left-[20%] w-[40%] h-[30%] bg-[#c5e0b4] rounded-sm"></div>
              <div className="absolute top-[55%] right-[25%] w-[20%] h-[25%] bg-[#c5e0b4] rounded-sm"></div>
            </div>
            
            {/* Water feature */}
            <div className="absolute top-[65%] left-[5%] right-[80%] bottom-[10%] bg-[#a5c8e1] rounded-sm"></div>
            
            {/* Vineyard blocks overlay with realistic borders */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4/5 h-4/5 relative">
                {/* Block A */}
                <div 
                  className="absolute top-[15%] left-[20%] w-[25%] h-[35%] rounded-md border-2 border-red-500 bg-red-200/60 hover:bg-red-200/80 transition-colors cursor-pointer flex items-center justify-center group"
                  title="Block A - Pinot Noir"
                >
                  <div className="bg-white/90 px-2 py-1 rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="font-bold text-sm">Block A</span>
                    <div className="text-xs">Pinot Noir • 5.4 acres</div>
                  </div>
                </div>
                
                {/* Block B */}
                <div 
                  className="absolute top-[15%] right-[15%] w-[20%] h-[25%] rounded-md border-2 border-green-500 bg-green-200/60 hover:bg-green-200/80 transition-colors cursor-pointer flex items-center justify-center group"
                  title="Block B - Chardonnay"
                >
                  <div className="bg-white/90 px-2 py-1 rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="font-bold text-sm">Block B</span>
                    <div className="text-xs">Chardonnay • 3.7 acres</div>
                  </div>
                </div>
                
                {/* Block C */}
                <div 
                  className="absolute bottom-[20%] left-[25%] w-[30%] h-[30%] rounded-md border-2 border-blue-500 bg-blue-200/60 hover:bg-blue-200/80 transition-colors cursor-pointer flex items-center justify-center group"
                  title="Block C - Cabernet Sauvignon"
                >
                  <div className="bg-white/90 px-2 py-1 rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="font-bold text-sm">Block C</span>
                    <div className="text-xs">Cabernet • 6.2 acres</div>
                  </div>
                </div>
                
                {/* Block D */}
                <div 
                  className="absolute bottom-[15%] right-[20%] w-[15%] h-[20%] rounded-md border-2 border-purple-500 bg-purple-200/60 hover:bg-purple-200/80 transition-colors cursor-pointer flex items-center justify-center group"
                  title="Block D - Syrah"
                >
                  <div className="bg-white/90 px-2 py-1 rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="font-bold text-sm">Block D</span>
                    <div className="text-xs">Syrah • 2.5 acres</div>
                  </div>
                </div>
                
                {/* Winery location */}
                <div 
                  className="absolute top-[60%] left-[10%] flex flex-col items-center"
                  title="Winery"
                >
                  <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <MapPin className="text-vineyard-burgundy h-5 w-5" />
                  </div>
                  <div className="bg-white mt-1 px-2 py-1 rounded text-xs shadow-sm">
                    Winery
                  </div>
                </div>
                
                {/* North indicator */}
                <div className="absolute top-4 right-4 bg-white rounded-full h-8 w-8 shadow-md flex flex-col items-center justify-center">
                  <div className="font-bold text-sm">N</div>
                </div>
                
                {/* Scale indicator */}
                <div className="absolute bottom-2 left-2 bg-white/80 p-1 rounded text-xs flex items-center space-x-1">
                  <div className="h-1 w-10 bg-black"></div>
                  <span>100m</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map UI controls to make it look like Google Maps */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <div className="bg-white rounded-md shadow-md p-1">
              <div className="flex flex-col">
                <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-sm">+</button>
                <div className="w-6 h-[1px] bg-gray-200"></div>
                <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-sm">−</button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
