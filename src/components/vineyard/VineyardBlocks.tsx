
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { vineyardBlocks } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export const VineyardBlocks: React.FC = () => {
  // Add yield data to each block
  const blocksWithYield = vineyardBlocks.map(block => {
    // Mock yield data
    const yieldTons = (block.area * 3.5 + Math.random()).toFixed(1);
    const tonsPerAcre = (Number(yieldTons) / (block.area * 2.47)).toFixed(2);
    
    // Determined soil type by block ID (for demonstration)
    const soilTypes = ['Volcanic', 'Clay Loam', 'Sandy Loam', 'Limestone', 'Alluvial'];
    const soilType = soilTypes[parseInt(block.id) % soilTypes.length];
    
    // Mock clone data
    const clones = {
      'Pinot Noir': ['Dijon 115', 'Dijon 777', 'Pommard'],
      'Chardonnay': ['Dijon 76', 'Dijon 96', 'Clone 4'],
      'Cabernet Sauvignon': ['Clone 8', 'Clone 337', 'Clone 4'],
      'Syrah': ['Shiraz 1', 'Clone 877', 'Estrella River'],
      'Merlot': ['Clone 181', 'Clone 343', 'Clone 348']
    };
    
    const cloneIndex = parseInt(block.id) % (clones[block.variety as keyof typeof clones]?.length || 1);
    const clone = clones[block.variety as keyof typeof clones]?.[cloneIndex] || 'Unknown';
    
    return {
      ...block,
      yieldTons,
      tonsPerAcre,
      soilType,
      clone
    };
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vineyard Blocks Detail</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Block</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead className="hidden md:table-cell">Clone</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
              <TableHead className="hidden lg:table-cell">Soil</TableHead>
              <TableHead className="hidden lg:table-cell">Planted</TableHead>
              <TableHead>Last Yield</TableHead>
              <TableHead className="text-right">Tons/Acre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocksWithYield.map((block) => (
              <TableRow key={block.id}>
                <TableCell className="font-medium">{block.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      block.variety === 'Pinot Noir' ? 'border-red-500 text-red-700' :
                      block.variety === 'Chardonnay' ? 'border-green-500 text-green-700' :
                      block.variety === 'Cabernet Sauvignon' ? 'border-purple-500 text-purple-700' : 
                      'border-blue-500 text-blue-700'
                    }
                  >
                    {block.variety}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {block.clone}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {block.area.toFixed(1)} ha
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {block.soilType}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {block.planted}
                </TableCell>
                <TableCell>
                  {block.yieldTons} tons
                </TableCell>
                <TableCell className="text-right">
                  <span className={
                    Number(block.tonsPerAcre) > 4 ? 'text-green-600' :
                    Number(block.tonsPerAcre) < 3 ? 'text-amber-600' :
                    ''
                  }>
                    {block.tonsPerAcre}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
