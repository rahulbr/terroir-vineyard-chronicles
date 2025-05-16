
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export const IntegrationsSettings: React.FC = () => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Weather Services</h3>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">OpenWeatherMap API</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect to get real-time weather data and forecasts
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Connect</Button>
            </div>
            
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Label className="text-base">NOAA Weather API</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connected and active
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="noaa-api-key">API Key</Label>
                <Input id="noaa-api-key" type="password" value="••••••••••••••••" />
              </div>
              
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm">Refresh Key</Button>
                <Button variant="destructive" size="sm">Disconnect</Button>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Soil Monitoring</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">SensorLink API</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect to your soil moisture sensors
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Connect</Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Calendar & Task Management</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Google Calendar</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Sync tasks with your Google Calendar
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Connect</Button>
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Microsoft Outlook</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Sync tasks with your Outlook Calendar
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Connect</Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Analytics & Data Export</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Export to CSV</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Download your vineyard data as CSV files
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Export</Button>
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Google Analytics</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your vineyard app usage patterns
                </p>
              </div>
              <Button variant="outline" className="shrink-0">Setup</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
