
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartLine } from 'lucide-react';

interface PredictionsCardProps {
  harvestDate: string;
  diseaseRisk: {
    powderyMildew: string;
    downyMildew: string;
    botrytis: string;
  };
  recommendations: string[];
}

export const PredictionsCard: React.FC<PredictionsCardProps> = ({
  harvestDate,
  diseaseRisk,
  recommendations
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5" />
          AI Predictions & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Projected Harvest Date</h3>
            <p className="text-lg text-vineyard-burgundy font-medium">{harvestDate}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Disease Risk</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 p-2 rounded-md text-center">
                <p className="text-sm">Powdery Mildew</p>
                <p className={`font-medium ${
                  diseaseRisk.powderyMildew === 'High' ? 'text-red-600' :
                  diseaseRisk.powderyMildew === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {diseaseRisk.powderyMildew}
                </p>
              </div>
              <div className="bg-muted/50 p-2 rounded-md text-center">
                <p className="text-sm">Downy Mildew</p>
                <p className={`font-medium ${
                  diseaseRisk.downyMildew === 'High' ? 'text-red-600' :
                  diseaseRisk.downyMildew === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {diseaseRisk.downyMildew}
                </p>
              </div>
              <div className="bg-muted/50 p-2 rounded-md text-center">
                <p className="text-sm">Botrytis</p>
                <p className={`font-medium ${
                  diseaseRisk.botrytis === 'High' ? 'text-red-600' :
                  diseaseRisk.botrytis === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {diseaseRisk.botrytis}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Recommendations</h3>
            <Alert className="bg-vineyard-leaf/10 border-vineyard-leaf">
              <AlertTitle>Priority Action</AlertTitle>
              <AlertDescription>
                {recommendations[0]}
              </AlertDescription>
            </Alert>
            <ul className="mt-3 space-y-2">
              {recommendations.slice(1).map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-vineyard-leaf">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
