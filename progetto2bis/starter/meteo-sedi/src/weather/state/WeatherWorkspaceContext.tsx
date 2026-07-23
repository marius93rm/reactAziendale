/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useContext } from 'react';
import { officeSites } from '../sites';
import type { OfficeSite, TemperatureUnit } from '../weather.types';

type WeatherWorkspaceValue = {
  selectedSiteId: string;
  selectedSite: OfficeSite;
  temperatureUnit: TemperatureUnit;
  selectSite: (siteId: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
};

const WeatherWorkspaceContext = createContext<WeatherWorkspaceValue | null>(null);

/**
 * Lo starter espone il contratto del Context con valori iniziali sicuri.
 * I TODO del brief aggiungono stato, azioni e persistenza.
 */
export function WeatherWorkspaceProvider({ children }: { children: ReactNode }) {
  // TODO 2: creare lo stato condiviso e fornire un valore tipizzato.
  // TODO 3: implementare selectSite e setTemperatureUnit.
  // TODO 4: leggere e persistere preferenze valide in localStorage.
  const selectedSite = officeSites[0];
  const value: WeatherWorkspaceValue = {
    selectedSiteId: selectedSite.id,
    selectedSite,
    temperatureUnit: 'celsius',
    selectSite: () => undefined,
    setTemperatureUnit: () => undefined,
  };

  return (
    <WeatherWorkspaceContext.Provider value={value}>
      {children}
    </WeatherWorkspaceContext.Provider>
  );
}

export function useWeatherWorkspace() {
  // TODO 2: generare un errore esplicito quando manca il Provider.
  const context = useContext(WeatherWorkspaceContext);
  if (!context) {
    throw new Error('useWeatherWorkspace richiede WeatherWorkspaceProvider.');
  }
  return context;
}
