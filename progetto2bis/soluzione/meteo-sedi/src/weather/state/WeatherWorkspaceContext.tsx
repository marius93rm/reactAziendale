/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { officeSites } from '../sites';
import type { OfficeSite, TemperatureUnit } from '../weather.types';

type WeatherWorkspaceValue = {
  selectedSiteId: string;
  selectedSite: OfficeSite;
  temperatureUnit: TemperatureUnit;
  selectSite: (siteId: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
};

type StoredPreferences = {
  selectedSiteId: string;
  temperatureUnit: TemperatureUnit;
};

type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const preferencesStorageKey = 'react-aziendale:meteo-sedi:preferences:v1';

const defaultPreferences: StoredPreferences = {
  selectedSiteId: officeSites[0].id,
  temperatureUnit: 'celsius',
};

const WeatherWorkspaceContext = createContext<WeatherWorkspaceValue | null>(null);

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === 'celsius' || value === 'fahrenheit';
}

function isKnownSiteId(value: unknown): value is string {
  return typeof value === 'string' && officeSites.some((site) => site.id === value);
}

function getBrowserStorage(): PreferencesStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Lo storage esterno non è affidabile: ogni campo viene validato. */
export function readPreferences(
  storage: PreferencesStorage | undefined = getBrowserStorage(),
): StoredPreferences {
  if (!storage) return defaultPreferences;

  try {
    const rawValue = storage.getItem(preferencesStorageKey);
    if (!rawValue) return defaultPreferences;
    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== 'object' || parsed === null) return defaultPreferences;

    const selectedSiteId = 'selectedSiteId' in parsed ? parsed.selectedSiteId : null;
    const temperatureUnit = 'temperatureUnit' in parsed ? parsed.temperatureUnit : null;

    return {
      selectedSiteId: isKnownSiteId(selectedSiteId)
        ? selectedSiteId
        : defaultPreferences.selectedSiteId,
      temperatureUnit: isTemperatureUnit(temperatureUnit)
        ? temperatureUnit
        : defaultPreferences.temperatureUnit,
    };
  } catch {
    return defaultPreferences;
  }
}

export function WeatherWorkspaceProvider({
  children,
  storage = getBrowserStorage(),
}: {
  children: ReactNode;
  storage?: PreferencesStorage;
}) {
  const [initialPreferences] = useState(() => readPreferences(storage));
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialPreferences.selectedSiteId,
  );
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>(
    initialPreferences.temperatureUnit,
  );

  const selectedSite =
    officeSites.find((site) => site.id === selectedSiteId) ?? officeSites[0];

  function selectSite(siteId: string) {
    if (isKnownSiteId(siteId)) setSelectedSiteId(siteId);
  }

  function setTemperatureUnit(unit: TemperatureUnit) {
    setTemperatureUnitState(unit);
  }

  // L'Effect sincronizza soltanto lo stato persistente con il sistema esterno.
  useEffect(() => {
    if (!storage) return;
    try {
      storage.setItem(
        preferencesStorageKey,
        JSON.stringify({ selectedSiteId, temperatureUnit }),
      );
    } catch {
      // L'app resta utilizzabile se il browser blocca o esaurisce lo storage.
    }
  }, [selectedSiteId, storage, temperatureUnit]);

  const value: WeatherWorkspaceValue = {
    selectedSiteId,
    selectedSite,
    temperatureUnit,
    selectSite,
    setTemperatureUnit,
  };

  return (
    <WeatherWorkspaceContext.Provider value={value}>
      {children}
    </WeatherWorkspaceContext.Provider>
  );
}

export function useWeatherWorkspace() {
  const context = useContext(WeatherWorkspaceContext);
  if (!context) {
    throw new Error('useWeatherWorkspace richiede WeatherWorkspaceProvider.');
  }
  return context;
}
