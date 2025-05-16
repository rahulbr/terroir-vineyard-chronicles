
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const NotificationSettings: React.FC = () => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-tasks" className="text-base cursor-pointer">Task Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when tasks are assigned to you
                </p>
              </div>
              <Switch id="email-tasks" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notes" className="text-base cursor-pointer">Note Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when you're mentioned in a note
                </p>
              </div>
              <Switch id="email-notes" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-weather" className="text-base cursor-pointer">Weather Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for extreme weather conditions
                </p>
              </div>
              <Switch id="email-weather" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-phases" className="text-base cursor-pointer">Growth Phase Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for vineyard growth phase changes
                </p>
              </div>
              <Switch id="email-phases" defaultChecked />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Mobile Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobile-tasks" className="text-base cursor-pointer">Task Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Push notifications for new task assignments
                </p>
              </div>
              <Switch id="mobile-tasks" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobile-notes" className="text-base cursor-pointer">Note Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  Push notifications when you're mentioned in a note
                </p>
              </div>
              <Switch id="mobile-notes" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobile-weather" className="text-base cursor-pointer">Weather Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Push notifications for extreme weather conditions
                </p>
              </div>
              <Switch id="mobile-weather" />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-end">
          <Button>Save Notification Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};
