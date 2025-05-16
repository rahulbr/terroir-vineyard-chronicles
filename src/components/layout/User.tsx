
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const User: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium leading-none">Jean Dupont</p>
        <p className="text-xs text-sidebar-foreground/70">Château Brilliance</p>
      </div>
    </div>
  );
};
