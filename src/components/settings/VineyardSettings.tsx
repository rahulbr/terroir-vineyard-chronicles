
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewVineyardForm } from '@/components/vineyard/NewVineyardForm';
import { Plus } from 'lucide-react';

interface VineyardSite {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

const defaultVineyardSites: VineyardSite[] = [
  {
    id: 'clos-de-la-tech',
    name: 'Clos de la Tech',
    location: 'La Honda, CA',
    address: '1000 Fern Hollow Road, La Honda, CA',
    description: 'Cool-climate vineyard in the Santa Cruz Mountains, specializing in Pinot Noir and Chardonnay with sustainable farming practices.',
    latitude: 37.3387,
    longitude: -122.0583
  },
  {
    id: 'thomas-fogarty',
    name: 'Thomas Fogarty Winery',
    location: 'Woodside, CA',
    address: '19501 Skyline Blvd, Woodside, CA 94062',
    description: 'Mountain vineyard with panoramic views, focusing on premium Chardonnay and Pinot Noir production.',
    latitude: 37.4419,
    longitude: -122.2419
  }
];

export const VineyardSettings: React.FC = () => {
  const [vineyardSites, setVineyardSites] = useState<VineyardSite[]>(defaultVineyardSites);
  const [selectedVineyard, setSelectedVineyard] = useState(vineyardSites[0].id);
  const [showNewVineyardForm, setShowNewVineyardForm] = useState(false);
  
  const currentVineyard = vineyardSites.find(site => site.id === selectedVineyard) || vineyardSites[0];

  const handleNewVineyard = async (newVineyard: { name: string; address: string; latitude: number; longitude: number }) => {
    const vineyardSite: VineyardSite = {
      id: `vineyard-${Date.now()}`,
      name: newVineyard.name,
      location: newVineyard.address.split(',').slice(-2).join(',').trim(), // Extract city, state
      address: newVineyard.address,
      description: `Custom vineyard location at ${newVineyard.address}`,
      latitude: newVineyard.latitude,
      longitude: newVineyard.longitude
    };
    
    setVineyardSites(prev => [...prev, vineyardSite]);
    setSelectedVineyard(vineyardSite.id);
    setShowNewVineyardForm(false);
  };

  const handleVineyardChange = (value: string) => {
    if (value === 'new-vineyard') {
      setShowNewVineyardForm(true);
    } else {
      setSelectedVineyard(value);
    }
  };

  if (showNewVineyardForm) {
    return (
      <NewVineyardForm
        onSave={handleNewVineyard}
        onCancel={() => setShowNewVineyardForm(false)}
      />
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Vineyard Site Selection</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vineyard-site">Select Vineyard Site</Label>
              <Select value={selectedVineyard} onValueChange={handleVineyardChange}>
                <SelectTrigger id="vineyard-site">
                  <SelectValue placeholder="Choose a vineyard site" />
                </SelectTrigger>
                <SelectContent>
                  {vineyardSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{site.name}</span>
                        <span className="text-sm text-muted-foreground">{site.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="new-vineyard">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Add New Vineyard</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vineyard-name">Vineyard Name</Label>
                <Input id="vineyard-name" value={currentVineyard.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vineyard-location">Location</Label>
                <Input id="vineyard-location" value={currentVineyard.location} readOnly />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vineyard-address">Address</Label>
                <Input id="vineyard-address" value={currentVineyard.address} readOnly />
              </div>
              {currentVineyard.latitude && currentVineyard.longitude && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vineyard-coordinates">Coordinates</Label>
                  <Input 
                    id="vineyard-coordinates" 
                    value={`${currentVineyard.latitude.toFixed(4)}, ${currentVineyard.longitude.toFixed(4)}`}
                    readOnly 
                  />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vineyard-description">Description</Label>
                <Textarea 
                  id="vineyard-description" 
                  rows={3}
                  value={currentVineyard.description}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Unit Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature-unit">Temperature</Label>
              <Select defaultValue="fahrenheit">
                <SelectTrigger id="temperature-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rainfall-unit">Rainfall</Label>
              <Select defaultValue="inches">
                <SelectTrigger id="rainfall-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">Inches</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area-unit">Area</Label>
              <Select defaultValue="acres">
                <SelectTrigger id="area-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="hectares">Hectares</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yield-unit">Yield</Label>
              <Select defaultValue="tons-acre">
                <SelectTrigger id="yield-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tons-acre">Tons/Acre</SelectItem>
                  <SelectItem value="tons-hectare">Tons/Hectare</SelectItem>
                  <SelectItem value="kg-hectare">kg/Hectare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Growing Season</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season-year">Current Season Year</Label>
              <Input id="season-year" value="2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdd-base">GDD Base Temperature</Label>
              <Input id="gdd-base" value="50" />
              <p className="text-xs text-muted-foreground">Base temperature in °F for Growing Degree Days calculation</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button>Save Vineyard Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};
