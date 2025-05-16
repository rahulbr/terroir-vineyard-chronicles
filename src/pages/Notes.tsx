
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NoteList } from '@/components/notes/NoteList';
import { NoteFilters } from '@/components/notes/NoteFilters';
import { NoteChatbot } from '@/components/notes/NoteChatbot';
import { notes, vineyardBlocks } from '@/data/mockData';
import { NoteItem } from '@/types';

const Notes = () => {
  const [filteredNotes, setFilteredNotes] = useState<NoteItem[]>(notes);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from notes
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const handleFilterChange = (blockId: string | null, tag: string | null) => {
    setSelectedBlock(blockId);
    setSelectedTag(tag);
    
    let filtered = [...notes];
    
    if (blockId) {
      filtered = filtered.filter(note => note.blockId === blockId);
    }
    
    if (tag) {
      filtered = filtered.filter(note => note.tags.includes(tag));
    }
    
    setFilteredNotes(filtered);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vineyard Notes</h1>
          <p className="text-muted-foreground">
            Record and query vineyard observations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NoteFilters 
              blocks={vineyardBlocks}
              tags={allTags}
              onFilterChange={handleFilterChange}
              selectedBlock={selectedBlock}
              selectedTag={selectedTag}
            />
            
            <NoteList notes={filteredNotes} blocks={vineyardBlocks} />
          </div>
          <div>
            <NoteChatbot />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notes;
