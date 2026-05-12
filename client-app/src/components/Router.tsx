import React, { createContext, useContext, useState, ReactNode } from 'react';

type Screen = 'home' | 'signup' | 'login' | 'forgot-password' | 'onboarding' | 'dashboard' | 'property-details' | 'renovation' | 'profile' | 'property-comparison' | 'mortgage-calculator' | 'schedule-visit' | 'notifications' | 'add-listing' | 'my-listings';

interface RouterContextType {
  currentScreen: Screen;
  navigate: (screen: Screen, data?: any) => void;
  screenData: any;
}

const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [screenData, setScreenData] = useState<any>(null);

  const navigate = (screen: Screen, data?: any) => {
    setCurrentScreen(screen);
    setScreenData(data);
  };

  return (
    <RouterContext.Provider value={{ currentScreen, navigate, screenData }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}