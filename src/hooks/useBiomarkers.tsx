
import { useState, useEffect } from 'react';
import { BIOMARKER_RANGES, BiomarkerRange } from '@/utils/diagnosticUtils';
import { useToast } from '@/hooks/use-toast';
import { biomarkerDataService } from '@/services/biomarkerDataService';

export interface BiomarkerState {
  id: string;
  value: number;
  range: BiomarkerRange;
}

export const useBiomarkers = () => {
  const { toast } = useToast();
  const [biomarkers, setBiomarkers] = useState<BiomarkerState[]>([]);
  const [customBiomarkers, setCustomBiomarkers] = useState<Record<string, BiomarkerRange>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Initialize with data from the service
  useEffect(() => {
    const loadBiomarkers = async () => {
      setIsLoading(true);
      try {
        // Fetch ranges from the service
        const ranges = await biomarkerDataService.getBiomarkerRanges();
        const updatedAt = await biomarkerDataService.getLastUpdated();
        
        // If we got data from the service, use it
        if (Object.keys(ranges).length > 0) {
          const initialBiomarkers = Object.entries(ranges).map(([id, range]) => ({
            id,
            value: id === 'CEA' ? 1.5 : id === 'HER2' ? 1 : id === 'ER' ? 80 : id === 'PR' ? 60 : id === 'CTCs' ? 0 : 10,
            range
          }));
          
          setBiomarkers(initialBiomarkers);
          setLastUpdated(updatedAt);
          
          toast({
            title: "Biomarker data loaded",
            description: "Latest research data has been loaded successfully",
          });
        } else {
          // Fallback to hardcoded data
          const initialBiomarkers = Object.entries(BIOMARKER_RANGES).map(([id, range]) => ({
            id,
            value: id === 'CEA' ? 1.5 : id === 'HER2' ? 1 : id === 'ER' ? 80 : id === 'PR' ? 60 : id === 'CTCs' ? 0 : 10,
            range
          }));
          
          setBiomarkers(initialBiomarkers);
          
          toast({
            title: "Using default data",
            description: "Could not fetch latest research data, using default values",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading biomarker data:", error);
        // Fallback to hardcoded data
        const initialBiomarkers = Object.entries(BIOMARKER_RANGES).map(([id, range]) => ({
          id,
          value: id === 'CEA' ? 1.5 : id === 'HER2' ? 1 : id === 'ER' ? 80 : id === 'PR' ? 60 : id === 'CTCs' ? 0 : 10,
          range
        }));
        
        setBiomarkers(initialBiomarkers);
        
        toast({
          title: "Data loading error",
          description: "Failed to load latest research data, using default values",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBiomarkers();
  }, [toast]);
  
  // Refresh biomarker data from research sources
  const refreshBiomarkerData = async () => {
    setIsLoading(true);
    try {
      await biomarkerDataService.refreshCache();
      const ranges = await biomarkerDataService.getBiomarkerRanges();
      const updatedAt = await biomarkerDataService.getLastUpdated();
      
      // Update biomarkers with new ranges while preserving current values
      setBiomarkers(prev => 
        prev.map(bm => {
          if (ranges[bm.id]) {
            return { ...bm, range: ranges[bm.id] };
          }
          return bm;
        })
      );
      
      setLastUpdated(updatedAt);
      
      toast({
        title: "Data refreshed",
        description: "Biomarker reference data has been updated with the latest research",
      });
    } catch (error) {
      console.error("Error refreshing biomarker data:", error);
      toast({
        title: "Refresh failed",
        description: "Failed to update biomarker data from research sources",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new biomarker
  const addBiomarker = (newBiomarker: BiomarkerRange) => {
    const id = newBiomarker.name.replace(/\s+/g, '_').toUpperCase();
    
    // Check if biomarker with same ID already exists
    if (biomarkers.some(bm => bm.id === id) || customBiomarkers[id]) {
      toast({
        title: "Biomarker already exists",
        description: `A biomarker with name ${newBiomarker.name} already exists.`,
        variant: "destructive"
      });
      return false;
    }
    
    // Add to custom biomarkers
    setCustomBiomarkers(prev => ({
      ...prev,
      [id]: newBiomarker
    }));
    
    // Add to biomarkers state
    setBiomarkers(prev => [
      ...prev,
      {
        id,
        value: 0,
        range: newBiomarker
      }
    ]);
    
    toast({
      title: "Biomarker added",
      description: `${newBiomarker.name} has been added to the diagnostic panel.`
    });
    
    return true;
  };
  
  // Update biomarker value
  const updateBiomarkerValue = (id: string, value: number) => {
    setBiomarkers(prev => 
      prev.map(bm => bm.id === id ? { ...bm, value } : bm)
    );
  };
  
  // Remove a custom biomarker
  const removeBiomarker = (id: string) => {
    // Only allow removing custom biomarkers
    if (!customBiomarkers[id]) {
      toast({
        title: "Cannot remove",
        description: "Standard biomarkers cannot be removed from the panel.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove from custom biomarkers
    setCustomBiomarkers(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    
    // Remove from biomarkers state
    setBiomarkers(prev => prev.filter(bm => bm.id !== id));
    
    toast({
      title: "Biomarker removed",
      description: `${customBiomarkers[id].name} has been removed from the panel.`
    });
  };
  
  // Get biomarker values for submission
  const getBiomarkerValues = () => {
    return biomarkers.map(bm => ({
      id: bm.id,
      value: bm.value
    }));
  };
  
  return {
    biomarkers,
    addBiomarker,
    updateBiomarkerValue,
    removeBiomarker,
    getBiomarkerValues,
    customBiomarkers,
    isLoading,
    lastUpdated,
    refreshBiomarkerData
  };
};
