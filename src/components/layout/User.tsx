
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const User: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>DG</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium leading-none">David Goldfarb</p>
        <p className="text-xs text-sidebar-foreground/70">Clos de la Tech</p>
      </div>
    </div>
  );
};
