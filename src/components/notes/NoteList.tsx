
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoteItem, VineyardBlock } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Tag } from 'lucide-react';

interface NoteListProps {
  notes: NoteItem[];
  blocks: VineyardBlock[];
}

// Mock data for authors
const authors = {
  '1': { name: 'David Goldfarb', avatar: '/images/david.jpg', initials: 'DG' },
  '2': { name: 'Abel Martinez', avatar: '/placeholder.svg', initials: 'AM' },
  '3': { name: 'Rahul Patel', avatar: '/placeholder.svg', initials: 'RP' },
  '4': { name: 'Julio Rodriguez', avatar: '/placeholder.svg', initials: 'JR' }
};

// Function to assign notes to authors deterministically based on note ID
const getAuthorForNote = (noteId: string) => {
  const authorIds = Object.keys(authors);
  const idSum = noteId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const authorIndex = idSum % authorIds.length;
  const authorId = authorIds[authorIndex];
  return authors[authorId as keyof typeof authors];
};

export const NoteList: React.FC<NoteListProps> = ({ notes, blocks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vineyard Notes ({notes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notes found with the selected filters.
            </div>
          ) : (
            notes.map((note) => {
              const block = blocks.find(b => b.id === note.blockId);
              const author = getAuthorForNote(note.id);
              
              return (
                <div key={note.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{author.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(note.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm mt-1 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{block?.name || 'Unknown Block'}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4">{note.content}</p>
                  
                  {note.images && note.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {note.images.map((image, index) => (
                        <div 
                          key={index}
                          className="aspect-square rounded-md bg-muted bg-cover bg-center"
                          style={{ backgroundImage: `url(${image})` }}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
