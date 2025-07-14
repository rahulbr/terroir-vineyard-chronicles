import { useState, useEffect } from 'react';
import { getUserVineyards } from '@/integrations/supabase/api';
import { useAuth } from './useAuth';

export type Vineyard = {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export const useVineyard = () => {
  const { user } = useAuth();
  const [currentVineyard, setCurrentVineyard] = useState<Vineyard | null>(null);
  const [vineyards, setVineyards] = useState<Vineyard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCurrentVineyard(null);
      setVineyards([]);
      setLoading(false);
      return;
    }

    const fetchVineyards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserVineyards();
        setVineyards(data);
        
        // Set the first vineyard as current if none is selected
        if (data.length > 0 && !currentVineyard) {
          setCurrentVineyard(data[0]);
        }
      } catch (err: any) {
        console.error('Error fetching vineyards:', err);
        setError(err.message || 'Failed to fetch vineyards');
      } finally {
        setLoading(false);
      }
    };

    fetchVineyards();
  }, [user]);

  const refreshVineyards = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const data = await getUserVineyards();
      setVineyards(data);
      
      // Update current vineyard if it still exists
      if (currentVineyard) {
        const updatedVineyard = data.find(v => v.id === currentVineyard.id);
        if (updatedVineyard) {
          setCurrentVineyard(updatedVineyard);
        } else if (data.length > 0) {
          setCurrentVineyard(data[0]);
        } else {
          setCurrentVineyard(null);
        }
      } else if (data.length > 0) {
        setCurrentVineyard(data[0]);
      }
    } catch (err: any) {
      console.error('Error refreshing vineyards:', err);
      setError(err.message || 'Failed to refresh vineyards');
    }
  };

  return {
    currentVineyard,
    vineyards,
    loading,
    error,
    setCurrentVineyard,
    refreshVineyards,
    hasVineyard: vineyards.length > 0,
    isAuthenticated: !!user
  };
};