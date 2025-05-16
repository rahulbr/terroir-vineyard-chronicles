
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const User: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="/lovable-uploads/38f69fef-9099-4dc0-b72d-3b094728c03d.png" alt="David Goldfarb" />
        <AvatarFallback>DG</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium leading-none">David Goldfarb</p>
        <p className="text-xs text-sidebar-foreground/70">Clos de la Tech</p>
      </div>
    </div>
  );
};
