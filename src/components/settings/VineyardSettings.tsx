
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewVineyardForm } from '@/components/vineyard/NewVineyardForm';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserVineyards, createVineyard } from '@/integrations/supabase/api';

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
  const [vineyardSites, setVineyardSites] = useState<VineyardSite[]>([]);
  const [selectedVineyard, setSelectedVineyard] = useState('');
  const [showNewVineyardForm, setShowNewVineyardForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load vineyards on component mount
  useEffect(() => {
    const loadVineyards = async () => {
      try {
        const vineyards = await getUserVineyards();
        
        // Convert Supabase data to VineyardSite format
        const formattedVineyards: VineyardSite[] = [
          ...defaultVineyardSites,
          ...vineyards.map(v => ({
            id: v.id,
            name: v.name,
            location: v.location,
            address: v.address || v.location,
            description: `Vineyard location at ${v.location}`,
            latitude: v.latitude ? Number(v.latitude) : undefined,
            longitude: v.longitude ? Number(v.longitude) : undefined,
          }))
        ];
        
        setVineyardSites(formattedVineyards);
        if (formattedVineyards.length > 0) {
          setSelectedVineyard(formattedVineyards[0].id);
        }
      } catch (error) {
        console.error('Error loading vineyards:', error);
        toast({
          title: "Error",
          description: "Failed to load vineyards. Using defaults.",
          variant: "destructive"
        });
        setVineyardSites(defaultVineyardSites);
        setSelectedVineyard(defaultVineyardSites[0].id);
      } finally {
        setLoading(false);
      }
    };

    loadVineyards();
  }, [toast]);

  const currentVineyard = vineyardSites.find(site => site.id === selectedVineyard) || vineyardSites[0];

  const handleNewVineyard = async (newVineyard: { name: string; address: string; latitude: number; longitude: number }) => {
    try {
      const savedVineyard = await createVineyard({
        name: newVineyard.name,
        location: newVineyard.address,
        latitude: newVineyard.latitude,
        longitude: newVineyard.longitude
      });

      const vineyardSite: VineyardSite = {
        id: savedVineyard[0].id,
        name: savedVineyard[0].name,
        location: savedVineyard[0].location,
        address: savedVineyard[0].address || savedVineyard[0].location,
        description: `Vineyard location at ${savedVineyard[0].location}`,
        latitude: savedVineyard[0].latitude ? Number(savedVineyard[0].latitude) : undefined,
        longitude: savedVineyard[0].longitude ? Number(savedVineyard[0].longitude) : undefined,
      };
      
      setVineyardSites(prev => [...prev, vineyardSite]);
      setSelectedVineyard(vineyardSite.id);
      setShowNewVineyardForm(false);
      
      toast({
        title: "Success",
        description: "Vineyard saved successfully!"
      });
    } catch (error) {
      console.error('Error saving vineyard:', error);
      toast({
        title: "Error",
        description: "Failed to save vineyard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVineyard = async (vineyardId: string) => {
    // Prevent deletion of design partner vineyards
    if (vineyardId === 'clos-de-la-tech' || vineyardId === 'thomas-fogarty') {
      toast({
        title: "Cannot Delete",
        description: "Design partner vineyards cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove from local state (you could add Supabase delete here if needed)
      setVineyardSites(prev => prev.filter(site => site.id !== vineyardId));
      
      // If we deleted the currently selected vineyard, select the first one
      if (selectedVineyard === vineyardId && vineyardSites.length > 1) {
        const remaining = vineyardSites.filter(site => site.id !== vineyardId);
        setSelectedVineyard(remaining[0].id);
      }
      
      toast({
        title: "Success",
        description: "Vineyard deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting vineyard:', error);
      toast({
        title: "Error",
        description: "Failed to delete vineyard.",
        variant: "destructive"
      });
    }
  };

  const handleVineyardChange = (value: string) => {
    if (value === 'new-vineyard') {
      setShowNewVineyardForm(true);
    } else {
      setSelectedVineyard(value);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading vineyards...</div>
        </CardContent>
      </Card>
    );
  }

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
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{site.name}</span>
                        {site.id !== 'clos-de-la-tech' && site.id !== 'thomas-fogarty' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVineyard(site.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
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
