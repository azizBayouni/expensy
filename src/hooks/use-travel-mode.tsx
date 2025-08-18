
"use client";

import * as React from 'react';

type TravelModeState = {
  isActive: boolean;
  eventId: string | null;
  currency: string | null;
};

type TravelModeContextType = TravelModeState & {
  isLoaded: boolean;
  activate: (eventId: string, currency: string) => void;
  deactivate: () => void;
  setEventId: (eventId: string | null) => void;
  setCurrency: (currency: string | null) => void;
};

const TravelModeContext = React.createContext<TravelModeContextType | undefined>(undefined);

const TRAVEL_MODE_STORAGE_KEY = 'travelMode';

export const TravelModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [travelMode, setTravelMode] = React.useState<TravelModeState>({
    isActive: false,
    eventId: null,
    currency: null,
  });

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(TRAVEL_MODE_STORAGE_KEY);
      if (item) {
        setTravelMode(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleSetTravelMode = (newState: Partial<TravelModeState>) => {
    const updatedState = { ...travelMode, ...newState };
    setTravelMode(updatedState);
    try {
      window.localStorage.setItem(TRAVEL_MODE_STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  };

  const activate = (eventId: string, currency: string) => {
    handleSetTravelMode({ isActive: true, eventId, currency });
  };

  const deactivate = () => {
    handleSetTravelMode({ isActive: false, eventId: null, currency: null });
  };

  const setEventId = (eventId: string | null) => {
    handleSetTravelMode({ eventId });
  };

  const setCurrency = (currency: string | null) => {
    handleSetTravelMode({ currency });
  };

  return (
    <TravelModeContext.Provider value={{ ...travelMode, isLoaded, activate, deactivate, setEventId, setCurrency }}>
      {children}
    </TravelModeContext.Provider>
  );
};

export const useTravelMode = () => {
  const context = React.useContext(TravelModeContext);
  if (context === undefined) {
    throw new Error('useTravelMode must be used within a TravelModeProvider');
  }
  return context;
};
