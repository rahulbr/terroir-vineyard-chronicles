
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { VineyardBlock } from '@/types';
import { X } from 'lucide-react';

interface NoteFiltersProps {
  blocks: VineyardBlock[];
  tags: string[];
  selectedBlock: string | null;
  selectedTag: string | null;
  onFilterChange: (blockId: string | null, tag: string | null) => void;
}

export const NoteFilters: React.FC<NoteFiltersProps> = ({ 
  blocks, 
  tags,
  selectedBlock, 
  selectedTag,
  onFilterChange 
}) => {
  const handleBlockChange = (value: string) => {
    onFilterChange(value === "all" ? null : value, selectedTag);
  };

  const handleTagChange = (value: string) => {
    onFilterChange(selectedBlock, value === "all" ? null : value);
  };

  const handleClearFilters = () => {
    onFilterChange(null, null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="block-filter">Filter by Block</Label>
            <Select
              value={selectedBlock || "all"}
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
          
          <div className="space-y-2">
            <Label htmlFor="tag-filter">Filter by Tag</Label>
            <Select
              value={selectedTag || "all"}
              onValueChange={handleTagChange}
            >
              <SelectTrigger id="tag-filter">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            {(selectedBlock || selectedTag) && (
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
