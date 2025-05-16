
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BlockList } from '@/components/blocks/BlockList';
import { BlockInsights } from '@/components/blocks/BlockInsights';
import { vineyardBlocks, activities } from '@/data/mockData';

const Blocks = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vineyard Blocks</h1>
          <p className="text-muted-foreground">
            Manage and monitor all vineyard blocks
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <BlockList blocks={vineyardBlocks} />
          </div>
          <div>
            <BlockInsights blocks={vineyardBlocks} activities={activities} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Blocks;
