import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TreeDeciduous, MapPin, Book, Calendar, Settings, BarChart } from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    name: 'Blocks',
    path: '/blocks',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    name: 'Tasks',
    path: '/tasks',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: 'Notes',
    path: '/notes',
    icon: <Book className="h-5 w-5" />,
  },
  {
    name: 'Vineyard',
    path: '/vineyard',
    icon: <TreeDeciduous className="h-5 w-5" />,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export const NavigationMenu: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'flex items-center px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors',
            location.pathname === item.path && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          )}
        >
          <span className="mr-3">{item.icon}</span>
          {item.name}
        </Link>
      ))}
    </nav>
  );
};