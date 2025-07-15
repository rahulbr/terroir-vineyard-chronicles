import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewVineyardForm } from '@/components/vineyard/NewVineyardForm';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserVineyards, createVineyard, deleteVineyard } from '@/integrations/supabase/api';

interface VineyardSite {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

interface VineyardPreferences {
  selectedVineyardId: string;
  seasonStartDate: string;
  seasonEndDate: string;
  temperatureUnit: string;
  rainfallUnit: string;
  areaUnit: string;
  yieldUnit: string;
  gddBase: string;
  seasonYear: string;
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

const PREFERENCES_KEY = 'vineyard-preferences';

export const VineyardSettings: React.FC = () => {
  const [vineyardSites, setVineyardSites] = useState<VineyardSite[]>([]);
  const [showNewVineyardForm, setShowNewVineyardForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<VineyardPreferences>({
    selectedVineyardId: '',
    seasonStartDate: new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0], // April 1st
    seasonEndDate: new Date().toISOString().split('T')[0], // Today
    temperatureUnit: 'fahrenheit',
    rainfallUnit: 'inches',
    areaUnit: 'acres',
    yieldUnit: 'tons-acre',
    gddBase: '50',
    seasonYear: new Date().getFullYear().toString()
  });
  const { toast } = useToast();
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(prev => ({
        ...prev,
        ...parsed,
        seasonEndDate: new Date().toISOString().split('T')[0] // Always update end date to today
      }));
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: VineyardPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
  };
  
  // Load vineyards on component mount
  useEffect(() => {
    const loadVineyards = async () => {
      try {
        const vineyards = await getUserVineyards();
        
        // Convert Supabase data to VineyardSite format
        const formattedVineyards: VineyardSite[] = [
          ...defaultVineyardSites,
           ...vineyards.map(v => {
             // Clean up the display name - if name contains an address, try to extract a cleaner name
             let displayName = v.name;
             
             // If the name looks like an address (contains numbers and street indicators), use first part or fallback
             if (/\d+.*(?:rd|road|st|street|ave|avenue|blvd|boulevard|dr|drive|ln|lane|way|ct|court)/i.test(v.name)) {
               // Try to extract business name before the address, or use "Vineyard" as fallback
               const parts = v.name.split(/[,-]/);
               displayName = parts[0].trim() || "Custom Vineyard";
             }
             
             // If name is just a location like "La Honda, California", extract the first part
             if (v.name.includes(',') && !displayName.toLowerCase().includes('vineyard') && !displayName.toLowerCase().includes('winery')) {
               displayName = v.name.split(',')[0].trim();
             }
             
             return {
               id: v.id,
               name: displayName,
               location: v.location,
               address: v.address || v.location,
               description: `Vineyard location at ${v.location}`,
               latitude: v.latitude ? Number(v.latitude) : undefined,
               longitude: v.longitude ? Number(v.longitude) : undefined,
             };
           })
        ];
        
        setVineyardSites(formattedVineyards);
        
        // Set default vineyard if none selected
        if (!preferences.selectedVineyardId && formattedVineyards.length > 0) {
          const newPreferences = { ...preferences, selectedVineyardId: formattedVineyards[0].id };
          savePreferences(newPreferences);
        }
      } catch (error) {
        console.error('Error loading vineyards:', error);
        toast({
          title: "Error",
          description: "Failed to load vineyards. Using defaults.",
          variant: "destructive"
        });
        setVineyardSites(defaultVineyardSites);
        if (!preferences.selectedVineyardId) {
          const newPreferences = { ...preferences, selectedVineyardId: defaultVineyardSites[0].id };
          savePreferences(newPreferences);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVineyards();
  }, []);

  const currentVineyard = vineyardSites.find(site => site.id === preferences.selectedVineyardId) || vineyardSites[0];

  const handleNewVineyard = async (newVineyard: { name: string; address: string; latitude: number; longitude: number }) => {
    try {
      const savedVineyard = await createVineyard({
        name: newVineyard.name,
        location: newVineyard.address,
        latitude: newVineyard.latitude,
        longitude: newVineyard.longitude
      });

      const vineyardSite: VineyardSite = {
        id: savedVineyard.id,
        name: savedVineyard.name,
        location: savedVineyard.location,
        address: savedVineyard.address || savedVineyard.location,
        description: `Vineyard location at ${savedVineyard.location}`,
        latitude: savedVineyard.latitude ? Number(savedVineyard.latitude) : undefined,
        longitude: savedVineyard.longitude ? Number(savedVineyard.longitude) : undefined,
      };
      
      setVineyardSites(prev => [...prev, vineyardSite]);
      const newPreferences = { ...preferences, selectedVineyardId: vineyardSite.id };
      savePreferences(newPreferences);
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
      // Delete from database
      await deleteVineyard(vineyardId);
      
      // Remove from local state
      setVineyardSites(prev => prev.filter(site => site.id !== vineyardId));
      
      // If we deleted the currently selected vineyard, select the first one
      if (preferences.selectedVineyardId === vineyardId && vineyardSites.length > 1) {
        const remaining = vineyardSites.filter(site => site.id !== vineyardId);
        const newPreferences = { ...preferences, selectedVineyardId: remaining[0].id };
        savePreferences(newPreferences);
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
      const newPreferences = { ...preferences, selectedVineyardId: value };
      savePreferences(newPreferences);
    }
  };

  const handlePreferenceChange = (key: keyof VineyardPreferences, value: string) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your vineyard settings have been saved."
    });
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
      <CardContent className="pt-6">
        <Tabs defaultValue="vineyard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vineyard">Vineyard Selection</TabsTrigger>
            <TabsTrigger value="season">Season Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vineyard" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Vineyard Site Selection</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vineyard-site">Select Vineyard Site</Label>
                  <Select value={preferences.selectedVineyardId} onValueChange={handleVineyardChange}>
                    <SelectTrigger id="vineyard-site">
                      <SelectValue placeholder="Choose a vineyard site" />
                    </SelectTrigger>
                    <SelectContent>
                      {vineyardSites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
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
                
                {currentVineyard && (
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
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="season" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Growing Season</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season-start">Season Start Date</Label>
                  <Input 
                    id="season-start" 
                    type="date"
                    value={preferences.seasonStartDate}
                    onChange={(e) => handlePreferenceChange('seasonStartDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season-end">Season End Date</Label>
                  <Input 
                    id="season-end" 
                    type="date"
                    value={preferences.seasonEndDate}
                    onChange={(e) => handlePreferenceChange('seasonEndDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season-year">Current Season Year</Label>
                  <Input 
                    id="season-year" 
                    value={preferences.seasonYear}
                    onChange={(e) => handlePreferenceChange('seasonYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gdd-base">GDD Base Temperature</Label>
                  <Input 
                    id="gdd-base" 
                    value={preferences.gddBase}
                    onChange={(e) => handlePreferenceChange('gddBase', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Base temperature in °F for Growing Degree Days calculation</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Unit Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature-unit">Temperature</Label>
                  <Select 
                    value={preferences.temperatureUnit} 
                    onValueChange={(value) => handlePreferenceChange('temperatureUnit', value)}
                  >
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
                  <Select 
                    value={preferences.rainfallUnit}
                    onValueChange={(value) => handlePreferenceChange('rainfallUnit', value)}
                  >
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
                  <Select 
                    value={preferences.areaUnit}
                    onValueChange={(value) => handlePreferenceChange('areaUnit', value)}
                  >
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
                  <Select 
                    value={preferences.yieldUnit}
                    onValueChange={(value) => handlePreferenceChange('yieldUnit', value)}
                  >
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings}>Save Vineyard Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};