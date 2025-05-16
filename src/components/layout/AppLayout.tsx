
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NavigationMenu } from '@/components/layout/NavigationMenu';
import { User } from '@/components/layout/User';
import { Grape, TreeDeciduous, MapPin, Book, Calendar, Settings } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold text-sidebar-foreground flex items-center">
              <Grape className="h-6 w-6 mr-2" />
              Vigneron.AI
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <NavigationMenu />
          </SidebarContent>
          <SidebarFooter className="p-4">
            <User />
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile top navigation */}
      <div className="md:hidden bg-vineyard-burgundy text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Grape className="h-6 w-6 mr-2" />
          Vigneron.AI
        </h2>
        <Button variant="ghost" className="p-1" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
