
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSettings } from '@/components/settings/UserSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { VineyardSettings } from '@/components/settings/VineyardSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and vineyard preferences
          </p>
        </div>
        
        <Tabs defaultValue="user">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user">User Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="vineyard">Vineyard</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="user" className="mt-6">
            <UserSettings />
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="vineyard" className="mt-6">
            <VineyardSettings />
          </TabsContent>
          <TabsContent value="integrations" className="mt-6">
            <IntegrationsSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
