
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { VineyardBlock } from '@/types';
import { X } from 'lucide-react';

interface TaskFiltersProps {
  blocks: VineyardBlock[];
  selectedCategory: string | null;
  selectedBlock: string | null;
  onFilterChange: (category: string | null, blockId: string | null) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ 
  blocks, 
  selectedCategory, 
  selectedBlock,
  onFilterChange 
}) => {
  const categories = [
    { value: 'pruning', label: 'Pruning' },
    { value: 'spraying', label: 'Spraying' },
    { value: 'leafing', label: 'Leafing' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'planting', label: 'Planting' },
    { value: 'other', label: 'Other' }
  ];

  const handleCategoryChange = (value: string) => {
    onFilterChange(value || null, selectedBlock);
  };

  const handleBlockChange = (value: string) => {
    onFilterChange(selectedCategory, value || null);
  };

  const handleClearFilters = () => {
    onFilterChange(null, null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select
              value={selectedCategory || undefined}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="block-filter">Filter by Block</Label>
            <Select
              value={selectedBlock || undefined}
              onValueChange={handleBlockChange}
            >
              <SelectTrigger id="block-filter">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            {(selectedCategory || selectedBlock) && (
              <Button variant="outline" onClick={handleClearFilters} className="space-x-1">
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
