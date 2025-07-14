import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityFeed } from '@/components/activityFeed/ActivityFeed';

export default function Activities() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Track and manage all your vineyard activities and observations.
          </p>
        </div>

        <ActivityFeed />
      </div>
    </AppLayout>
  );
}