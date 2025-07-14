
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { VineyardMap } from '@/components/vineyard/VineyardMap';
import { VineyardStats } from '@/components/vineyard/VineyardStats';
import { VineyardBlocks } from '@/components/vineyard/VineyardBlocks';
import { VineyardSettings } from '@/components/vineyard/VineyardSettings';

const Vineyard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vineyard Overview</h1>
          <p className="text-muted-foreground">
            Domaine Valeta Estate
          </p>
        </div>
        
        <VineyardSettings />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <VineyardMap />
          </div>
          <div>
            <VineyardStats />
          </div>
        </div>
        
        <VineyardBlocks />
      </div>
    </AppLayout>
  );
};

export default Vineyard;
