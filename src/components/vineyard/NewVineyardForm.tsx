
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewVineyardFormProps {
  onSave: (vineyard: { name: string; address: string; latitude: number; longitude: number }) => void;
  onCancel: () => void;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export const NewVineyardForm: React.FC<NewVineyardFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleGeocode = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to lookup",
        variant: "destructive"
      });
      return;
    }

    setGeocoding(true);
    try {
      // For now, simulate geocoding with a mock response
      // In production, this would call the Google Maps Geocoding API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock geocoding result - in production this would be from Google Maps API
      const mockResult: GeocodeResult = {
        latitude: 37.3387 + (Math.random() - 0.5) * 0.1,
        longitude: -122.0583 + (Math.random() - 0.5) * 0.1,
        formatted_address: address
      };
      
      setGeocodeResult(mockResult);
      toast({
        title: "Location Found",
        description: `Coordinates: ${mockResult.latitude.toFixed(4)}, ${mockResult.longitude.toFixed(4)}`
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Geocoding Failed",
        description: "Could not find coordinates for this address",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a vineyard name",
        variant: "destructive"
      });
      return;
    }

    if (!geocodeResult) {
      toast({
        title: "Location Required",
        description: "Please lookup the address first",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address: geocodeResult.formatted_address,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude
      });
      
      toast({
        title: "Vineyard Saved",
        description: `${name} has been added to your vineyards`
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Could not save the vineyard",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Add New Vineyard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vineyard-name">Vineyard Name</Label>
          <Input
            id="vineyard-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter vineyard name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vineyard-address">Address</Label>
          <div className="flex gap-2">
            <Input
              id="vineyard-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address (e.g., 123 Main St, Napa, CA)"
              className="flex-1"
            />
            <Button 
              onClick={handleGeocode}
              disabled={geocoding || !address.trim()}
              variant="outline"
            >
              {geocoding ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </div>

        {geocodeResult && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">Location Found:</p>
            <p className="text-sm text-muted-foreground">{geocodeResult.formatted_address}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {geocodeResult.latitude.toFixed(4)}, {geocodeResult.longitude.toFixed(4)}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !geocodeResult || !name.trim()}
            className="bg-vineyard-burgundy hover:bg-vineyard-burgundy/90"
          >
            {saving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Vineyard
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
