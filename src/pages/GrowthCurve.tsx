
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

const GrowthCurve = () => {
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Growth Curve</h1>
        <div className="flex-1 w-full">
          <iframe
            src="https://reddy-ventures.metabaseapp.com/public/dashboard/5dd928e9-5563-4fc5-b222-7f66e627094a"
            frameBorder="0"
            width="100%"
            height="100%"
            className="min-h-[80vh] rounded-lg shadow-md"
            title="Growth Curve Dashboard"
            allowTransparency
          ></iframe>
        </div>
      </div>
    </AppLayout>
  );
};

export default GrowthCurve;
