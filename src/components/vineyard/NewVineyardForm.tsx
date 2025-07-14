
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geocodeAddress } from '@/services/geocodingService';

interface NewVineyardFormProps {
  onSave: (vineyard: { name: string; address: string; latitude: number; longitude: number }) => Promise<void>;
  onCancel: () => void;
}

export const NewVineyardForm: React.FC<NewVineyardFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const { toast } = useToast();

  const lookupLocation = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to lookup",
        variant: "destructive"
      });
      return;
    }

    setLookupLoading(true);
    try {
      console.log('Looking up address:', address);
      
      const result = await geocodeAddress(address.trim());
      
      setCoordinates({
        lat: result.lat,
        lon: result.lng
      });
      setFormattedAddress(result.formattedAddress);
      
      toast({
        title: "Location Found",
        description: `Coordinates: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Lookup Failed",
        description: error instanceof Error ? error.message : "Could not find coordinates for this address",
        variant: "destructive"
      });
    } finally {
      setLookupLoading(false);
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

    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address",
        variant: "destructive"
      });
      return;
    }

    if (!coordinates) {
      toast({
        title: "Location Required",
        description: "Please lookup the location first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        address: formattedAddress || address.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lon
      });
      
      toast({
        title: "Vineyard Added",
        description: `${name} has been added to your vineyard sites`
      });
    } catch (error) {
      console.error('Error saving vineyard:', error);
      toast({
        title: "Save Failed",
        description: "Could not save the vineyard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Vineyard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vineyard-name">Vineyard Name</Label>
            <Input
              id="vineyard-name"
              placeholder="Enter vineyard name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vineyard-address">Address</Label>
            <div className="flex gap-2">
              <Input
                id="vineyard-address"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={lookupLocation}
                disabled={lookupLoading || !address.trim()}
                variant="outline"
              >
                {lookupLoading ? (
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
            <p className="text-xs text-muted-foreground">
              Enter the full address and click "Lookup" to find coordinates
            </p>
          </div>
          
          {coordinates && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium">Location Found</p>
              {formattedAddress && (
                <p className="text-xs text-muted-foreground mb-1">
                  {formattedAddress}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Latitude: {coordinates.lat.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Longitude: {coordinates.lon.toFixed(6)}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !coordinates}
            className="bg-vineyard-burgundy hover:bg-vineyard-burgundy/90"
          >
            {loading ? 'Saving...' : 'Save Vineyard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
