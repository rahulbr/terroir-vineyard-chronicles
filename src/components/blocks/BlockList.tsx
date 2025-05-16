
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VineyardBlock } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface BlockListProps {
  blocks: VineyardBlock[];
}

export const BlockList: React.FC<BlockListProps> = ({ blocks }) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vineyard Blocks</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blocks.map((block) => (
            <div key={block.id} className="border rounded-md p-4 hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="h-10 w-10 rounded-full mr-3 bg-cover bg-center"
                    style={{ 
                      backgroundImage: block.imageUrl 
                        ? `url(${block.imageUrl})` 
                        : "url(/placeholder.svg)" 
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{block.name}</h3>
                    <p className="text-sm text-muted-foreground">{block.variety}</p>
                  </div>
                </div>
                <Badge className="bg-vineyard-burgundy hover:bg-vineyard-burgundy/80">
                  {block.area.toFixed(1)} ha
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Planted:</span> {block.planted}
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span> {block.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
